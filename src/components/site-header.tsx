import Link from "next/link";

import { getProfile } from "@/lib/auth";
import { cartCount } from "@/lib/cart";
import { SignOutButton } from "@/components/sign-out-button";

/** Global site header. Reflects auth state and cart contents. */
export async function SiteHeader() {
  const [profile, count] = await Promise.all([getProfile(), cartCount()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-foreground"
        >
          Furniture
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          <Link href="/catalog" className="transition hover:text-foreground">
            Catalog
          </Link>
          <Link href="/how-it-works" className="transition hover:text-foreground">
            How it works
          </Link>
          {profile?.role === "admin" && (
            <Link href="/admin" className="transition hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link
                href="/account"
                className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:block"
              >
                My rentals
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:block"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className="relative rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Cart
            {count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
