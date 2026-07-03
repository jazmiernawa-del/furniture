import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { primaryImage, type ProductWithImages } from "@/lib/data/products";
import { fallbackProductImage } from "@/lib/images";
import { FavoriteButton } from "@/components/favorite-button";

export function ProductCard({
  product,
  favorited = false,
}: {
  product: ProductWithImages;
  favorited?: boolean;
}) {
  const image = primaryImage(product);
  const src = image?.url ?? fallbackProductImage;

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          productId={product.id}
          favorited={favorited}
          redirectTo="/catalog"
        />
      </div>

      <Link href={`/catalog/${product.slug}`} className="block">
        <div className="zoom-parent relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
          <Image
            src={src}
            alt={image?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="pointer-events-none absolute inset-3 ring-1 ring-inset ring-accent/0 transition-all duration-500 group-hover:ring-accent/70" />
          <span className="absolute bottom-4 left-4 translate-y-2 text-xs font-medium uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            View piece →
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              {product.category}
              {product.style ? ` · ${product.style}` : ""}
            </p>
            <h3 className="mt-1.5 font-serif text-xl text-foreground transition-colors group-hover:text-accent-strong">
              {product.name}
            </h3>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-serif text-lg text-accent-strong">
              {formatCurrency(product.monthly_rate)}
            </span>
            <span className="block text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
              per month
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}
