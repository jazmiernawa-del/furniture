"use client";

import { useEffect, useState } from "react";

const REVIEWS = [
  {
    quote:
      "Maison transformed our living room for a six-month sublet. The pieces were extraordinary and the delivery was truly white-glove.",
    name: "Eleanor Vance",
    location: "Tribeca, New York",
  },
  {
    quote:
      "I furnished an entire staged home in a weekend. Impeccable quality, and returning early was completely effortless.",
    name: "Julian Mercer",
    location: "Nob Hill, San Francisco",
  },
  {
    quote:
      "The velvet sofa is even more beautiful in person. Renting felt indulgent yet sensible — exactly the Maison promise.",
    name: "Priya Anand",
    location: "Lincoln Park, Chicago",
  },
  {
    quote:
      "From the availability calendar to the concierge dashboard, every detail feels considered. This is how luxury should work.",
    name: "Marcus Feld",
    location: "Beacon Hill, Boston",
  },
];

function Stars() {
  return (
    <div className="flex justify-center gap-1 text-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % REVIEWS.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-3xl text-center">
      <Stars />
      <div className="relative mt-8 min-h-[220px] sm:min-h-[180px]">
        {REVIEWS.map((r, i) => (
          <blockquote
            key={r.name}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <p className="font-serif text-2xl font-light italic leading-relaxed text-foreground sm:text-3xl">
              “{r.quote}”
            </p>
            <footer className="mt-6">
              <p className="text-sm font-medium tracking-wide text-foreground">
                {r.name}
              </p>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
                {r.location}
              </p>
            </footer>
          </blockquote>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {REVIEWS.map((r, i) => (
          <button
            key={r.name}
            type="button"
            aria-label={`Show review ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-accent/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
