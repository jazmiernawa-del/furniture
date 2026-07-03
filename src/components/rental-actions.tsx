"use client";

import { useState } from "react";

import { extendRental, returnEarly } from "@/app/account/actions";

export function RentalActions({
  orderId,
  canExtend,
  canReturn,
}: {
  orderId: string;
  canExtend: boolean;
  canReturn: boolean;
}) {
  const [periods, setPeriods] = useState(1);

  if (!canExtend && !canReturn) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
      {canExtend && (
        <form action={extendRental} className="flex items-center gap-2">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="periods" value={periods} />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Fewer periods"
              onClick={() => setPeriods((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
            >
              −
            </button>
            <span className="w-5 text-center text-sm text-foreground">
              {periods}
            </span>
            <button
              type="button"
              aria-label="More periods"
              onClick={() => setPeriods((p) => Math.min(6, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
            >
              +
            </button>
          </div>
          <button className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90">
            Extend
          </button>
        </form>
      )}

      {canReturn && (
        <form
          action={returnEarly}
          onSubmit={(e) => {
            if (!confirm("Return this rental early? Future dates are freed.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="order_id" value={orderId} />
          <button className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-muted">
            Return early
          </button>
        </form>
      )}
    </div>
  );
}
