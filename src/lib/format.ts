/** Formatting helpers shared across the app. */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format a dollar amount, e.g. 129 -> "$129". */
export function formatCurrency(amount: number): string {
  return usd.format(amount);
}

/** Human-readable label for a billing period. */
export function periodLabel(period: "weekly" | "monthly"): string {
  return period === "weekly" ? "week" : "month";
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** Format an ISO date string (YYYY-MM-DD) as "Jan 5, 2026". */
export function formatDate(iso: string): string {
  // Parse as a plain calendar date to avoid timezone drift.
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return iso;
  return dateFmt.format(new Date(y, m - 1, d));
}
