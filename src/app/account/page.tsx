import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { RentalActions } from "@/components/rental-actions";
import { OrderTracker, isTrackable } from "@/components/order-tracker";
import { ProductCard } from "@/components/product-card";
import { RoomGallery } from "@/components/room-gallery";
import { Reveal } from "@/components/reveal";
import { getProfile } from "@/lib/auth";
import {
  getUserOrders,
  splitOrders,
  getProductThumbnails,
  type UserOrder,
} from "@/lib/data/rentals";
import { getFavoriteIds } from "@/lib/data/favorites";
import { getRecommendations } from "@/lib/data/products";
import { formatCurrency, formatDate } from "@/lib/format";
import { fromISO } from "@/lib/rental";
import { fallbackProductImage, luxeImages } from "@/lib/images";

export const metadata: Metadata = { title: "My Rentals" };

const EXTENDABLE = new Set([
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "overdue",
]);

export default async function AccountPage() {
  const [orders, favIds, profile] = await Promise.all([
    getUserOrders(),
    getFavoriteIds(),
    getProfile(),
  ]);
  const { active, past } = splitOrders(orders);

  const productIds = orders.flatMap((o) =>
    (o.order_items ?? []).map((i) => i.product_id),
  );
  const rentedIds = Array.from(new Set(productIds));
  const [thumbs, recommendations] = await Promise.all([
    getProductThumbnails(productIds),
    getRecommendations(rentedIds, 4),
  ]);

  const firstName = profile?.full_name?.split(" ")[0];
  const totalPieces = orders.reduce(
    (s, o) => s + (o.order_items?.length ?? 0),
    0,
  );

  const stats = [
    { label: "Active rentals", value: active.length, icon: <SofaIcon /> },
    { label: "Items saved", value: favIds.size, icon: <HeartIcon /> },
    { label: "Pieces rented", value: totalPieces, icon: <StackIcon /> },
  ];

  return (
    <>
      {/* ===== Welcome hero ===== */}
      <section className="aurora relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 lg:px-12 lg:py-24">
          <p className="animate-fade text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accent">
            Your private residence
          </p>
          <h1 className="animate-rise mt-5 font-serif text-5xl font-light leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            {firstName ? (
              <>
                Welcome back,
                <br />
                <span className="italic text-white/90">{firstName}</span>
              </>
            ) : (
              "Welcome back"
            )}
          </h1>
          <p className="animate-rise delay-1 mt-6 max-w-md text-lg font-light leading-relaxed text-ink-foreground/70">
            Your collection, curated and cared for. Track deliveries, extend a
            stay, or discover your next piece.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-12">
        {/* ===== Stat cards ===== */}
        <Reveal className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="hover-lift rounded-sm border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 text-accent-strong">
                  {s.icon}
                </span>
                <span className="font-serif text-4xl font-light text-foreground">
                  {s.value}
                </span>
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </Reveal>

        {/* ===== Active rentals ===== */}
        <div className="mt-16 flex items-baseline justify-between">
          <div>
            <p className="eyebrow">In residence</p>
            <h2 className="mt-2 font-serif text-3xl font-light text-foreground">
              Active rentals
            </h2>
          </div>
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            {active.length} piece{active.length === 1 ? "" : "s"}
          </span>
        </div>

        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 space-y-6">
            {active.map((order, i) => (
              <Reveal key={order.id} delay={i * 80}>
                <RentalCard order={order} thumbs={thumbs} interactive />
              </Reveal>
            ))}
          </div>
        )}

        {/* ===== Your Space mood board ===== */}
        <section className="mt-20">
          <Reveal>
            <p className="eyebrow">Your space</p>
            <h2 className="mt-2 font-serif text-3xl font-light text-foreground">
              Inspiration for your rooms
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              A little mood board — spaces styled with pieces like yours.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-8">
            <RoomGallery />
          </Reveal>
        </section>

        {/* ===== Recommended ===== */}
        {recommendations.length > 0 && (
          <section className="mt-20">
            <Reveal>
              <p className="eyebrow">Curated for you</p>
              <h2 className="mt-2 font-serif text-3xl font-light text-foreground">
                Recommended pieces
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                {rentedIds.length
                  ? "Chosen to complement what you've rented."
                  : "A few favourites to begin your collection."}
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {recommendations.map((product, i) => (
                <Reveal key={product.id} delay={i * 80}>
                  <ProductCard product={product} favorited={favIds.has(product.id)} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ===== History ===== */}
        {past.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow">The archive</p>
            <h2 className="mt-2 font-serif text-3xl font-light text-foreground">
              Rental history
            </h2>
            <div className="mt-8 space-y-6">
              {past.map((order) => (
                <RentalCard key={order.id} order={order} thumbs={thumbs} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function RentalCard({
  order,
  thumbs,
  interactive = false,
}: {
  order: UserOrder;
  thumbs: Record<string, string>;
  interactive?: boolean;
}) {
  const deposit = order.payments?.find((p) => p.type === "deposit");
  const depositRefunded =
    deposit?.status === "refunded" || deposit?.status === "partially_refunded";
  const canAct = interactive && EXTENDABLE.has(order.status);
  const items = order.order_items ?? [];
  const heroImg =
    (items[0] && thumbs[items[0].product_id]) || fallbackProductImage;

  return (
    <article className="hover-lift overflow-hidden rounded-sm border border-border bg-card">
      <div className="flex flex-col md:flex-row">
        <div className="zoom-parent relative h-56 w-full shrink-0 overflow-hidden md:h-auto md:w-72">
          <Image
            src={heroImg}
            alt={items[0]?.product_name ?? "Rental"}
            fill
            sizes="(min-width: 768px) 288px, 100vw"
            className="zoom-img object-cover"
          />
          <span className="absolute left-4 top-4">
            <StatusBadge status={order.status} />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-serif text-2xl font-light text-foreground">
                {items[0]?.product_name ?? "Rental"}
                {items.length > 1 && (
                  <span className="text-muted-foreground"> + {items.length - 1} more</span>
                )}
              </p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                {order.billing_period} rental · #{order.id.slice(0, 8)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-accent-strong">
                {formatCurrency(Number(order.total))}
              </p>
              <p className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                {depositRefunded
                  ? "Deposit refunded"
                  : `${formatCurrency(Number(order.deposit_total))} deposit held`}
              </p>
            </div>
          </div>

          <RentalTimeline start={order.start_date} end={order.end_date} />

          {isTrackable(order.status) && <OrderTracker status={order.status} />}

          {canAct && (
            <div className="mt-auto">
              <RentalActions
                orderId={order.id}
                canExtend={EXTENDABLE.has(order.status)}
                canReturn={EXTENDABLE.has(order.status)}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Elegant start → end timeline with a today marker. */
function RentalTimeline({ start, end }: { start: string; end: string }) {
  const s = fromISO(start).getTime();
  const e = fromISO(end).getTime();
  // Current time is read per-request during server render (intentional).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const progress =
    e > s ? Math.min(1, Math.max(0, (now - s) / (e - s))) : 0;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{formatDate(start)}</span>
        <span>{formatDate(end)}</span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-accent-strong shadow"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-sm">
      <div className="relative h-[420px] w-full">
        <Image
          src={luxeImages.feature}
          alt="A beautifully furnished room"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/20" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accent">
          A blank canvas
        </p>
        <h3 className="mt-4 max-w-lg font-serif text-4xl font-light leading-tight text-white sm:text-5xl">
          Your collection awaits
        </h3>
        <p className="mt-4 max-w-sm text-ink-foreground/75">
          You have no active rentals yet. Explore the collection and bring
          something extraordinary home.
        </p>
        <Link
          href="/catalog"
          className="btn-gold mt-8 inline-flex rounded-full px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em]"
        >
          Explore the collection
        </Link>
      </div>
    </div>
  );
}

/* ---- icons ---- */
function SofaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      <path d="M3 13a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h10v-2a2 2 0 0 1 4 0v5H3z" />
      <path d="M6 18v2M18 18v2" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5.42 3.64 3.8 5.75 3.8c1.2 0 2.35.56 3.1 1.45L12 8.6l3.15-3.35c.75-.89 1.9-1.45 3.1-1.45C20.36 3.8 22 5.42 22 7.5c0 3.78-3.4 6.86-8.55 11.68L12 20.5z" />
    </svg>
  );
}
function StackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}
