import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SetupNotice } from "@/components/setup-notice";
import { ProductGallery } from "@/components/product-gallery";
import { getProductBySlug } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency } from "@/lib/format";

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <SetupNotice />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <nav className="text-sm text-muted-foreground">
            <Link href="/catalog" className="transition hover:text-foreground">
              Catalog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <ProductGallery
              images={product.product_images}
              productName={product.name}
            />

            <div className="lg:pt-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {product.category}
                {product.style ? ` · ${product.style}` : ""}
              </p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  Condition: {conditionLabels[product.condition] ?? product.condition}
                </span>
              </div>

              {product.description && (
                <p className="mt-6 leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              {/* Pricing summary. The interactive date selector + availability
                  check are added in step 5. */}
              <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="text-lg font-medium text-foreground">
                    {formatCurrency(product.monthly_rate)}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </div>
                {product.weekly_rate != null && (
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-muted-foreground">Weekly</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(product.weekly_rate)}
                      <span className="text-sm text-muted-foreground">/wk</span>
                    </span>
                  </div>
                )}
                <div className="my-4 border-t border-border" />
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">
                    Refundable deposit
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(product.deposit)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(product.delivery_fee)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-full bg-foreground/40 px-6 py-3 text-sm font-medium text-background"
                >
                  Select rental dates
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Date selection, live availability & checkout arrive in the next
                  steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
