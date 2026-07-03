import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <div>
          <p className="font-serif text-6xl text-accent">404</p>
          <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground">
            We couldn&apos;t find that piece
          </h1>
          <p className="mt-3 text-muted-foreground">
            It may have been rented, archived, or never existed.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Back to the catalog
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
