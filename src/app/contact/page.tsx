import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Reach the Maison concierge team — we're here to help.",
};

const FAQS = [
  {
    q: "How does renting work?",
    a: "Choose your pieces, pick a weekly or monthly term and start date at checkout, and we handle white-glove delivery and pickup. Your refundable deposit is returned after collection.",
  },
  {
    q: "Can I extend or return early?",
    a: "Yes. From your dashboard you can extend any active rental or return it early at any time — we'll adjust everything for you.",
  },
  {
    q: "When is my deposit refunded?",
    a: "Your security deposit is refunded in full after we collect the piece, assuming it returns in good condition.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We currently offer white-glove delivery across major metropolitan areas. Enter your address at checkout to confirm availability.",
  },
];

const DETAILS = [
  { label: "Email", value: "concierge@maison.com" },
  { label: "Phone", value: "+1 (800) 555-0142" },
  { label: "Hours", value: "Mon–Sat · 9am–7pm" },
  { label: "Atelier", value: "180 Crosby Street, New York" },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <BackButton fallback="/" label="Back" className="mb-8" />
          <div className="max-w-2xl">
            <p className="eyebrow">Contact &amp; support</p>
            <h1 className="mt-4 font-serif text-5xl font-light leading-none tracking-tight text-foreground sm:text-6xl">
              We&apos;re here to help
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Questions about a piece, a rental, or delivery? Our concierge team
              would be delighted to assist.
            </p>
            <div className="mt-8 gold-rule w-24" />
          </div>

          <div className="mt-14 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
            {/* Form */}
            <div className="rounded-sm border border-border bg-card p-6 sm:p-10">
              <h2 className="font-serif text-2xl font-light text-foreground">
                Send us a message
              </h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            {/* Details */}
            <div>
              <h2 className="font-serif text-2xl font-light text-foreground">
                Reach us directly
              </h2>
              <dl className="mt-6 space-y-5">
                {DETAILS.map((d) => (
                  <div key={d.label} className="border-b border-border pb-5">
                    <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {d.label}
                    </dt>
                    <dd className="mt-1.5 font-serif text-xl text-foreground">
                      {d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <p className="eyebrow">Frequently asked</p>
            <h2 className="mt-4 font-serif text-4xl font-light text-foreground">
              Good to know
            </h2>
            <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {FAQS.map((f) => (
                <div key={f.q} className="border-t border-border pt-6">
                  <h3 className="font-serif text-xl text-foreground">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
