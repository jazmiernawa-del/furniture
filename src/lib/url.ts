import type { NextRequest } from "next/server";

/**
 * Reconstruct the user-facing origin for a request.
 *
 * Behind a reverse proxy (Vercel, and most CDNs) the internal request URL is
 * NOT the host the user is on — Vercel sets `x-forwarded-host` with the real
 * one. Redirecting to the internal origin after auth lands the browser on the
 * wrong host and drops the freshly-set session cookie, so always prefer the
 * forwarded host. Falls back to the request origin for local development.
 */
export function publicBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

/**
 * Restrict a user-controlled `next` redirect target to internal paths. An
 * absolute URL (e.g. `https://evil.com`) would otherwise be resolved against
 * the base URL and become an open redirect.
 */
export function safeNext(value: string | null, fallback = "/account"): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}
