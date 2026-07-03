"use client";

import { useActionState } from "react";

import { startCheckout, type CheckoutState } from "@/app/checkout/actions";
import { todayISO } from "@/lib/rental";

const initialState: CheckoutState = {};

export function CheckoutForm({
  defaultName,
  defaultPhone,
}: {
  defaultName?: string;
  defaultPhone?: string;
}) {
  const [state, formAction, pending] = useActionState(
    startCheckout,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact name" name="contact_name" defaultValue={defaultName} required />
        <Field
          label="Contact phone"
          name="contact_phone"
          type="tel"
          defaultValue={defaultPhone}
        />
      </div>

      <Field label="Address line 1" name="line1" required />
      <Field label="Address line 2" name="line2" placeholder="Apt, suite (optional)" />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="City" name="city" required />
        <Field label="State" name="state" required />
        <Field label="ZIP" name="postal_code" required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Preferred delivery date"
          name="delivery_date"
          type="date"
          min={todayISO()}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Delivery notes
        </span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Gate code, floor, anything we should know…"
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Redirecting to secure checkout…" : "Pay with Stripe"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        You&apos;ll be redirected to Stripe to complete payment securely.
      </p>
    </form>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
