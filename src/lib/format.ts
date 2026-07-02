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
