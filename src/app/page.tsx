import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { luxeImages, heroSlides } from "@/lib/images";

const steps = [
  {
    n: "01",
    title: "Curate your rooms",
    body: "Browse a gallery of designer pieces and reserve the ones that speak to your space.",
  },
  {
    n: "02",
    title: "Choose your season",
    body: "Rent by the week or month with a transparent rate, refundable deposit, and delivery.",
  },
  {
    n: "03",
    title: "We handle the rest",
    body: "White-glove delivery on your date. Extend, return early, or refresh whenever you like.",
  },
];

export default function Home() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <HeroSlideshow images={heroSlides} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/25 to-ink/80" />

        <SiteHeader variant="overlay" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 lg:px-10">
          <p className="eyebrow animate-fade text-accent">
            Furniture rental, elevated
          </p>
          <h1 className="animate-rise mt-5 max-w-4xl font-serif text-6xl font-light leading-[0.95] text-white sm:text-7xl lg:text-8xl">
            Live beautifully,
            <br />
            <span className="italic text-white/90">without owning a thing.</span>
          </h1>
          <p className="animate-rise delay-1 mt-7 max-w-lg text-lg font-light leading-relaxed text-white/80">
            A curated collection of premium furniture, delivered to your door and
            yours for a season — or as long as you love it.
          </p>
          <div className="animate-rise delay-2 mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/catalog"
              className="btn-gold rounded-full px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Explore the collection
            </Link>
            <Link
              href="/how-it-works"
              className="text-xs font-medium uppercase tracking-[0.2em] text-white/80 underline-offset-8 transition hover:text-white hover:underline"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PHILOSOPHY ================= */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">The Maison ethos</p>
            <h2 className="mt-5 font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">
              Design worth living with, for exactly as long as you need it.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              We believe a home should evolve with you. Rent extraordinary pieces
              — sculptural sofas, warm oak tables, boucle armchairs — with the
              flexibility ownership never offered. Every rental includes a
              refundable deposit and white-glove delivery and pickup.
            </p>
            <Link
              href="/catalog"
              className="mt-8 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground"
            >
              <span className="h-px w-10 bg-accent" />
              Begin browsing
            </Link>
          </div>

          <div className="zoom-parent relative aspect-[5/4] overflow-hidden rounded-sm">
            <Image
              src={luxeImages.feature}
              alt="A linen sofa in a sunlit room"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="zoom-img object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The concierge experience</p>
            <h2 className="mt-5 font-serif text-4xl font-light text-foreground sm:text-5xl">
              Effortless from first glance to final pickup
            </h2>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="text-center md:text-left">
                <p className="font-serif text-5xl font-light text-accent">
                  {step.n}
                </p>
                <div className="mt-4 gold-rule md:w-16" />
                <h3 className="mt-5 font-serif text-2xl text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LIFESTYLE BAND (overlapping text) ================= */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden">
          <Image
            src={luxeImages.lifestyle}
            alt="A warm dining room set for a long evening"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/40" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="max-w-md bg-card/95 p-10 shadow-2xl backdrop-blur-sm sm:p-12">
              <p className="eyebrow">White-glove service</p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-foreground">
                Delivered, styled, and collected — you simply enjoy it.
              </h2>
              <Link
                href="/catalog"
                className="btn-ink mt-8 inline-flex rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em]"
              >
                Start your collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CLOSING ================= */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <p className="eyebrow">Your next chapter</p>
        <h2 className="mt-5 font-serif text-5xl font-light leading-tight text-foreground sm:text-6xl">
          Furnish for a season,
          <br />
          <span className="italic text-accent">not forever.</span>
        </h2>
        <Link
          href="/catalog"
          className="btn-gold mt-10 inline-flex rounded-full px-9 py-4 text-xs font-medium uppercase tracking-[0.2em]"
        >
          Explore the collection
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
