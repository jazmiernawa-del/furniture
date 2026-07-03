import { formatCurrency } from "@/lib/format";

/**
 * Monthly revenue — a single-series bar chart in the brand gold. One measure,
 * one axis, one hue; the title names the series so no legend is needed. Each
 * bar carries a native hover tooltip (<title>).
 */
export function RevenueChart({
  data,
}: {
  data: { label: string; revenue: number }[];
}) {
  const W = 640;
  const H = 260;
  const padX = 16;
  const padTop = 28;
  const padBottom = 34;
  const plotH = H - padTop - padBottom;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const peak = data.reduce((a, b) => (b.revenue > a.revenue ? b : a), data[0]);

  const n = data.length;
  const slot = (W - padX * 2) / n;
  const barW = Math.min(46, slot * 0.5);

  const hasRevenue = data.some((d) => d.revenue > 0);

  return (
    <figure className="m-0">
      <figcaption className="mb-5 flex items-baseline justify-between">
        <span className="eyebrow">Monthly revenue</span>
        <span className="text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
          Last 6 months
        </span>
      </figcaption>

      {!hasRevenue ? (
        <div className="flex h-40 items-center justify-center rounded-sm border border-dashed border-border text-sm text-muted-foreground">
          No revenue yet — completed rentals will appear here.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Monthly revenue bar chart"
        >
          <defs>
            <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8a56a" />
              <stop offset="100%" stopColor="#a1783f" />
            </linearGradient>
          </defs>

          {/* baseline */}
          <line
            x1={padX}
            y1={padTop + plotH}
            x2={W - padX}
            y2={padTop + plotH}
            stroke="#e0d6c5"
            strokeWidth="1"
          />

          {data.map((d, i) => {
            const h = (d.revenue / max) * plotH;
            const x = padX + slot * i + (slot - barW) / 2;
            const y = padTop + plotH - h;
            const isPeak = d === peak && d.revenue > 0;
            return (
              <g key={d.label}>
                {h > 0 && (
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx="4"
                    fill="url(#goldBar)"
                  >
                    <title>{`${d.label}: ${formatCurrency(d.revenue)}`}</title>
                  </rect>
                )}
                {isPeak && (
                  <text
                    x={x + barW / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="13"
                    fontFamily="Georgia, serif"
                    fill="#1b1813"
                  >
                    {formatCurrency(d.revenue)}
                  </text>
                )}
                <text
                  x={x + barW / 2}
                  y={padTop + plotH + 20}
                  textAnchor="middle"
                  fontSize="11"
                  letterSpacing="1"
                  fill="#877c6d"
                  style={{ textTransform: "uppercase" }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </figure>
  );
}
