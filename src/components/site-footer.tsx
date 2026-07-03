import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";

/** Global footer — deep ink with gold detailing. */
export function SiteFooter() {
  return (
    <footer className="mt-28 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl font-medium">
              {BRAND_NAME}<span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/60">
              Exceptional pieces, rented for a season of life. White-glove
              delivery, refundable deposits, effortless returns.
            </p>
          </div>

          <FooterCol
            title="Explore"
            links={[
              ["Collection", "/catalog"],
              ["Concierge", "/how-it-works"],
              ["Your account", "/account"],
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              ["Sign in", "/login"],
              ["Create account", "/register"],
              ["Cart", "/cart"],
            ]}
          />
        </div>

        <div className="mt-14 gold-rule opacity-40" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND_NAME}. Rented, never ordinary.
          </p>
          <p className="uppercase tracking-[0.2em]">Designed for living</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-accent">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/70">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
