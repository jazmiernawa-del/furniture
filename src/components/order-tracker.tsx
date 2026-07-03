import type { OrderStatus } from "@/lib/types/database";

const STEPS = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

/** Map an order status to how far along the delivery journey it is. */
function reachedIndex(status: OrderStatus): number {
  switch (status) {
    case "confirmed":
      return 1; // confirmed + now preparing
    case "delivered":
    case "active":
    case "overdue":
    case "returned":
      return 3; // delivered (and beyond)
    default:
      return 0;
  }
}

/** Whether the tracker is meaningful for this status. */
export function isTrackable(status: OrderStatus): boolean {
  return ["confirmed", "delivered", "active", "overdue"].includes(status);
}

export function OrderTracker({ status }: { status: OrderStatus }) {
  const idx = reachedIndex(status);

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="eyebrow mb-4">Order status</p>
      <div className="grid grid-cols-4">
        {STEPS.map((label, i) => {
          const reached = i <= idx;
          const current = i === idx;
          return (
            <div
              key={label}
              className="relative flex flex-col items-center text-center"
            >
              {i > 0 && (
                <span
                  className={`absolute right-1/2 top-[7px] h-px w-full ${
                    i <= idx ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
              <span
                className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 ${
                  reached
                    ? "border-accent bg-accent"
                    : "border-border bg-card"
                } ${current ? "ring-2 ring-accent/30" : ""}`}
              />
              <span
                className={`mt-2 text-[0.58rem] font-medium uppercase tracking-[0.12em] ${
                  reached ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
