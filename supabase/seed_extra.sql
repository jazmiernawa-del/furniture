-- ===========================================================================
-- Furniture — additional catalog (10 luxury pieces). Safe to re-run.
-- ===========================================================================

insert into public.products
  (name, slug, category, style, description, condition, monthly_rate, weekly_rate, deposit, delivery_fee)
values
  ('Belgrave Velvet Sofa', 'belgrave-velvet-sofa', 'Sofas', 'Contemporary',
   'A four-seater in deep emerald velvet with a low, sculptural profile. Made for slow evenings and long conversations.',
   'like_new', 149.00, 45.00, 275.00, 59.00),

  ('Como Sectional Sofa', 'como-sectional-sofa', 'Sofas', 'Modern',
   'A generous modular sectional in stone-grey weave. Reconfigure it to suit any room, any gathering.',
   'good', 179.00, 55.00, 320.00, 69.00),

  ('Faye Oak Dining Table', 'faye-oak-dining-table', 'Tables', 'Scandinavian',
   'Solid white oak with softly rounded edges, seating six. Understated craftsmanship for everyday rituals.',
   'new', 95.00, 29.00, 210.00, 59.00),

  ('Lucienne Marble Dining Table', 'lucienne-marble-dining-table', 'Tables', 'Modern',
   'A honed Carrara marble top on a slim brass base. Quietly dramatic, endlessly elegant.',
   'like_new', 139.00, 42.00, 300.00, 69.00),

  ('Sereno Upholstered Bed', 'sereno-upholstered-bed', 'Beds', 'Contemporary',
   'A king platform bed wrapped in warm bouclé with a soft channel-tufted headboard. Serenity, upholstered.',
   'like_new', 119.00, 36.00, 240.00, 59.00),

  ('Linnea Oak Bed', 'linnea-oak-bed', 'Beds', 'Minimalist',
   'A pared-back oak frame with a floating headboard. Calm lines for a restful room.',
   'good', 105.00, 32.00, 220.00, 59.00),

  ('Rousseau Accent Chair', 'rousseau-accent-chair', 'Chairs', 'Mid-Century',
   'A tailored accent chair in camel wool on splayed walnut legs. A perfect reading-corner companion.',
   'good', 55.00, 18.00, 110.00, 29.00),

  ('Otto Lounge Chair', 'otto-lounge-chair', 'Chairs', 'Modern',
   'A cocooning lounge chair with a swivel base and plush shearling seat. Comfort as sculpture.',
   'new', 79.00, 25.00, 170.00, 39.00),

  ('Halo Arc Floor Lamp', 'halo-arc-floor-lamp', 'Lighting', 'Modern',
   'A sweeping brushed-brass arc with a marble foot, casting a warm, gallery-soft glow.',
   'new', 35.00, 12.00, 70.00, 25.00),

  ('Meridian Shelving', 'meridian-shelving', 'Storage', 'Modern',
   'An open blackened-steel and oak shelving system. Architectural storage for books and objets.',
   'good', 65.00, 20.00, 130.00, 39.00)
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, alt, position, is_primary)
select p.id, v.url, p.name, 0, true
from (values
  ('belgrave-velvet-sofa',          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'),
  ('como-sectional-sofa',           'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80'),
  ('faye-oak-dining-table',         'https://images.unsplash.com/photo-1526057565006-20beab8dd2ed?auto=format&fit=crop&w=1200&q=80'),
  ('lucienne-marble-dining-table',  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'),
  ('sereno-upholstered-bed',        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80'),
  ('linnea-oak-bed',                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'),
  ('rousseau-accent-chair',         'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'),
  ('otto-lounge-chair',             'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'),
  ('halo-arc-floor-lamp',           'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80'),
  ('meridian-shelving',             'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.products p on p.slug = v.slug
on conflict do nothing;
