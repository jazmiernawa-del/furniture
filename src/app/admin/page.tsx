import Link from "next/link";

import { getAdminStats } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/format";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Products", value: String(stats.productCount) },
    { label: "Active rentals", value: String(stats.activeRentals) },
    { label: "Pending orders", value: String(stats.pendingOrders) },
    { label: "Deposits held", value: formatCurrency(stats.depositsHeld) },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight text-foreground">
        Overview
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-serif text-3xl text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Add a product
        </Link>
        <Link
          href="/admin/rentals"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          View rentals
        </Link>
      </div>
    </div>
  );
}
