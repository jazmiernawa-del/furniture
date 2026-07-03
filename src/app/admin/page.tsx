import Link from "next/link";

import { getAdminStats, getSalesStats } from "@/lib/data/admin";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatCurrency } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [stats, sales] = await Promise.all([getAdminStats(), getSalesStats()]);

  const tiles = [
    { label: "Total revenue", value: formatCurrency(sales.totalRevenue), hero: true },
    { label: "Total orders", value: String(sales.totalOrders) },
    { label: "Customers", value: String(sales.totalCustomers) },
    { label: "Active rentals", value: String(stats.activeRentals) },
  ];

  return (
    <div>
      <p className="eyebrow">Atelier</p>
      <h1 className="mt-3 font-serif text-4xl font-light tracking-tight text-foreground">
        Overview
      </h1>

      {/* Stat tiles */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-sm border p-6 ${
              t.hero
                ? "border-accent/40 bg-accent/5"
                : "border-border bg-card"
            }`}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t.label}
            </p>
            <p
              className={`mt-3 font-serif text-4xl font-light ${
                t.hero ? "text-accent-strong" : "text-foreground"
              }`}
            >
              {t.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mt-8 rounded-sm border border-border bg-card p-6 lg:p-8">
        <RevenueChart data={sales.monthly} />
      </div>

      {/* Secondary stats + actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-border bg-card p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Pending orders
          </p>
          <p className="mt-2 font-serif text-3xl font-light text-foreground">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="rounded-sm border border-border bg-card p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Deposits held
          </p>
          <p className="mt-2 font-serif text-3xl font-light text-foreground">
            {formatCurrency(stats.depositsHeld)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="btn-ink rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.2em]"
        >
          Add a product
        </Link>
        <Link
          href="/admin/rentals"
          className="rounded-full border border-border px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition hover:border-accent"
        >
          View rentals
        </Link>
      </div>
    </div>
  );
}
