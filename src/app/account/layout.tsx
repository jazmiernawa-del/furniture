import Link from "next/link";

import { requireUser, getProfile } from "@/lib/auth";
import { manageBilling } from "@/app/account/actions";
import { signOut } from "@/app/auth/actions";
import { BRAND_NAME } from "@/lib/brand";
import { AccountNav } from "@/components/account-nav";

export const dynamic = "force-dynamic";

function initialsOf(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/login?next=/account");
  const profile = await getProfile();
  const firstName = profile?.full_name?.split(" ")[0];
  const initials = initialsOf(profile?.full_name ?? null, user.email ?? "M");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Concierge sidebar */}
      <aside className="relative bg-ink text-ink-foreground lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0">
        {/* thin gold accent line on the inner edge (desktop) */}
        <span className="absolute right-0 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-accent/70 to-transparent lg:block" />

        <div className="flex h-full flex-col px-8 py-10">
          <Link href="/" className="font-serif text-2xl font-medium text-white">
            {BRAND_NAME}<span className="text-accent">.</span>
          </Link>

          {/* Avatar + identity */}
          <div className="mt-10 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/5 font-serif text-lg text-accent ring-1 ring-accent/50">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-[0.6rem] uppercase tracking-[0.24em] text-accent">
                Private Concierge
              </p>
              <p className="truncate font-serif text-2xl font-light text-white">
                {firstName ?? "Welcome"}
              </p>
            </div>
          </div>
          <p className="mt-3 truncate text-sm text-ink-foreground/45">
            {user.email}
          </p>
          {profile?.role === "admin" && (
            <span className="mt-4 inline-flex rounded-full border border-accent/40 px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-accent">
              Atelier access
            </span>
          )}

          <div className="mt-8 gold-rule opacity-30" />

          <AccountNav isAdmin={profile?.role === "admin"} />

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
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
