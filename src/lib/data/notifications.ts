import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Notification, OrderStatus } from "@/lib/types/database";

const MESSAGES: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  confirmed: {
    title: "Order confirmed",
    body: "Your rental is confirmed — we'll begin preparing your pieces.",
  },
  preparing: {
    title: "Preparing your order",
    body: "Our team is getting your furniture ready for delivery.",
  },
  out_for_delivery: {
    title: "Out for delivery",
    body: "Your rental is on its way to you.",
  },
  delivered: {
    title: "Delivered",
    body: "Your rental has arrived. Enjoy your new space.",
  },
  returned: {
    title: "Return complete",
    body: "Thank you for renting with Maison. Your deposit refund is on the way.",
  },
  cancelled: {
    title: "Order cancelled",
    body: "Your order has been cancelled.",
  },
};

/**
 * Create an in-app notification for an order status change. Runs with the
 * service role (bypasses RLS) — call only from trusted server code.
 */
export async function createOrderNotification(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const message = MESSAGES[status];
  if (!message || !isSupabaseConfigured()) return;

  try {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("rental_orders")
      .select("user_id, order_items(product_name)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;

    const o = order as unknown as {
      user_id: string;
      order_items?: { product_name: string }[];
    };
    const piece = o.order_items?.[0]?.product_name;
    const body = piece ? `${piece} — ${message.body}` : message.body;

    await admin.from("notifications").insert({
      user_id: o.user_id,
      title: message.title,
      body,
      order_id: orderId,
    });
  } catch (err) {
    console.error("createOrderNotification failed:", err);
  }
}

/** The current user's notifications, newest first. */
export async function getNotifications(limit = 12): Promise<Notification[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as Notification[]) ?? [];
  } catch {
    return [];
  }
}

/** Count of unread notifications for the current user. */
export async function getUnreadCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}
