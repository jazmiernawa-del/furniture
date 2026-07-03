import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderNotification } from "@/lib/data/notifications";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { OrderItem, RentalOrder } from "@/lib/types/database";

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

  // In-app notification + confirmation email.
  await createOrderNotification(orderId, "confirmed");

  try {
    const { data: full } = await supabase
      .from("rental_orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    const { data: userRes } = await supabase.auth.admin.getUserById(
      order.user_id,
    );
    const email = userRes?.user?.email;
    const o = full as unknown as (RentalOrder & { order_items: OrderItem[] }) | null;

    if (email && o) {
      await sendOrderConfirmationEmail({
        to: email,
        orderId: o.id,
        startDate: o.start_date,
        endDate: o.end_date,
        billingPeriod: o.billing_period,
        subtotal: Number(o.subtotal),
        deposit: Number(o.deposit_total),
        deliveryFee: Number(o.delivery_fee),
        total: Number(o.total),
        items: (o.order_items ?? []).map((i) => ({
          product_name: i.product_name,
          periods: i.periods,
          billing_period: i.billing_period,
          line_total: Number(i.line_total),
        })),
      });
    }
  } catch (err) {
    console.error("confirmation email step failed:", err);
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
