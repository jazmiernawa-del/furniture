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
