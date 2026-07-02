/**
 * Pure date + pricing helpers for rentals. Safe to import on the client and
 * the server (no side effects, no server-only deps).
 *
 * All dates are handled as plain calendar dates in ISO "YYYY-MM-DD" form and
 * computed in UTC to avoid timezone drift. Rental ranges are half-open
 * [start, end): `end` is the pickup day and is free for the next rental.
 */

import type { BillingPeriod } from "@/lib/types/database";

export interface DateRange {
  /** inclusive start, "YYYY-MM-DD" */
  start: string;
  /** exclusive end (pickup day), "YYYY-MM-DD" */
  end: string;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Format a Date (using its UTC parts) as "YYYY-MM-DD". */
export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse "YYYY-MM-DD" into a UTC Date at midnight. */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function addMonths(iso: string, months: number): string {
  const d = fromISO(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  // Clamp to the last valid day of the target month (e.g. Jan 31 -> Feb 28).
  const lastDay = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return toISO(d);
}

/** Exclusive end date for a rental starting on `start`. */
export function computeEndDate(
  start: string,
  period: BillingPeriod,
  periods: number,
): string {
  const n = Math.max(1, Math.floor(periods));
  return period === "weekly" ? addDays(start, 7 * n) : addMonths(start, n);
}

/** Do two half-open [start, end) ranges overlap? */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Is `candidate` free of all `booked` ranges (and well-formed)? */
export function isRangeAvailable(
  candidate: DateRange,
  booked: DateRange[],
): boolean {
  if (candidate.end <= candidate.start) return false;
  return !booked.some((b) => rangesOverlap(candidate, b));
}

/** Inclusive count of nights covered by a half-open range. */
export function nightsBetween(range: DateRange): number {
  return Math.round(
    (fromISO(range.end).getTime() - fromISO(range.start).getTime()) /
      86_400_000,
  );
}

export interface PriceInput {
  rate: number;
  periods: number;
  deposit: number;
  deliveryFee: number;
}

export interface PriceBreakdown {
  rentalTotal: number;
  deposit: number;
  deliveryFee: number;
  total: number;
}

/** total = (rate × periods) + deposit + delivery fee */
export function computePrice({
  rate,
  periods,
  deposit,
  deliveryFee,
}: PriceInput): PriceBreakdown {
  const n = Math.max(1, Math.floor(periods));
  const rentalTotal = round2(rate * n);
  return {
    rentalTotal,
    deposit: round2(deposit),
    deliveryFee: round2(deliveryFee),
    total: round2(rentalTotal + deposit + deliveryFee),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Parse a Postgres daterange literal like "[2026-01-01,2026-02-01)" into a
 * half-open DateRange. Postgres normalizes ranges to `[)`.
 */
export function parseDateRange(literal: string): DateRange | null {
  const match = literal.match(
    /[[(]\s*"?(\d{4}-\d{2}-\d{2})"?\s*,\s*"?(\d{4}-\d{2}-\d{2})"?\s*[\])]/,
  );
  if (!match) return null;
  return { start: match[1], end: match[2] };
}
