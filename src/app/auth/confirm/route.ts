import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { publicBaseUrl, safeNext } from "@/lib/url";

/**
 * Handles the link Supabase emails for signup / password-recovery confirmation.
 * Verifies the OTP token, which sets the session cookie, then redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const baseUrl = publicBaseUrl(request);

  if (isSupabaseConfigured() && token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
    console.error(
      `[auth/confirm] verifyOtp failed (type=${type}) — ` +
        `code=${error.code ?? "n/a"} status=${error.status ?? "n/a"} ` +
        `message="${error.message}"`,
    );
  } else {
    console.error(
      `[auth/confirm] missing params — token_hash=${Boolean(token_hash)} ` +
        `type=${type ?? "n/a"} configured=${isSupabaseConfigured()}`,
    );
  }

  return NextResponse.redirect(
    new URL("/login?error=Could%20not%20confirm%20email", baseUrl),
  );
}
