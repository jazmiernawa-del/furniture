import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marks an order paid: status -> confirmed, all payments -> paid with the
 * PaymentIntent id, and saves the Stripe customer on the user's profile.
 * Idempotent — safe to call from both the webhook and the success page.
 */
export async function fulfillOrder(
  orderId: string,
  paymentIntentId: string | null,
  customerId: string | null,
): Promise<void> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("rental_orders")
    .select("id, status, user_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return;
  if (order.status !== "pending") return; // already handled

  await supabase
    .from("rental_orders")
    .update({
      status: "confirmed",
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", orderId);

  await supabase
    .from("payments")
    .update({
      status: "paid",
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("order_id", orderId);

  if (customerId && order.user_id) {
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", order.user_id);
  }
}

/**
 * Cancels a pending order and frees its reserved dates by deleting its
 * bookings (they cascade from order_items, but we cancel explicitly).
 */
export async function cancelPendingOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("rental_orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "pending") return;

  // Free the dates.
  const { data: items } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId);
  if (items?.length) {
    await supabase
      .from("bookings")
      .delete()
      .in(
        "order_item_id",
        items.map((i) => i.id),
      );
  }

  await supabase
    .from("rental_orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);
}
