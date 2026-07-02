import Image from "next/image";
import Link from "next/link";

import { getAllProducts } from "@/lib/data/admin";
import { primaryImage } from "@/lib/data/products";
import { formatCurrency } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">
          No products yet. Add your first piece.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Monthly</th>
                <th className="px-4 py-3 font-medium">Deposit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const img = primaryImage(product);
                return (
                  <tr key={product.id} className="bg-card">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {img && (
                            <Image
                              src={img.url}
                              alt={product.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatCurrency(product.monthly_rate)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCurrency(product.deposit)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-accent transition hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
