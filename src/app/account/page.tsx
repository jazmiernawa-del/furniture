import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusBadge } from "@/components/status-badge";
import { RentalActions } from "@/components/rental-actions";
import { requireUser, getProfile } from "@/lib/auth";
import { getUserOrders, splitOrders, type UserOrder } from "@/lib/data/rentals";
import { manageBilling } from "@/app/account/actions";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My rentals" };
export const dynamic = "force-dynamic";

const EXTENDABLE = new Set(["confirmed", "delivered", "active", "overdue"]);

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const user = await requireUser("/login?next=/account");
  const { billing } = await searchParams;
  const [profile, orders] = await Promise.all([getProfile(), getUserOrders()]);
  const { active, past } = splitOrders(orders);

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl tracking-tight text-foreground">
                {profile?.full_name
                  ? `Hi, ${profile.full_name.split(" ")[0]}`
                  : "My rentals"}
              </h1>
              <p className="mt-2 text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <form action={manageBilling}>
                <button className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted">
                  Payment methods
                </button>
              </form>
              <SignOutButton className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground" />
            </div>
          </div>

          {billing === "unavailable" && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Payment methods become available after your first paid rental.
            </p>
          )}

          {/* Active rentals */}
          <section className="mt-12">
            <h2 className="font-serif text-2xl text-foreground">
              Active rentals
            </h2>
            {active.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
                <p className="text-muted-foreground">
                  You don&apos;t have any active rentals.
                </p>
                <Link
                  href="/catalog"
                  className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  Browse the catalog
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {active.map((order) => (
                  <RentalCard key={order.id} order={order} interactive />
                ))}
              </div>
            )}
          </section>

          {/* History */}
          {past.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl text-foreground">History</h2>
              <div className="mt-5 space-y-4">
                {past.map((order) => (
                  <RentalCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function RentalCard({
  order,
  interactive = false,
}: {
  order: UserOrder;
  interactive?: boolean;
}) {
  const deposit = order.payments?.find((p) => p.type === "deposit");
  const depositRefunded =
    deposit?.status === "refunded" || deposit?.status === "partially_refunded";
  const canAct = interactive && EXTENDABLE.has(order.status);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              #{order.id.slice(0, 8)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(order.start_date)} → {formatDate(order.end_date)} ·{" "}
            {order.billing_period}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-foreground">
            {formatCurrency(Number(order.total))}
          </p>
          <p className="text-xs text-muted-foreground">
            {depositRefunded
              ? "Deposit refunded"
              : `${formatCurrency(Number(order.deposit_total))} deposit held`}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
        {order.order_items?.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.product_name} · {item.periods}{" "}
              {item.billing_period === "weekly" ? "wk" : "mo"}
            </span>
            <span>{formatCurrency(Number(item.line_total))}</span>
          </li>
        ))}
      </ul>

      {canAct && (
        <RentalActions
          orderId={order.id}
          canExtend={EXTENDABLE.has(order.status)}
          canReturn={EXTENDABLE.has(order.status)}
        />
      )}
    </div>
  );
}
