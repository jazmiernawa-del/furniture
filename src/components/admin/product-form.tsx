"use client";

import { useActionState } from "react";

import {
  createProduct,
  updateProduct,
  type ActionState,
} from "@/app/admin/actions";
import type { Product } from "@/lib/types/database";

const initialState: ActionState = {};

export function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product);
  const action = isEdit ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={product?.name} required />
        <Field
          label="Category"
          name="category"
          defaultValue={product?.category}
          placeholder="Sofas, Chairs, Tables…"
          required
        />
        <Field
          label="Style"
          name="style"
          defaultValue={product?.style ?? ""}
          placeholder="Modern, Mid-Century…"
        />
        <Select
          label="Condition"
          name="condition"
          defaultValue={product?.condition ?? "good"}
          options={[
            ["new", "New"],
            ["like_new", "Like new"],
            ["good", "Good"],
            ["fair", "Fair"],
          ]}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Monthly rate ($)"
          name="monthly_rate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.monthly_rate}
          required
        />
        <Field
          label="Weekly rate ($)"
          name="weekly_rate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.weekly_rate ?? ""}
          placeholder="optional"
        />
        <Field
          label="Deposit ($)"
          name="deposit"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.deposit ?? 0}
        />
        <Field
          label="Delivery fee ($)"
          name="delivery_fee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.delivery_fee ?? 0}
        />
      </div>

      <Select
        label="Status"
        name="status"
        defaultValue={product?.status ?? "active"}
        options={[
          ["active", "Active (visible in catalog)"],
          ["archived", "Archived (hidden)"],
        ]}
      />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
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

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
