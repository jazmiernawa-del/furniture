import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUser, getProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser("/login?next=/account");
  const profile = await getProfile();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl tracking-tight text-foreground">
                {profile?.full_name
                  ? `Hi, ${profile.full_name.split(" ")[0]}`
                  : "My account"}
              </h1>
              <p className="mt-2 text-muted-foreground">{user.email}</p>
            </div>
            <SignOutButton className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground" />
          </div>

          {/* Rentals dashboard (active rentals, history, extend/return) is
              built in step 7. */}
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
            <h2 className="font-serif text-xl text-foreground">
              Your rentals will live here
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Active rentals, history, and options to extend or return early are
              coming with the rentals dashboard.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
            >
              Browse the catalog
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
