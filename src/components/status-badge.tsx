import type { OrderStatus } from "@/lib/types/database";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  delivered: "bg-indigo-50 text-indigo-700",
  active: "bg-green-50 text-green-700",
  returned: "bg-muted text-muted-foreground",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
