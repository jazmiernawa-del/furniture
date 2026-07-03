/**
 * Curated real furniture / interior photography from Unsplash.
 *
 * These are direct Unsplash CDN URLs (no API key required) and are already
 * allowed in next.config.ts. To fetch dynamically via the Unsplash API instead,
 * add an access key and swap these for API results — the shape stays the same.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const luxeImages = {
  /** Full-bleed cinematic hero — warm styled living room. */
  hero: u("1616486338812-3dadae4b4ace", 2000),
  /** Moody vertical interior for the login split-screen. */
  authPortrait: u("1505693416388-ac5ce068fe85", 1400),
  /** Editorial lifestyle band. */
  lifestyle: u("1617806118233-18e1de247200", 2000),
  /** Secondary feature image. */
  feature: u("1550226891-ef816aed4a98", 1600),
  /** Dashboard concierge banner. */
  concierge: u("1567538096630-e0c55bd6374c", 1600),
} as const;

/** Full-screen hero slideshow frames (cinematic interiors). */
export const heroSlides = [
  u("1616486338812-3dadae4b4ace", 2000),
  u("1617806118233-18e1de247200", 2000),
  u("1505693416388-ac5ce068fe85", 2000),
  u("1550226891-ef816aed4a98", 2000),
];

/** Framed carousel — furniture close-ups for the philosophy section. */
export const featureSlides = [
  u("1550226891-ef816aed4a98", 1600),
  u("1567538096630-e0c55bd6374c", 1600),
  u("1586023492125-27b2c045efd7", 1600),
  u("1499933374294-4584851497cc", 1600),
];

/** Real-life customer room setups (interior photography). */
export const roomImages = [
  u("1493663284031-b7e3aefcae8e", 1200),
  u("1522708323590-d24dbb6b0267", 1200),
  u("1513519245088-0e12902e5a38", 1200),
  u("1449247709967-d4461a6a6103", 1200),
  u("1519710164239-da123dc03ef4", 1200),
  u("1560448204-e02f11c3d0e2", 1200),
];

/** Auto-playing slideshow behind the login / auth screens. */
export const loginSlides = [
  u("1616486338812-3dadae4b4ace", 1600),
  u("1617806118233-18e1de247200", 1600),
  u("1505693416388-ac5ce068fe85", 1600),
  u("1550226891-ef816aed4a98", 1600),
  u("1524758631624-e2822e304c36", 1600),
];

/** A soft placeholder used when a product has no image of its own. */
export const fallbackProductImage = u("1594620302200-9a762244a156", 1200);
