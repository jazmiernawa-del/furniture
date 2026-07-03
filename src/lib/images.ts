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

/** A soft placeholder used when a product has no image of its own. */
export const fallbackProductImage = u("1594620302200-9a762244a156", 1200);
