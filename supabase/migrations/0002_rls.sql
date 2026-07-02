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
