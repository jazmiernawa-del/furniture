/**
 * Centralized, validated access to environment variables.
 *
 * Import from here instead of reading `process.env.*` directly so that a
 * missing/misconfigured value fails loudly and in one place.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.local.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Variables safe to read on both the client and the server. */
export const publicEnv = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  productBucket:
    process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? "product-images",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/**
 * Server-only variables. Reading `serverEnv` from client code will throw
 * because the values are `undefined` in the browser bundle.
 */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
};
