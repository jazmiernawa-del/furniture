const BADGES = [
  {
    title: "Secure Payment",
    body: "256-bit encrypted checkout via Stripe.",
    icon: (
      <path d="M12 2l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V5l7-3z" />
    ),
  },
  {
    title: "White-Glove Delivery",
    body: "Scheduled, in-home delivery & pickup.",
    icon: (
      <path d="M3 13h11V6H3v7zm11 0h4l3 3v3h-2m-5-6l4 0M5 19a2 2 0 11.001-.001M17 19a2 2 0 11.001-.001" />
    ),
  },
  {
    title: "Easy Returns",
    body: "Extend or return early, anytime.",
    icon: <path d="M3 12a9 9 0 109-9 9 9 0 00-9 9zm0 0l4-4m-4 4l4 4" />,
  },
  {
    title: "Refundable Deposit",
    body: "Returned in full after pickup.",
    icon: (
      <path d="M12 3v18m5-14a4 4 0 00-4-3H10a3 3 0 000 6h4a3 3 0 010 6h-3a4 4 0 01-4-3" />
    ),
  },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {BADGES.map((b) => (
        <div key={b.title} className="text-center lg:text-left">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 text-accent-strong">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {b.icon}
            </svg>
          </span>
          <h3 className="mt-4 font-serif text-xl text-foreground">{b.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {b.body}
          </p>
        </div>
      ))}
    </div>
  );
}
