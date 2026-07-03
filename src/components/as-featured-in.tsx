const OUTLETS = [
  "Architectural Digest",
  "Elle Decor",
  "Dwell",
  "Vogue Living",
  "Kinfolk",
  "Wallpaper*",
];

/** Magazine-style wordmarks, set as refined typography. */
export function AsFeaturedIn() {
  return (
    <div className="text-center">
      <p className="eyebrow">As featured in</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {OUTLETS.map((name) => (
          <span
            key={name}
            className="font-serif text-xl font-medium tracking-wide text-muted-foreground/70 transition-colors hover:text-foreground sm:text-2xl"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
