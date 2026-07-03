"use client";

import { useRouter } from "next/navigation";

/**
 * Subtle, elegant "← Back" control. Returns to the previous page when there is
 * history, otherwise falls back to a sensible parent route.
 */
export function BackButton({
  fallback = "/",
  label = "Back",
  className = "",
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`group inline-flex items-center gap-2.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground transition hover:text-accent-strong ${className}`}
    >
      <span
        aria-hidden="true"
        className="text-base leading-none transition-transform duration-300 group-hover:-translate-x-1"
      >
        &larr;
      </span>
      {label}
    </button>
  );
}
