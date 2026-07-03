import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Renting furniture with Furniture: choose pieces, set your term, and we handle delivery and pickup.",
};

const faqs = [
  {
    q: "Weekly or monthly?",
    a: "Every piece can be rented by the week or the month. You choose your term and start date at checkout, and can extend or return early later.",
  },
  {
    q: "What's the deposit?",
    a: "A refundable security deposit is held for each item and returned after pickup, assuming the piece comes back in good condition.",
  },
  {
    q: "How does delivery work?",
    a: "We schedule white-glove delivery for your chosen date and collect the piece at the end of your rental. A flat delivery fee is shown before you pay.",
  },
  {
    q: "Can two people rent the same piece?",
    a: "No. Each item is booked for specific dates, and our system prevents overlapping rentals so what you reserve is truly yours for the term.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <BackButton fallback="/" label="Back" className="mb-8" />
          <p className="eyebrow">The concierge experience</p>
          <h1 className="mt-4 font-serif text-5xl font-light leading-none tracking-tight text-foreground sm:text-6xl">
            How renting works
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Furnishing a space shouldn&apos;t mean owning everything forever.
            Here&apos;s the short version.
          </p>
          <div className="mt-8 gold-rule w-24" />

          <div className="mt-14 space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-t border-border pt-6">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  {faq.q}
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href="/catalog"
              className="btn-ink inline-flex rounded-full px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Explore the collection
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
