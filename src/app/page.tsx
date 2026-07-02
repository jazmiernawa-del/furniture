import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    title: "Choose your pieces",
    body: "Browse a curated catalog and pick the furniture that fits your space and your season of life.",
  },
  {
    title: "Set your term",
    body: "Rent by the week or month. We calculate your rate, a refundable deposit, and delivery up front.",
  },
  {
    title: "We deliver & collect",
    body: "White-glove delivery on your date. Extend, return early, or send it back when you're done.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Furniture rental, reimagined
            </span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Beautiful rooms,
              <br />
              <span className="italic text-accent">without the commitment.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Rent premium furniture by the week or month. Flexible terms, a
              refundable deposit, and delivery and pickup handled for you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/catalog"
                className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
              >
                Browse the catalog
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
              >
                How renting works →
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
              alt="A styled living room with a linen sofa and warm wood accents"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border/70 bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif text-3xl tracking-tight text-foreground">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-serif text-lg text-accent">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground">
            Furnish your space for a season, not forever.
          </h2>
          <Link
            href="/catalog"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Start browsing
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
