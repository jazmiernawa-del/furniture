import type { OrderStatus } from "@/lib/types/database";

const dotColor: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-sky-400",
  preparing: "bg-sky-400",
  out_for_delivery: "bg-indigo-400",
  delivered: "bg-indigo-400",
  active: "bg-emerald-400",
  returned: "bg-stone-400",
  overdue: "bg-red-400",
  cancelled: "bg-stone-400",
};

const label: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  active: "In Residence",
  returned: "Returned",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

/** Gold-framed status pill with a state-colored dot. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-accent-strong">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      {label[status]}
    </span>
  );
}
