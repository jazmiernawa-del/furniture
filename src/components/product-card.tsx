import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { primaryImage, type ProductWithImages } from "@/lib/data/products";

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export function ProductCard({ product }: { product: ProductWithImages }) {
  const image = primaryImage(product);

  return (
    <Link href={`/catalog/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          {conditionLabels[product.condition] ?? product.condition}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category}
            {product.style ? ` · ${product.style}` : ""}
          </p>
          <h3 className="mt-1 font-medium text-foreground transition group-hover:text-accent">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 text-right text-sm">
          <span className="font-medium text-foreground">
            {formatCurrency(product.monthly_rate)}
          </span>
          <span className="text-muted-foreground">/mo</span>
        </p>
      </div>
    </Link>
  );
}
