import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * OAuth / PKCE callback. Social sign-in (Google, Facebook) and the
 * password-reset email both redirect here with a `code`, which we exchange
 * for a session cookie and then send the user on to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error_description");

  // The public-facing base URL. Behind Vercel's proxy `origin` (derived from
  // the internal request URL) is NOT the site the user is on, so prefer the
  // forwarded host that the proxy sets. Without this, a successful login can
  // redirect to the wrong host and drop the freshly-set session cookie.
  const baseUrl = publicBaseUrl(request, origin);

  if (oauthError) {
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
  }

  return NextResponse.redirect(
    new URL("/login?error=Could%20not%20sign%20you%20in", baseUrl),
  );
}

/**
 * Only allow redirecting to internal paths. A user-controlled `next` that is
 * an absolute URL (e.g. `https://evil.com`) would otherwise be an open
 * redirect once resolved against the base URL.
 */
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/account";
}

/**
 * Reconstruct the user-facing origin from proxy headers when present
 * (Vercel, and most reverse proxies, set `x-forwarded-host`/`-proto`),
 * falling back to the request origin for local development.
 */
function publicBaseUrl(request: NextRequest, origin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return origin;
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${forwardedProto}://${forwardedHost}`;
}
