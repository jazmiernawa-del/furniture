import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Catalog",
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
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <header className="max-w-2xl">
            <h1 className="font-serif text-4xl tracking-tight text-foreground">
              The collection
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Curated pieces, ready to rent. Choose a weekly or monthly term at
              checkout — delivery and pickup included.
            </p>
          </header>

          {configured && (
            <div className="mt-8">
              <CatalogFilters categories={categories} styles={styles} />
            </div>
          )}

          <div className="mt-8">
            {!configured ? (
              <SetupNotice />
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center text-muted-foreground">
                No pieces match your filters. Try widening your search.
              </div>
            ) : (
              <>
                <p className="mb-6 text-sm text-muted-foreground">
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
