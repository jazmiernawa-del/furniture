import Link from "next/link";

import { getProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

/** Global site header. Reflects auth state and grows as later steps add cart. */
export async function SiteHeader() {
  const profile = await getProfile();

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
            href="/catalog"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Browse pieces
          </Link>
        </div>
      </div>
    </header>
  );
}
