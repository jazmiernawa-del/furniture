import Link from "next/link";

import { getProfile } from "@/lib/auth";
import { cartCount } from "@/lib/cart";
import { BRAND_NAME } from "@/lib/brand";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * Global site header.
 * - variant="solid"  → cream bar with a gold underline (default)
 * - variant="overlay" → transparent, light text, floats over a hero image
 */
export async function SiteHeader({
  variant = "solid",
}: {
  variant?: "solid" | "overlay";
}) {
  const [profile, count] = await Promise.all([getProfile(), cartCount()]);
  const overlay = variant === "overlay";

  const wrap = overlay
    ? "absolute inset-x-0 top-0 z-40 text-ink-foreground"
    : "sticky top-0 z-40 border-b border-border/70 bg-background/85 text-foreground backdrop-blur-md";

  const link = overlay
    ? "text-ink-foreground/80 hover:text-white"
    : "text-muted-foreground hover:text-accent-strong";

  return (
    <header className={wrap}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight"
        >
          {BRAND_NAME}
          <span className={overlay ? "text-white/60" : "text-accent"}>.</span>
        </Link>

        <nav className="hidden items-center gap-10 text-[0.7rem] font-medium uppercase tracking-[0.2em] md:flex">
          <Link href="/catalog" className={`transition ${link}`}>
            Collection
          </Link>
          <Link href="/how-it-works" className={`transition ${link}`}>
            Concierge
          </Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className={`transition ${link}`}>
              Atelier
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-5 text-[0.7rem] font-medium uppercase tracking-[0.2em]">
          {profile ? (
            <>
              <Link
                href="/account"
                className={`hidden transition sm:block ${link}`}
              >
                My Rentals
              </Link>
              <SignOutButton
                className={`hidden transition sm:block ${link}`}
                label="Sign out"
              />
            </>
          ) : (
            <Link href="/login" className={`hidden transition sm:block ${link}`}>
              Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className={`relative transition ${link}`}
            aria-label="Cart"
          >
            Cart
            {count > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
