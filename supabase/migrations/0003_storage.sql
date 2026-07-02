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
