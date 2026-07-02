import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Privileged Supabase client using the service role key.
 *
 * ⚠️ Bypasses Row Level Security. Use ONLY in trusted server-side code
 * (Route Handlers, Server Actions, webhooks) for operations that must run
 * with elevated privileges — e.g. Stripe webhook fulfilment, admin tasks.
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
