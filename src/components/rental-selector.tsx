"use client";

import { useActionState, useMemo, useState } from "react";

import { addToCart, type CartActionState } from "@/app/cart/actions";
import { formatCurrency } from "@/lib/format";
import {
  computeEndDate,
  computePrice,
  fromISO,
  isRangeAvailable,
  todayISO,
  toISO,
  type DateRange,
} from "@/lib/rental";
import type { BillingPeriod } from "@/lib/types/database";

const initialState: CartActionState = {};
const MONTHS_TO_SHOW = 3;
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function RentalSelector({
  slug,
  monthlyRate,
  weeklyRate,
  deposit,
  deliveryFee,
  bookedRanges,
}: {
  slug: string;
  monthlyRate: number;
  weeklyRate: number | null;
  deposit: number;
  deliveryFee: number;
  bookedRanges: DateRange[];
}) {
  const today = todayISO();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [periods, setPeriods] = useState(1);
  const [start, setStart] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(addToCart, initialState);

  const rate = period === "weekly" ? (weeklyRate ?? monthlyRate) : monthlyRate;
  const end = start ? computeEndDate(start, period, periods) : null;
  const range: DateRange | null = start && end ? { start, end } : null;
  const available = range ? isRangeAvailable(range, bookedRanges) : false;

  const price = computePrice({ rate, periods, deposit, deliveryFee });

  const isBooked = useMemo(() => {
    return (iso: string) =>
      bookedRanges.some((r) => iso >= r.start && iso < r.end);
  }, [bookedRanges]);

  const canAdd = Boolean(range && available && start && start >= today);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Period toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPeriod("monthly")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            period === "monthly"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly · {formatCurrency(monthlyRate)}
        </button>
        {weeklyRate != null && (
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              period === "weekly"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly · {formatCurrency(weeklyRate)}
          </button>
        )}
      </div>

      {/* Duration stepper */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Duration ({period === "weekly" ? "weeks" : "months"})
        </span>
        <div className="flex items-center gap-3">
          <Stepper
            label="Decrease"
            onClick={() => setPeriods((p) => Math.max(1, p - 1))}
            disabled={periods <= 1}
          >
            −
          </Stepper>
          <span className="w-6 text-center font-medium text-foreground">
            {periods}
          </span>
          <Stepper
            label="Increase"
            onClick={() => setPeriods((p) => Math.min(12, p + 1))}
            disabled={periods >= 12}
          >
            +
          </Stepper>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">
          Choose your start date
        </p>
        <div className="space-y-6">
          {monthOffsets().map((offset) => (
            <MonthGrid
              key={offset}
              monthOffset={offset}
              today={today}
              start={start}
              end={end}
              isBooked={isBooked}
              onPick={setStart}
            />
          ))}
        </div>
        <Legend />
      </div>

      {/* Selection summary */}
      {range && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm ${
            available
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {available ? (
            <>
              Available · {fmt(range.start)} → {fmt(range.end)} (pickup)
            </>
          ) : (
            <>Those dates overlap an existing booking. Pick another start.</>
          )}
        </div>
      )}

      {/* Price breakdown */}
      <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
        <Row
          label={`${formatCurrency(rate)} × ${periods} ${
            period === "weekly" ? "wk" : "mo"
          }`}
          value={formatCurrency(price.rentalTotal)}
        />
        <Row label="Refundable deposit" value={formatCurrency(price.deposit)} muted />
        <Row label="Delivery fee" value={formatCurrency(price.deliveryFee)} muted />
        <div className="flex items-baseline justify-between border-t border-border pt-3 text-base">
          <dt className="font-medium text-foreground">Due today</dt>
          <dd className="font-semibold text-foreground">
            {formatCurrency(price.total)}
          </dd>
        </div>
      </dl>

      {/* Add to cart */}
      <form action={formAction} className="mt-5">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="period" value={period} />
        <input type="hidden" name="periods" value={periods} />
        <input type="hidden" name="start_date" value={start ?? ""} />
        <button
          type="submit"
          disabled={!canAdd || pending}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : start ? "Add to cart" : "Select a start date"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 text-center text-sm text-red-700">{state.error}</p>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Deposit is refunded after pickup. Delivery &amp; pickup included.
      </p>
    </div>
  );
}

function MonthGrid({
  monthOffset,
  today,
  start,
  end,
  isBooked,
  onPick,
}: {
  monthOffset: number;
  today: string;
  start: string | null;
  end: string | null;
  isBooked: (iso: string) => boolean;
  onPick: (iso: string) => void;
}) {
  const base = fromISO(today);
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + monthOffset;
  const first = new Date(Date.UTC(year, month, 1));
  const monthLabel = first.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const daysInMonth = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const leading = first.getUTCDay();

  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      toISO(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d))),
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="py-1 text-xs text-muted-foreground">
            {w}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={i} />;
          const past = iso < today;
          const booked = isBooked(iso);
          const disabled = past || booked;
          const isStart = iso === start;
          const inRange = start && end ? iso >= start && iso < end : false;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              className={[
                "aspect-square rounded-lg text-sm transition",
                disabled
                  ? "cursor-not-allowed text-muted-foreground/40 line-through"
                  : "text-foreground hover:bg-muted",
                booked ? "bg-red-50" : "",
                inRange && !isStart ? "bg-accent/15" : "",
                isStart ? "bg-accent text-accent-foreground hover:bg-accent" : "",
              ].join(" ")}
            >
              {Number(iso.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-accent" /> Start
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-accent/15" /> Rental period
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-red-50" /> Unavailable
      </span>
    </div>
  );
}

function Stepper({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg text-foreground transition hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={muted ? "text-muted-foreground" : "text-foreground"}>
        {label}
      </dt>
      <dd className={muted ? "text-muted-foreground" : "text-foreground"}>
        {value}
      </dd>
    </div>
  );
}

function monthOffsets(): number[] {
  return Array.from({ length: MONTHS_TO_SHOW }, (_, i) => i);
}

function fmt(iso: string): string {
  return fromISO(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
