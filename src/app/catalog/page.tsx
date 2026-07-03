import type { Metadata } from "next";
import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CatalogFilters } from "@/components/catalog-filters";
import { SetupNotice } from "@/components/setup-notice";
import {
  getProducts,
  getCategories,
  getStyles,
  type ProductQuery,
} from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/env";
import { luxeImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "The Collection",
  description: "Browse premium furniture available to rent by the week or month.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    style?: string;
    max?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const sp = await searchParams;
  const configured = isSupabaseConfigured();

  const query: ProductQuery = {
    search: sp.q,
    category: sp.category,
    style: sp.style,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    from: sp.from,
    to: sp.to,
  };

  const [products, categories, styles] = await Promise.all([
    getProducts(query),
    getCategories(),
    getStyles(),
  ]);

  return (
    <>
      {/* Cinematic banner */}
      <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={luxeImages.lifestyle}
          alt="A curated interior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/25 to-ink/85" />
        <SiteHeader variant="overlay" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-14 lg:px-10">
          <p className="eyebrow animate-fade text-accent">The Collection</p>
          <h1 className="animate-rise mt-4 font-serif text-6xl font-light leading-none text-white sm:text-7xl">
            Curated for living
          </h1>
          <p className="animate-rise delay-1 mt-5 max-w-xl text-lg font-light text-white/80">
            Designer pieces, ready to rent by the week or month — each with a
            refundable deposit and white-glove delivery.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          {configured && (
            <div className="mb-12">
              <CatalogFilters categories={categories} styles={styles} />
            </div>
          )}

          {!configured ? (
            <SetupNotice />
          ) : products.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
              No pieces match your filters. Try widening your search.
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </p>
                <div className="hidden h-px flex-1 max-w-xs bg-border sm:ml-6 sm:block" />
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
