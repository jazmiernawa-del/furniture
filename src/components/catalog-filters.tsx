"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PRICE_CAP = 300;

export function CatalogFilters({
  categories,
  styles,
}: {
  categories: string[];
  styles: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";
  const [maxVal, setMaxVal] = useState(Number(get("max")) || PRICE_CAP);

  function apply(formData: FormData) {
    const next = new URLSearchParams();
    for (const key of ["q", "category", "style", "from", "to"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) next.set(key, value);
    }
    const m = Number(formData.get("max") ?? PRICE_CAP);
    if (m > 0 && m < PRICE_CAP) next.set("max", String(m));

    const qs = next.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
  }

  const hasFilters = ["q", "category", "style", "max", "from", "to"].some((k) =>
    params.get(k),
  );

  return (
    <form action={apply} className="rounded-sm border border-border bg-card p-5 sm:p-6">
      {/* Search */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-0 top-3 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          name="q"
          defaultValue={get("q")}
          placeholder="Search the collection…"
          className="w-full border-0 border-b border-border bg-transparent py-2.5 pl-7 text-sm text-foreground outline-none transition focus:border-accent placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Select name="category" defaultValue={get("category")} label="All categories">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select name="style" defaultValue={get("style")} label="All styles">
          {styles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        {/* Price range slider */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Max monthly
            </span>
            <span className="font-serif text-lg text-accent-strong">
              {maxVal >= PRICE_CAP ? "Any" : `$${maxVal}`}
            </span>
          </div>
          <input
            type="range"
            name="max"
            min={20}
            max={PRICE_CAP}
            step={10}
            value={maxVal}
            onChange={(e) => setMaxVal(Number(e.target.value))}
            style={{ accentColor: "var(--accent)" }}
            className="h-6 w-full cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-6 grid items-end gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Available from
          </span>
          <DateInput name="from" defaultValue={get("from")} />
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Available until
          </span>
          <DateInput name="to" defaultValue={get("to")} />
        </label>

        <div className="flex gap-3 sm:col-span-2 lg:justify-end">
          <button
            type="submit"
            className="btn-ink flex-1 rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] sm:flex-none"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push("/catalog")}
              className="rounded-full border border-border px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition hover:border-accent"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="date"
      {...props}
      className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
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
    <label className="block">
      <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label.replace("All ", "")}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
      >
        <option value="">{label}</option>
        {children}
      </select>
    </label>
  );
}
