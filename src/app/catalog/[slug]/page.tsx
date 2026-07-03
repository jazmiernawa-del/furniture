import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SetupNotice } from "@/components/setup-notice";
import { ProductGallery } from "@/components/product-gallery";
import { RentalSelector } from "@/components/rental-selector";
import { getProductBySlug } from "@/lib/data/products";
import { getBookedRanges } from "@/lib/data/availability";
import { isSupabaseConfigured } from "@/lib/env";

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

  const bookedRanges = await getBookedRanges(product.id);

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
              <p className="eyebrow">
                {product.category}
                {product.style ? ` · ${product.style}` : ""}
              </p>
              <h1 className="mt-4 font-serif text-5xl font-light leading-none tracking-tight text-foreground">
                {product.name}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Condition · {conditionLabels[product.condition] ?? product.condition}
                </span>
              </div>

              {product.description && (
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              <div className="mt-8 gold-rule w-20" />

              {/* Rental-period selection, availability calendar & pricing. */}
              <div className="mt-8">
                <RentalSelector
                  slug={product.slug}
                  monthlyRate={product.monthly_rate}
                  weeklyRate={product.weekly_rate}
                  deposit={product.deposit}
                  deliveryFee={product.delivery_fee}
                  bookedRanges={bookedRanges}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
