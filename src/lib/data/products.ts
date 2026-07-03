import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Product, ProductImage } from "@/lib/types/database";

/** A product with its images attached (images ordered by position). */
export type ProductWithImages = Product & {
  product_images: ProductImage[];
};

/** The primary image for a product, or the first available, or null. */
export function primaryImage(product: ProductWithImages): ProductImage | null {
  const images = product.product_images ?? [];
  return images.find((img) => img.is_primary) ?? images[0] ?? null;
}

export interface ProductQuery {
  category?: string;
  search?: string;
  style?: string;
  maxPrice?: number;
  /** Availability window (inclusive start, exclusive end), "YYYY-MM-DD". */
  from?: string;
  to?: string;
}

/**
 * Fetch active products for the catalog with optional filters. Returns []
 * (never throws) when Supabase isn't configured or the query fails.
 */
export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductWithImages[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let builder = supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (query.category) builder = builder.eq("category", query.category);
    if (query.style) builder = builder.eq("style", query.style);
    if (query.search) builder = builder.ilike("name", `%${query.search}%`);
    if (typeof query.maxPrice === "number") {
      builder = builder.lte("monthly_rate", query.maxPrice);
    }

    const { data, error } = await builder;
    if (error) {
      console.error("getProducts failed:", error.message);
      return [];
    }
    let rows = (data ?? []) as unknown as ProductWithImages[];

    // Availability filter: drop products booked during [from, to).
    if (query.from && query.to && query.to > query.from) {
      const { data: booked } = await supabase
        .from("bookings")
        .select("product_id, during")
        .overlaps("during", `[${query.from},${query.to})`);
      const bookedIds = new Set((booked ?? []).map((b) => b.product_id));
      rows = rows.filter((p) => !bookedIds.has(p.id));
    }

    return rows.map(sortImages);
  } catch (err) {
    console.error("getProducts threw:", err);
    return [];
  }
}

/** Fetch a single active product by slug, with images. Null if missing. */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("getProductBySlug failed:", error.message);
      return null;
    }
    return data ? sortImages(data as unknown as ProductWithImages) : null;
  } catch (err) {
    console.error("getProductBySlug threw:", err);
    return null;
  }
}

/** Distinct category names among active products (for filter chips). */
export async function getCategories(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("status", "active");

    if (error || !data) return [];
    return Array.from(new Set(data.map((row) => row.category))).sort();
  } catch {
    return [];
  }
}

/** Distinct non-null style names among active products (for filter chips). */
export async function getStyles(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("style")
      .eq("status", "active")
      .not("style", "is", null);

    if (error || !data) return [];
    return Array.from(
      new Set(data.map((row) => row.style).filter((s): s is string => !!s)),
    ).sort();
  } catch {
    return [];
  }
}

function sortImages(product: ProductWithImages): ProductWithImages {
  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  return { ...product, product_images: images };
}
