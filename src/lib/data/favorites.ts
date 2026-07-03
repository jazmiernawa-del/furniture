import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUser } from "@/lib/auth";
import type { ProductWithImages } from "@/lib/data/products";

/** Set of product ids the current user has favorited (empty if logged out). */
export async function getFavoriteIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();
  try {
    const user = await getUser();
    if (!user) return new Set();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id");
    if (error || !data) return new Set();
    return new Set(data.map((r) => r.product_id));
  } catch {
    return new Set();
  }
}

/** The current user's favorited products, with images. */
export async function getFavorites(): Promise<ProductWithImages[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const user = await getUser();
    if (!user) return [];
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("favorites")
      .select("created_at, products(*, product_images(*))")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data
      .map((row) => (row as unknown as { products: ProductWithImages }).products)
      .filter((p): p is ProductWithImages => Boolean(p));
  } catch {
    return [];
  }
}
