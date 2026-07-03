import "server-only";

import Stripe from "stripe";

/** True when the Stripe secret key is present. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

/** Server-side Stripe client. Throws if the secret key isn't set. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Set it in .env.local to enable checkout.",
    );
  }
  if (!cached) {
    cached = new Stripe(key, { typescript: true });
  }
  return cached;
}

/** Convert a dollar amount to integer cents for Stripe. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}
