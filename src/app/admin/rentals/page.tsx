import { getAllOrders } from "@/lib/data/admin";
import { updateOrderStatus, refundDeposit } from "@/app/admin/actions";
import { StatusBadge } from "@/components/status-badge";
import { OrderTracker, isTrackable } from "@/components/order-tracker";
import { formatCurrency, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types/database";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "returned",
  "overdue",
  "cancelled",
];

export default async function AdminRentalsPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-foreground">
        Rentals
      </h1>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">
          No rental orders yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const deposit = order.payments?.find((p) => p.type === "deposit");
            const depositRefunded =
              deposit?.status === "refunded" ||
              deposit?.status === "partially_refunded";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="mt-2 font-medium text-foreground">
                      {order.profiles?.full_name ?? "Customer"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.start_date)} →{" "}
                      {formatDate(order.end_date)} · {order.billing_period}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {formatCurrency(Number(order.total))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      incl. {formatCurrency(Number(order.deposit_total))} deposit
                    </p>
                  </div>
                </div>

                {/* Items */}
                {order.order_items?.length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
                    {order.order_items.map((item) => (
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

                {isTrackable(order.status) && (
                  <OrderTracker status={order.status} />
                )}

                {/* Controls */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <form
                    action={updateOrderStatus}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="order_id" value={order.id} />
                    <label className="text-sm text-muted-foreground">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90">
                      Update
                    </button>
                  </form>

                  {deposit && (
                    <form action={refundDeposit}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <button
                        disabled={depositRefunded}
                        className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-muted disabled:opacity-50"
                      >
                        {depositRefunded
                          ? "Deposit refunded"
                          : "Refund deposit"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
