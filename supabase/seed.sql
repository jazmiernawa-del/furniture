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
  ('marlow-linen-sofa',          'https://images.unsplash.com/photo-1512212621149-107ffe572d2f?auto=format&fit=crop&w=1200&q=80'),
  ('aria-boucle-armchair',       'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'),
  ('nova-walnut-dining-table',   'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80'),
  ('halden-platform-bed',        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'),
  ('ember-leather-lounge-chair', 'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=1200&q=80'),
  ('sol-oak-coffee-table',       'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80'),
  ('kepler-modular-bookshelf',   'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1200&q=80'),
  ('atlas-standing-desk',        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.products p on p.slug = v.slug
on conflict do nothing;
