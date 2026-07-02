import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/products" className="transition hover:text-foreground">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">New</span>
      </nav>

      <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground">
        Add a product
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create the product first, then add images on the next screen.
      </p>

      <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-8">
        <ProductForm />
      </div>
    </div>
  );
}
