import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { RentalActions } from "@/components/rental-actions";
import { OrderTracker, isTrackable } from "@/components/order-tracker";
import {
  getUserOrders,
  splitOrders,
  getProductThumbnails,
  type UserOrder,
} from "@/lib/data/rentals";
import { formatCurrency, formatDate } from "@/lib/format";
import { fallbackProductImage } from "@/lib/images";

export const metadata: Metadata = { title: "My Rentals" };

const EXTENDABLE = new Set(["confirmed", "delivered", "active", "overdue"]);

export default async function AccountPage() {
  const orders = await getUserOrders();
  const { active, past } = splitOrders(orders);

  const productIds = orders.flatMap((o) =>
    (o.order_items ?? []).map((i) => i.product_id),
  );
  const thumbs = await getProductThumbnails(productIds);

  return (
    <>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow">In residence</p>
          <h1 className="mt-3 font-serif text-4xl font-light text-foreground">
            Active rentals
          </h1>
        </div>
        <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          {active.length} piece{active.length === 1 ? "" : "s"}
        </span>
      </div>

      {active.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-border bg-card p-14 text-center">
          <p className="font-serif text-2xl font-light text-foreground">
            Your collection awaits
          </p>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            You have no active rentals yet. Explore the collection to bring
            something extraordinary home.
          </p>
          <Link
            href="/catalog"
            className="btn-ink mt-8 inline-flex rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em]"
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {active.map((order) => (
            <RentalCard
              key={order.id}
              order={order}
              thumbs={thumbs}
              interactive
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-20">
          <p className="eyebrow">The archive</p>
          <h2 className="mt-3 font-serif text-4xl font-light text-foreground">
            Rental history
          </h2>
          <div className="mt-8 space-y-6">
            {past.map((order) => (
              <RentalCard key={order.id} order={order} thumbs={thumbs} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function RentalCard({
  order,
  thumbs,
  interactive = false,
}: {
  order: UserOrder;
  thumbs: Record<string, string>;
  interactive?: boolean;
}) {
  const deposit = order.payments?.find((p) => p.type === "deposit");
  const depositRefunded =
    deposit?.status === "refunded" || deposit?.status === "partially_refunded";
  const canAct = interactive && EXTENDABLE.has(order.status);
  const items = order.order_items ?? [];
  const heroImg =
    (items[0] && thumbs[items[0].product_id]) || fallbackProductImage;

  return (
    <article className="hover-lift overflow-hidden rounded-sm border border-border bg-card">
      <div className="flex flex-col sm:flex-row">
        <div className="zoom-parent relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:w-60">
          <Image
            src={heroImg}
            alt={items[0]?.product_name ?? "Rental"}
            fill
            sizes="(min-width: 640px) 240px, 100vw"
            className="zoom-img object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <StatusBadge status={order.status} />
              <p className="mt-3 font-serif text-2xl font-light text-foreground">
                {items[0]?.product_name ?? "Rental"}
                {items.length > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    + {items.length - 1} more
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {formatDate(order.start_date)} — {formatDate(order.end_date)} ·{" "}
                <span className="capitalize">{order.billing_period}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-accent-strong">
                {formatCurrency(Number(order.total))}
              </p>
              <p className="text-[0.62rem] uppercase tracking-[0.15em] text-muted-foreground">
                {depositRefunded
                  ? "Deposit refunded"
                  : `${formatCurrency(Number(order.deposit_total))} deposit held`}
              </p>
            </div>
          </div>

          {items.length > 1 && (
            <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name} · {item.periods}{" "}
                    {item.billing_period === "weekly" ? "wk" : "mo"}
                  </span>
                  <span>{formatCurrency(Number(item.line_total))}</span>
                </li>
              ))}
            </ul>
          )}

          {isTrackable(order.status) && <OrderTracker status={order.status} />}

          {canAct && (
            <div className="mt-auto">
              <RentalActions
                orderId={order.id}
                canExtend={EXTENDABLE.has(order.status)}
                canReturn={EXTENDABLE.has(order.status)}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
