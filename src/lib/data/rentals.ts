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

const OPEN_STATUSES = new Set([
  "pending",
  "confirmed",
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
