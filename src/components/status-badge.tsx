import type { OrderStatus } from "@/lib/types/database";

const config: Record<OrderStatus, { label: string; dot: string; text: string }> =
  {
    pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700" },
    confirmed: { label: "Confirmed", dot: "bg-sky-500", text: "text-sky-700" },
    delivered: {
      label: "Delivered",
      dot: "bg-indigo-500",
      text: "text-indigo-700",
    },
    active: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-700" },
    returned: {
      label: "Returned",
      dot: "bg-stone-400",
      text: "text-muted-foreground",
    },
    overdue: { label: "Overdue", dot: "bg-red-500", text: "text-red-700" },
    cancelled: {
      label: "Cancelled",
      dot: "bg-stone-400",
      text: "text-muted-foreground",
    },
  };

export function StatusBadge({ status }: { status: OrderStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
