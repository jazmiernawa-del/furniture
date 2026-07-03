"use client";

import { useState } from "react";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { BRAND_NAME } from "@/lib/brand";

export function MobileMenu({
  authed,
  isAdmin,
  overlay = false,
}: {
  authed: boolean;
  isAdmin: boolean;
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const primary: [string, string][] = [
    ["/catalog", "The Collection"],
    ["/how-it-works", "Concierge"],
    ["/contact", "Contact"],
  ];
  const account: [string, string][] = authed
    ? [
        ["/account", "My Rentals"],
        ["/account/saved", "Saved"],
        ["/account/profile", "Profile"],
        ...(isAdmin ? ([["/admin", "Admin"]] as [string, string][]) : []),
      ]
    : [
        ["/login", "Sign in"],
        ["/register", "Create account"],
      ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className={overlay ? "text-ink-foreground" : "text-foreground"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink px-6 py-6 text-ink-foreground">
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-medium text-white">
              {BRAND_NAME}<span className="text-accent">.</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="text-ink-foreground"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-14 flex flex-col gap-6">
            {primary.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="font-serif text-4xl font-light text-white transition hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
            {account.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="block text-sm uppercase tracking-[0.2em] text-ink-foreground/70 transition hover:text-accent"
              >
                {label}
              </Link>
            ))}
            {authed && (
              <form action={signOut}>
                <button className="text-sm uppercase tracking-[0.2em] text-ink-foreground/70 transition hover:text-accent">
                  Sign out
                </button>
              </form>
            )}
            <Link
              href="/cart"
              onClick={close}
              className="btn-gold mt-2 inline-flex rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.2em]"
            >
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
