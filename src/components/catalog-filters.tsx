"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CatalogFilters({
  categories,
  styles,
}: {
  categories: string[];
  styles: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(formData: FormData) {
    const next = new URLSearchParams();
    for (const key of ["q", "category", "style", "max", "from", "to"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) next.set(key, value);
    }
    const qs = next.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
  }

  const get = (k: string) => params.get(k) ?? "";
  const hasFilters = ["q", "category", "style", "max", "from", "to"].some((k) =>
    params.get(k),
  );

  return (
    <form
      action={apply}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Input name="q" placeholder="Search pieces…" defaultValue={get("q")} />

        <Select name="category" defaultValue={get("category")} label="All categories">
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select name="style" defaultValue={get("style")} label="All styles">
          {styles.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Input
          name="max"
          type="number"
          min="0"
          step="10"
          placeholder="Max $/month"
          defaultValue={get("max")}
        />
      </div>

      <div className="mt-3 grid items-end gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Available from
          </span>
          <Input name="from" type="date" defaultValue={get("from")} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Available until
          </span>
          <Input name="to" type="date" defaultValue={get("to")} />
        </label>

        <div className="flex gap-2 lg:col-span-2 lg:justify-end">
          <button
            type="submit"
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Apply filters
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push("/catalog")}
              className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition hover:bg-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
    />
  );
}

function Select({
  name,
  defaultValue,
  label,
  children,
}: {
  name: string;
  defaultValue: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
    >
      <option value="">{label}</option>
      {children}
    </select>
  );
}
