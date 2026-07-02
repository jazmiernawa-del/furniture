import Link from "next/link";

/** Global site footer. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-lg text-foreground">Furniture</p>
        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/catalog" className="transition hover:text-foreground">
            Catalog
          </Link>
          <Link href="/how-it-works" className="transition hover:text-foreground">
            How it works
          </Link>
          <Link href="/login" className="transition hover:text-foreground">
            Sign in
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Furniture. Rented, not owned.</p>
      </div>
    </footer>
  );
}
