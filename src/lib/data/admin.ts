import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  OrderItem,
  OrderStatus,
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

// Statuses that represent paid revenue (everything past pending, not cancelled).
const PAID_STATUSES: OrderStatus[] = [
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "returned",
  "overdue",
];

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  monthly: { label: string; revenue: number }[];
}

/** Revenue = rental + delivery (deposit is refundable, so excluded). */
export async function getSalesStats(): Promise<SalesStats> {
  const supabase = await createClient();

  const [{ data: orders }, { count: customerCount }] = await Promise.all([
    supabase
      .from("rental_orders")
      .select("subtotal, delivery_fee, created_at, status")
      .in("status", PAID_STATUSES),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
  ]);

  const list = orders ?? [];
  const revenueOf = (o: { subtotal: number; delivery_fee: number }) =>
    Number(o.subtotal) + Number(o.delivery_fee);

  const totalRevenue = list.reduce((s, o) => s + revenueOf(o), 0);

  // Last 6 months, oldest → newest.
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      revenue: 0,
    };
  });
  const idx = new Map(months.map((m, i) => [m.key, i]));
  for (const o of list) {
    const d = new Date(o.created_at);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) months[i].revenue += revenueOf(o);
  }

  return {
    totalRevenue: Math.round(totalRevenue),
    totalOrders: list.length,
    totalCustomers: customerCount ?? 0,
    monthly: months.map((m) => ({
      label: m.label,
      revenue: Math.round(m.revenue),
    })),
  };
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
