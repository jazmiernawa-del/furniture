import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFavorites } from "@/lib/data/favorites";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const favorites = await getFavorites();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-12">
      <BackButton fallback="/account" label="My rentals" className="mb-8" />
      <p className="eyebrow">Your wishlist</p>
      <h1 className="mt-3 font-serif text-4xl font-light text-foreground">
        Saved pieces
      </h1>

      {favorites.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-border bg-card p-14 text-center">
          <p className="font-serif text-2xl font-light text-foreground">
            Nothing saved yet
          </p>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            Tap the heart on any piece to keep it here for later.
          </p>
          <Link
            href="/catalog"
            className="btn-ink mt-8 inline-flex rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em]"
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} favorited />
          ))}
        </div>
      )}
    </div>
  );
}
