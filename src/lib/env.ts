/**
 * Centralized access to environment variables.
 *
 * Public values are read leniently so the app can still render a "connect
 * Supabase" state before credentials exist. Use `isSupabaseConfigured()` to
 * branch. Server-only secrets throw if read while missing.
 */

/** Variables safe to read on both the client and the server. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  productBucket:
    process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? "product-images",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** True when the public Supabase URL + anon key are both present. */
export function isSupabaseConfigured(): boolean {
  return (
    publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0
  );
}

/** Throws a clear error if Supabase public config is missing. */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and " +
        "set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

/**
 * Server-only variables. Reading these from client code, or before they are
 * set, throws.
 */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) {
      throw new Error(
        "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (server only).",
      );
    }
    return value;
  },
};
