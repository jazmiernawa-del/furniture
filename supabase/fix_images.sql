-- ===========================================================================
-- Correct catalog images: replace mismatched / non-furniture photos with
-- verified Unsplash furniture shots that match each item's category & name.
-- Safe to re-run.
-- ===========================================================================

update public.product_images pi set url = v.url
from (values
  -- Beds
  ('linnea-oak-bed',                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'),
  ('sereno-upholstered-bed',        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'),
  -- Chairs
  ('ember-leather-lounge-chair',    'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=1200&q=80'),
  ('otto-lounge-chair',             'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=1200&q=80'),
  ('rousseau-accent-chair',         'https://images.unsplash.com/photo-1611967164521-abae8fba4668?auto=format&fit=crop&w=1200&q=80'),
  -- Lighting
  ('halo-arc-floor-lamp',           'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80'),
  -- Sofas
  ('como-sectional-sofa',           'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80'),
  ('marlow-linen-sofa',             'https://images.unsplash.com/photo-1512212621149-107ffe572d2f?auto=format&fit=crop&w=1200&q=80'),
  -- Storage
  ('meridian-shelving',             'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80'),
  -- Tables
  ('faye-oak-dining-table',         'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'),
  ('lucienne-marble-dining-table',  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'),
  ('sol-oak-coffee-table',          'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80')
) as v(slug, url)
join public.products p on p.slug = v.slug
where pi.product_id = p.id;
