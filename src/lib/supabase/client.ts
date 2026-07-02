import { createBrowserClient } from "@supabase/ssr";

import { assertSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for use in Client Components ("use client").
 * Uses the public anon key and is subject to Row Level Security.
 */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );
}
