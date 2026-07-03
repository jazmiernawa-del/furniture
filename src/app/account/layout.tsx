import Link from "next/link";

import { requireUser, getProfile } from "@/lib/auth";
import { manageBilling } from "@/app/account/actions";
import { signOut } from "@/app/auth/actions";
import { BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/login?next=/account");
  const profile = await getProfile();
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Dark concierge sidebar */}
      <aside className="bg-ink text-ink-foreground lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0">
        <div className="flex h-full flex-col px-8 py-10">
          <Link href="/" className="font-serif text-2xl font-medium text-white">
            {BRAND_NAME}<span className="text-accent">.</span>
          </Link>

          <div className="mt-12">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-accent">
              Private Concierge
            </p>
            <p className="mt-3 font-serif text-3xl font-light leading-tight text-white">
              {firstName ? `Welcome, ${firstName}` : "Welcome"}
            </p>
            <p className="mt-2 text-sm text-ink-foreground/50">{user.email}</p>
            {profile?.role === "admin" && (
              <span className="mt-4 inline-flex rounded-full border border-accent/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-accent">
                Atelier access
              </span>
            )}
          </div>

          <nav className="mt-12 flex flex-col gap-1 text-[0.72rem] uppercase tracking-[0.2em]">
            <SideLink href="/account" active>
              My Rentals
            </SideLink>
            <SideLink href="/catalog">The Collection</SideLink>
            <SideLink href="/how-it-works">Concierge</SideLink>
            {profile?.role === "admin" && (
              <SideLink href="/admin">Atelier</SideLink>
            )}
          </nav>

          <div className="mt-auto space-y-3 pt-10">
            <div className="gold-rule opacity-30" />
            <form action={manageBilling}>
              <button className="w-full text-left text-[0.72rem] uppercase tracking-[0.2em] text-ink-foreground/60 transition hover:text-accent">
                Payment methods
              </button>
            </form>
            <form action={signOut}>
              <button className="w-full text-left text-[0.72rem] uppercase tracking-[0.2em] text-ink-foreground/60 transition hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-6 py-14 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}

function SideLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`border-l-2 py-2.5 pl-4 transition ${
        active
          ? "border-accent text-white"
          : "border-transparent text-ink-foreground/55 hover:border-accent/50 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
