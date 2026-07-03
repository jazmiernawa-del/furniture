-- ============================================================
-- Furniture — complete setup (migrations 0001-0003 + seed data)
-- Paste this whole file into the Supabase SQL Editor and Run.
-- ============================================================

-- ===========================================================================
-- Furniture (rental app) — core schema
-- Migration 0001: extensions, enums, tables, indexes, triggers, constraints
-- ===========================================================================

-- --- Extensions ------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist";  -- equality in GiST exclusion

-- --- Enums -----------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create type product_condition as enum ('new', 'like_new', 'good', 'fair');

create type product_status as enum ('active', 'archived');

create type billing_period as enum ('weekly', 'monthly');

-- Lifecycle: pending -> confirmed -> delivered -> active -> returned/overdue
--            (or cancelled at any point before delivery)
create type order_status as enum (
  'pending',
  'confirmed',
  'delivered',
  'active',
  'returned',
  'overdue',
  'cancelled'
);

create type payment_type as enum ('rental_fee', 'deposit', 'delivery_fee');

create type payment_status as enum (
  'pending',
  'paid',
  'refunded',
  'partially_refunded',
  'failed'
);

-- --- Shared trigger: keep updated_at fresh ---------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- profiles  (1:1 with auth.users)
-- ===========================================================================
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  phone              text,
  role               user_role not null default 'customer',
  stripe_customer_id text unique,
  default_address    jsonb,          -- { line1, line2, city, state, postal_code, country }
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- products
-- Each product is a single rentable unit; double-booking is prevented at the
-- database level via the exclusion constraint on `bookings` (see below).
-- ===========================================================================
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  category     text not null,
  style        text,
  description  text,
  condition    product_condition not null default 'good',
  monthly_rate numeric(10, 2) not null check (monthly_rate >= 0),
  weekly_rate  numeric(10, 2) check (weekly_rate >= 0),
  deposit      numeric(10, 2) not null default 0 check (deposit >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  status       product_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_status_idx   on public.products (status);
create index products_style_idx    on public.products (style);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- --- product_images --------------------------------------------------------
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,           -- Supabase Storage public URL or path
  alt        text,
  position   int  not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id);
-- At most one primary image per product.
create unique index product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary;

-- ===========================================================================
-- rental_orders
-- ===========================================================================
create table public.rental_orders (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references public.profiles (id) on delete restrict,
  status                     order_status not null default 'pending',
  billing_period             billing_period not null,
  start_date                 date not null,
  end_date                   date not null,   -- exclusive: pickup day
  delivery_date              date,
  delivery_address           jsonb,
  delivery_contact_name      text,
  delivery_contact_phone     text,
  notes                      text,
  subtotal                   numeric(10, 2) not null default 0,  -- sum of rental fees
  deposit_total              numeric(10, 2) not null default 0,
  delivery_fee               numeric(10, 2) not null default 0,
  total                      numeric(10, 2) not null default 0,
  currency                   text not null default 'usd',
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  stripe_subscription_id     text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint rental_orders_date_order check (end_date > start_date)
);

create index rental_orders_user_idx   on public.rental_orders (user_id);
create index rental_orders_status_idx on public.rental_orders (status);

create trigger rental_orders_set_updated_at
  before update on public.rental_orders
  for each row execute function public.set_updated_at();

-- --- order_items -----------------------------------------------------------
-- Snapshots of product + pricing at time of order so history is stable even
-- if the product later changes or is archived.
create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.rental_orders (id) on delete cascade,
  product_id     uuid not null references public.products (id) on delete restrict,
  product_name   text not null,
  billing_period billing_period not null,
  rate           numeric(10, 2) not null check (rate >= 0),  -- per-period snapshot
  periods        int not null default 1 check (periods >= 1), -- weeks or months
  deposit        numeric(10, 2) not null default 0 check (deposit >= 0),
  start_date     date not null,
  end_date       date not null,
  line_total     numeric(10, 2) not null check (line_total >= 0),
  created_at     timestamptz not null default now(),
  constraint order_items_date_order check (end_date > start_date)
);

