import Image from "next/image";
import Link from "next/link";

import { luxeImages } from "@/lib/images";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Cinematic split-screen shell for the auth screens: a full-bleed furniture
 * portrait with an editorial quote on one side, the form on the other.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Image side */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={luxeImages.authPortrait}
          alt="An elegantly furnished interior"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/25 to-ink/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link
            href="/"
            className="font-serif text-2xl font-medium text-white"
          >
            {BRAND_NAME}<span className="text-accent">.</span>
          </Link>
          <div>
            <div className="mb-6 h-px w-16 bg-accent" />
            <p className="max-w-md font-serif text-3xl font-light italic leading-snug text-white">
              “The best rooms have something to say — a story that evolves with
              the season.”
            </p>
            <p className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/60">
              The {BRAND_NAME} Atelier
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-6 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="font-serif text-2xl font-medium text-foreground lg:hidden"
          >
            {BRAND_NAME}<span className="text-accent">.</span>
          </Link>

          <p className="eyebrow mt-8 lg:mt-0">Members</p>
          <h1 className="mt-3 font-serif text-4xl font-light leading-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>

          <div className="mt-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
