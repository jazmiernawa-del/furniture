"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items: [string, string][] = [
    ["/account", "My Rentals"],
    ["/account/saved", "Saved"],
    ["/catalog", "The Collection"],
    ["/how-it-works", "Concierge"],
  ];
  if (isAdmin) items.push(["/admin", "Atelier"]);

  return (
    <nav className="mt-12 flex flex-col gap-1 text-[0.72rem] uppercase tracking-[0.2em]">
      {items.map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`border-l-2 py-2.5 pl-4 transition ${
              active
                ? "border-accent text-white"
                : "border-transparent text-ink-foreground/55 hover:border-accent/50 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