create index order_items_order_idx   on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ===========================================================================
-- bookings
-- Source of truth for availability. One row per occupied date range for a
-- product. Rentals create rows automatically; admins can also add manual
-- blocks (maintenance, etc.) with a null order_item_id.
--
-- The EXCLUDE constraint makes overlapping ranges for the same product
-- physically impossible — the database itself prevents double-booking.
-- `during` is a half-open range [start_date, end_date): the end date is the
-- pickup day and is free for a new rental to start on.
-- ===========================================================================
create table public.bookings (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete cascade,
  during        daterange not null,
  reason        text not null default 'rental',  -- 'rental' | 'maintenance' | 'blocked'
  created_at    timestamptz not null default now(),
  constraint bookings_no_overlap
    exclude using gist (product_id with =, during with &&)
);

create index bookings_product_idx on public.bookings (product_id);
create index bookings_during_idx  on public.bookings using gist (during);

-- ===========================================================================
-- payments
-- ===========================================================================
create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references public.rental_orders (id) on delete cascade,
  type                     payment_type not null,
  amount                   numeric(10, 2) not null check (amount >= 0),
  currency                 text not null default 'usd',
  status                   payment_status not null default 'pending',
  refunded_amount          numeric(10, 2) not null default 0 check (refunded_amount >= 0),
  stripe_payment_intent_id text,
  stripe_refund_id         text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index payments_order_idx on public.payments (order_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();


-- ===========================================================================
-- Furniture (rental app)
-- Migration 0002: helper functions + Row Level Security policies
-- ===========================================================================

-- --- Helper: is the current user an admin? ---------------------------------
-- SECURITY DEFINER so it can read profiles without tripping the profiles RLS
-- policy (which would otherwise cause infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- --- Helper: prevent customers from escalating their own role --------------
create or replace function public.enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change a user role';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.enforce_role_change();

-- --- Helper: availability check (used by product pages & checkout) ---------
-- Returns true if `p_product` has NO booking overlapping the half-open
-- range [p_start, p_end).
create or replace function public.is_product_available(
  p_product uuid,
  p_start   date,
  p_end     date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_end > p_start
     and not exists (
       select 1
       from public.bookings b
       where b.product_id = p_product
         and b.during && daterange(p_start, p_end, '[)')
     );
$$;

-- ===========================================================================
-- Enable RLS everywhere
-- ===========================================================================
alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.rental_orders  enable row level security;
alter table public.order_items    enable row level security;
alter table public.bookings       enable row level security;
alter table public.payments       enable row level security;

-- ===========================================================================
-- profiles
-- ===========================================================================
create policy "profiles: read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: insert own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles: update own or admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ===========================================================================
-- products  (public catalog reads active items; admins manage everything)
-- ===========================================================================
create policy "products: public read active"
  on public.products for select
  using (status = 'active' or public.is_admin());

create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- ===========================================================================
-- product_images
-- ===========================================================================
create policy "product_images: public read"
  on public.product_images for select
  using (true);

create policy "product_images: admin write"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- rental_orders  (owners see their own; admins see all)
-- ===========================================================================
create policy "rental_orders: read own or admin"
  on public.rental_orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "rental_orders: insert own"
  on public.rental_orders for insert
  with check (user_id = auth.uid());

create policy "rental_orders: update own or admin"
  on public.rental_orders for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "rental_orders: admin delete"
  on public.rental_orders for delete
  using (public.is_admin());

-- ===========================================================================
-- order_items  (visible/insertable through the parent order)
-- ===========================================================================
create policy "order_items: read via parent order"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.rental_orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items: insert via own order"
  on public.order_items for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.rental_orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items: admin update"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items: admin delete"
  on public.order_items for delete
  using (public.is_admin());

-- ===========================================================================
-- bookings  (public read for availability; only admins/service role write)
-- ===========================================================================
create policy "bookings: public read"
  on public.bookings for select
  using (true);

create policy "bookings: admin write"
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- payments  (visible through the parent order; only admins/service role write)
-- ===========================================================================
create policy "payments: read via parent order"
  on public.payments for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.rental_orders o
      where o.id = payments.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "payments: admin write"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());


-- ===========================================================================
-- Furniture (rental app)
-- Migration 0003: Storage bucket for product images
-- ===========================================================================

-- Public bucket so product images can be served directly on the catalog.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone may read product images (public bucket).
create policy "product images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins may upload / modify / delete product images.
create policy "product images: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product images: admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());


-- ===========================================================================
-- Furniture (rental app) — sample catalog data
-- Run AFTER the migrations. Safe to re-run (upserts by slug).
-- Images use Unsplash; swap for Supabase Storage uploads via the admin panel.
-- ===========================================================================

insert into public.products
  (name, slug, category, style, description, condition, monthly_rate, weekly_rate, deposit, delivery_fee)
values
  ('Marlow Linen Sofa', 'marlow-linen-sofa', 'Sofas', 'Modern',
   'A deep three-seater in oatmeal linen with feather-blend cushions. The centerpiece your living room has been missing.',
   'like_new', 129.00, 39.00, 250.00, 49.00),

  ('Aria Boucle Armchair', 'aria-boucle-armchair', 'Chairs', 'Scandinavian',
   'Sculptural curves in soft ivory boucle on solid oak legs. Equal parts art and comfort.',
   'new', 59.00, 19.00, 120.00, 29.00),

  ('Nova Walnut Dining Table', 'nova-walnut-dining-table', 'Tables', 'Mid-Century',
   'Seats six around a warm walnut top with tapered legs. Built for long dinners and slow mornings.',
   'good', 89.00, 27.00, 200.00, 59.00),

  ('Halden Platform Bed', 'halden-platform-bed', 'Beds', 'Minimalist',
   'Low-profile queen frame in white oak with an upholstered headboard. Calm, grounded, effortless.',
   'like_new', 99.00, 30.00, 220.00, 59.00),

  ('Ember Leather Lounge Chair', 'ember-leather-lounge-chair', 'Chairs', 'Industrial',
   'Full-grain cognac leather over a blackened steel frame. Ages beautifully, sits even better.',
   'good', 75.00, 24.00, 180.00, 39.00),

  ('Sol Oak Coffee Table', 'sol-oak-coffee-table', 'Tables', 'Scandinavian',
   'A rounded oak coffee table with a lower shelf for books and blankets. Friendly, functional, timeless.',
   'new', 45.00, 15.00, 90.00, 29.00),

  ('Kepler Modular Bookshelf', 'kepler-modular-bookshelf', 'Storage', 'Modern',
   'Six-cube open shelving in matte black. Reconfigures with your space and your ambitions.',
   'good', 55.00, 18.00, 110.00, 39.00),

  ('Atlas Standing Desk', 'atlas-standing-desk', 'Desks', 'Modern',
   'Electric sit-stand desk with a bamboo top and programmable height presets. Work, your way.',
   'like_new', 69.00, 22.00, 150.00, 39.00)
on conflict (slug) do nothing;

-- --- Primary images --------------------------------------------------------
insert into public.product_images (product_id, url, alt, position, is_primary)
select p.id, v.url, p.name, 0, true
from (values
  ('marlow-linen-sofa',          'https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&w=1200&q=80'),
  ('aria-boucle-armchair',       'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'),
  ('nova-walnut-dining-table',   'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80'),
  ('halden-platform-bed',        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'),
  ('ember-leather-lounge-chair', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'),
  ('sol-oak-coffee-table',       'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1200&q=80'),
  ('kepler-modular-bookshelf',   'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1200&q=80'),
  ('atlas-standing-desk',        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.products p on p.slug = v.slug
on conflict do nothing;
