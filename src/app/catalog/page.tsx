import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { SetupNotice } from "@/components/setup-notice";
import { getProducts } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse premium furniture available to rent by the week or month.",
};

export default async function CatalogPage() {
  const configured = isSupabaseConfigured();
  const products = await getProducts();

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

          <div className="mt-12">
            {!configured ? (
              <SetupNotice />
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center text-muted-foreground">
                No products yet. Add some from the admin panel, or run{" "}
                <code className="text-sm">supabase/seed.sql</code>.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
