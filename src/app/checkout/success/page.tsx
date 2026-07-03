import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { clearCart } from "@/lib/cart";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/data/fulfillment";

export const metadata: Metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let confirmed = false;

  if (session_id && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const orderId = session.metadata?.order_id;
      if (orderId && session.payment_status === "paid") {
        // Fallback fulfilment in case the webhook hasn't arrived yet.
        await fulfillOrder(
          orderId,
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
          typeof session.customer === "string" ? session.customer : null,
        );
        confirmed = true;
      }
    } catch (err) {
      console.error("success page: could not retrieve session", err);
    }
  }

  // Cart was cleared at redirect, but make sure.
  await clearCart();

  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </div>
          <h1 className="mt-6 font-serif text-4xl tracking-tight text-foreground">
            {confirmed ? "You're all set" : "Thanks for your order"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {confirmed
              ? "Your rental is confirmed. We'll be in touch to schedule delivery, and you can track everything from your rentals dashboard."
              : "We've received your order. Once payment settles it will appear in your rentals dashboard."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/account"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              View my rentals
            </Link>
            <Link
              href="/catalog"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Keep browsing
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
