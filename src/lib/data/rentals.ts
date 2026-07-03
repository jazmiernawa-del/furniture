import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { OrderItem, Payment, RentalOrder } from "@/lib/types/database";

export type UserOrder = RentalOrder & {
  order_items: OrderItem[];
  payments: Payment[];
};

/** The signed-in user's orders (RLS restricts to their own), newest first. */
export async function getUserOrders(): Promise<UserOrder[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rental_orders")
      .select("*, order_items(*), payments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getUserOrders failed:", error.message);
      return [];
    }
    return (data ?? []) as unknown as UserOrder[];
  } catch {
    return [];
  }
}

/** Map of product_id -> a representative image URL, for rental cards. */
export async function getProductThumbnails(
  productIds: string[],
): Promise<Record<string, string>> {
  const ids = Array.from(new Set(productIds));
  if (!isSupabaseConfigured() || ids.length === 0) return {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("product_id, url, is_primary, position")
      .in("product_id", ids)
      .order("is_primary", { ascending: false })
      .order("position", { ascending: true });

    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const row of data) {
      if (!map[row.product_id]) map[row.product_id] = row.url;
    }
    return map;
  } catch {
    return {};
  }
}

const OPEN_STATUSES = new Set([
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "overdue",
]);

/** Split orders into currently-open rentals and past history. */
export function splitOrders(orders: UserOrder[]): {
  active: UserOrder[];
  past: UserOrder[];
} {
  const active: UserOrder[] = [];
  const past: UserOrder[] = [];
  for (const o of orders) {
    (OPEN_STATUSES.has(o.status) ? active : past).push(o);
  }
  return { active, past };
}
