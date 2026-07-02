import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  OrderItem,
  Payment,
  Profile,
  RentalOrder,
} from "@/lib/types/database";
import type { ProductWithImages } from "@/lib/data/products";

/** All products regardless of status, newest first (admin view). */
export async function getAllProducts(): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllProducts failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProductWithImages[];
}

/** A single product with images, any status. */
export async function getProductById(
  id: string,
): Promise<ProductWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProductById failed:", error.message);
    return null;
  }
  if (!data) return null;

  const product = data as unknown as ProductWithImages;
  product.product_images = [...(product.product_images ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  return product;
}

export type AdminOrder = RentalOrder & {
  order_items: OrderItem[];
  payments: Payment[];
  profiles: Pick<Profile, "id" | "full_name" | "phone"> | null;
};

/** All rental orders with items, payments, and the renter's profile. */
export async function getAllOrders(): Promise<AdminOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_orders")
    .select(
      "*, order_items(*), payments(*), profiles(id, full_name, phone)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOrders failed:", error.message);
    return [];
  }
  return (data ?? []) as unknown as AdminOrder[];
}

export interface AdminStats {
  productCount: number;
  activeRentals: number;
  pendingOrders: number;
  depositsHeld: number;
}

/** Headline counts for the admin dashboard. */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [products, orders] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("rental_orders")
      .select("status, deposit_total")
      .in("status", ["pending", "confirmed", "delivered", "active"]),
  ]);

  const open = orders.data ?? [];
  const depositsHeld = open
    .filter((o) => ["delivered", "active"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.deposit_total ?? 0), 0);

  return {
    productCount: products.count ?? 0,
    activeRentals: open.filter((o) => o.status === "active").length,
    pendingOrders: open.filter((o) => o.status === "pending").length,
    depositsHeld,
  };
}
