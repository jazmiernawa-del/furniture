-- ===========================================================================
-- Furniture (rental app)
-- Migration 0005: wishlist / favorites
-- ===========================================================================

create table if not exists public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

create policy "favorites: read own"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "favorites: insert own"
  on public.favorites for insert
  with check (user_id = auth.uid());

create policy "favorites: delete own"
  on public.favorites for delete
  using (user_id = auth.uid());
