import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckoutForm } from "@/components/checkout-form";
import { BackButton } from "@/components/back-button";
import { requireUser, getProfile } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { computeOrderTotals } from "@/lib/data/orders";
import { isStripeConfigured } from "@/lib/stripe";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  await requireUser("/login?next=/checkout");
  const { canceled } = await searchParams;

  const cart = await getCart();
  if (cart.length === 0) redirect("/cart");

  const profile = await getProfile();
  const totals = computeOrderTotals(cart);
  const stripeReady = isStripeConfigured();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <BackButton fallback="/cart" label="Back to cart" className="mb-8" />
          <p className="eyebrow">Final details</p>
          <h1 className="mt-3 font-serif text-5xl font-light tracking-tight text-foreground">
            Checkout
          </h1>

          {canceled && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Checkout was canceled — your items are still reserved. You can try
              again below.
            </p>
          )}

          {!stripeReady && (
            <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Stripe isn&apos;t configured yet. Add <code>STRIPE_SECRET_KEY</code>{" "}
              and <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{" "}
              <code>.env.local</code> to enable payment.
            </p>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
            <section>
              <h2 className="font-serif text-xl text-foreground">
                Delivery details
              </h2>
              <div className="mt-5">
                <CheckoutForm
                  defaultName={profile?.full_name ?? undefined}
                  defaultPhone={profile?.phone ?? undefined}
                />
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl text-foreground">Order</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {item.name} · {item.periods}
                      {item.period === "weekly" ? "wk" : "mo"}
                    </span>
                    <span className="text-foreground">
                      {formatCurrency(item.rate * item.periods)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <Row label="Rental" value={formatCurrency(totals.subtotal)} />
                <Row
                  label="Refundable deposit"
                  value={formatCurrency(totals.depositTotal)}
                />
                <Row label="Delivery" value={formatCurrency(totals.deliveryFee)} />
                <div className="flex items-baseline justify-between border-t border-border pt-3 text-base">
                  <dt className="font-medium text-foreground">Due today</dt>
                  <dd className="font-semibold text-foreground">
                    {formatCurrency(totals.total)}
                  </dd>
                </div>
              </dl>
              <Link
                href="/cart"
                className="mt-4 block text-center text-sm text-muted-foreground transition hover:text-foreground"
              >
                ← Edit cart
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
