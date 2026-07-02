import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/data/admin";
import {
  addImageByUrl,
  deleteProduct,
  deleteProductImage,
  setPrimaryImage,
  uploadProductImage,
} from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const images = product.product_images ?? [];

  return (
    <div>
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/products" className="transition hover:text-foreground">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          Edit product
        </h1>
        <Link
          href={`/catalog/${product.slug}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          View in catalog →
        </Link>
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-8">
        <ProductForm product={product} />
      </div>

      {/* Images -------------------------------------------------------- */}
      <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-8">
        <h2 className="font-serif text-xl text-foreground">Images</h2>

        {images.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No images yet. Upload a file or add one by URL below.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={img.url}
                    alt={img.alt ?? product.name}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  {img.is_primary && (
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  {!img.is_primary && (
                    <form action={setPrimaryImage}>
                      <input type="hidden" name="image_id" value={img.id} />
                      <input type="hidden" name="product_id" value={product.id} />
                      <button className="text-accent transition hover:underline">
                        Make primary
                      </button>
                    </form>
                  )}
                  <form action={deleteProductImage} className="ml-auto">
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="product_id" value={product.id} />
                    <button className="text-red-600 transition hover:underline">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <form action={uploadProductImage} className="space-y-2">
            <input type="hidden" name="product_id" value={product.id} />
            <label className="block text-sm font-medium text-foreground">
              Upload an image
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
            />
            <button className="mt-1 rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted">
              Upload
            </button>
          </form>

          <form action={addImageByUrl} className="space-y-2">
            <input type="hidden" name="product_id" value={product.id} />
            <label className="block text-sm font-medium text-foreground">
              …or add by URL
            </label>
            <input
              type="url"
              name="url"
              placeholder="https://…"
              required
              className="block w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button className="mt-1 rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted">
              Add image
            </button>
          </form>
        </div>
      </div>

      {/* Danger zone --------------------------------------------------- */}
      <div className="mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="font-medium text-red-800">Delete product</h2>
        <p className="mt-1 text-sm text-red-700/80">
          Permanently removes this product, its images, and its availability.
          Existing orders keep their snapshot.
        </p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <button className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">
            Delete permanently
          </button>
        </form>
      </div>
    </div>
  );
}
