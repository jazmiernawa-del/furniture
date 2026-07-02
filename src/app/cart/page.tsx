import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCart } from "@/lib/cart";
import { removeFromCart } from "@/app/cart/actions";
import { computePrice } from "@/lib/rental";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const cart = await getCart();

  const lines = cart.map((item) => ({
    item,
    price: computePrice({
      rate: item.rate,
      periods: item.periods,
      deposit: item.deposit,
      deliveryFee: item.deliveryFee,
    }),
  }));

  const totals = lines.reduce(
    (acc, { price }) => ({
      rental: acc.rental + price.rentalTotal,
      deposit: acc.deposit + price.deposit,
      delivery: acc.delivery + price.deliveryFee,
      total: acc.total + price.total,
    }),
    { rental: 0, deposit: 0, delivery: 0, total: 0 },
  );

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">
            Your cart
          </h1>

          {cart.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link
                href="/catalog"
                className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Browse the catalog
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
              {/* Line items */}
              <ul className="space-y-4">
                {lines.map(({ item, price }) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/catalog/${item.slug}`}
                            className="font-medium text-foreground transition hover:text-accent"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.periods}{" "}
                            {item.period === "weekly" ? "week" : "month"}
                            {item.periods > 1 ? "s" : ""} ·{" "}
                            {formatDate(item.startDate)} → {formatDate(item.endDate)}
                          </p>
                        </div>
                        <form action={removeFromCart}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="text-sm text-muted-foreground transition hover:text-red-600">
                            Remove
                          </button>
                        </form>
                      </div>
                      <div className="mt-auto flex items-baseline justify-between pt-3 text-sm">
                        <span className="text-muted-foreground">
                          Rent {formatCurrency(price.rentalTotal)} + deposit{" "}
                          {formatCurrency(price.deposit)}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(price.total)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Summary */}
              <aside className="h-fit rounded-2xl border border-border bg-card p-6">
                <h2 className="font-serif text-xl text-foreground">Summary</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <SummaryRow label="Rental" value={formatCurrency(totals.rental)} />
                  <SummaryRow
                    label="Refundable deposit"
                    value={formatCurrency(totals.deposit)}
                  />
                  <SummaryRow
                    label="Delivery"
                    value={formatCurrency(totals.delivery)}
                  />
                  <div className="flex items-baseline justify-between border-t border-border pt-3 text-base">
                    <dt className="font-medium text-foreground">Due today</dt>
                    <dd className="font-semibold text-foreground">
                      {formatCurrency(totals.total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-full bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground transition hover:opacity-90"
                >
                  Proceed to checkout
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Deposit is fully refunded after pickup.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
