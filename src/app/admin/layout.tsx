import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

// Admin is auth-gated and data-driven — always render on demand.
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/rentals", label: "Rentals" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guards every /admin/* route: redirects non-admins away.
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-card lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-6 py-5 lg:block">
          <Link href="/" className="font-serif text-xl text-foreground">
            Furniture
          </Link>
          <p className="hidden text-xs uppercase tracking-wide text-muted-foreground lg:mt-1 lg:block">
            Admin
          </p>
        </div>
        <nav className="flex gap-1 px-4 pb-4 lg:flex-col lg:px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 px-3 pt-2 lg:mt-4 lg:border-t lg:border-border">
            <SignOutButton />
          </div>
        </nav>
      </aside>

      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
