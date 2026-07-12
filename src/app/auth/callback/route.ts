import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { publicBaseUrl, safeNext } from "@/lib/url";

/**
 * OAuth / PKCE callback. Social sign-in (Google, Facebook) and the
 * password-reset email both redirect here with a `code`, which we exchange
 * for a session cookie and then send the user on to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error_description");
  const baseUrl = publicBaseUrl(request);

  // The provider itself rejected the sign-in (denied consent, misconfigured
  // app, etc.). Surface its message.
  if (oauthError) {
    console.error("[auth/callback] provider returned an error:", oauthError);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, baseUrl),
    );
  }

  if (isSupabaseConfigured() && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl));
    }
    // This is the failure behind "Could not sign you in". Log the real cause
    // (visible in Vercel Runtime Logs) and pass a short code to the login page
    // so it is diagnosable without dashboard access.
    console.error(
      `[auth/callback] exchangeCodeForSession failed on ${baseUrl} — ` +
        `code=${error.code ?? "n/a"} status=${error.status ?? "n/a"} ` +
        `message="${error.message}"`,
    );
    const detail = error.code ?? error.message;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`Sign-in failed (${detail})`)}`, baseUrl),
    );
  }

  // No code at all: the flow never completed. Almost always a redirect-URL /
  // canonical-domain mismatch (the code-verifier cookie was set on a different
  // host than the one this callback was served from).
  console.error(
    `[auth/callback] reached without a code on ${baseUrl}. ` +
      `Supabase configured=${isSupabaseConfigured()}. ` +
      "Likely a redirect-URL / domain mismatch — the PKCE flow did not complete.",
  );
  return NextResponse.redirect(
    new URL("/login?error=Could%20not%20sign%20you%20in", baseUrl),
  );
}
