import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { computePrice, type DateRange } from "@/lib/rental";
import type { CartItem } from "@/lib/cart";
import type { Address, BillingPeriod } from "@/lib/types/database";

export interface DeliveryInfo {
  address: Address;
  contactName: string;
  contactPhone: string;
  deliveryDate: string | null;
  notes: string | null;
}

export interface OrderTotals {
  subtotal: number;
  depositTotal: number;
  deliveryFee: number;
  total: number;
  startDate: string;
  endDate: string;
  billingPeriod: BillingPeriod;
}

/** Aggregate a cart into order-level totals and date span. */
export function computeOrderTotals(cart: CartItem[]): OrderTotals {
  let subtotal = 0;
  let depositTotal = 0;
  let deliveryFee = 0;
  let start = cart[0]?.startDate ?? "";
  let end = cart[0]?.endDate ?? "";

  for (const item of cart) {
    const price = computePrice({
      rate: item.rate,
      periods: item.periods,
      deposit: item.deposit,
      deliveryFee: item.deliveryFee,
    });
    subtotal += price.rentalTotal;
    depositTotal += price.deposit;
    deliveryFee += price.deliveryFee;
    if (item.startDate < start) start = item.startDate;
    if (item.endDate > end) end = item.endDate;
  }

  // Order billing period is uniform if all items agree, else default monthly.
  const periods = new Set(cart.map((i) => i.period));
  const billingPeriod: BillingPeriod =
    periods.size === 1 ? cart[0].period : "monthly";

  return {
    subtotal: round2(subtotal),
    depositTotal: round2(depositTotal),
    deliveryFee: round2(deliveryFee),
    total: round2(subtotal + depositTotal + deliveryFee),
    startDate: start,
    endDate: end,
    billingPeriod,
  };
}

export class UnavailableError extends Error {}

/**
 * Creates a pending rental order with its items, bookings, and payment rows.
 * Bookings are inserted immediately so the dates are reserved during checkout;
 * the DB exclusion constraint guarantees no double-booking. Throws
 * UnavailableError if any item's dates were just taken.
 *
 * Runs with the service role (bypasses RLS) — callers MUST have verified the
 * user is authenticated and `userId` is their own id.
 */
export async function createPendingOrder(
  userId: string,
  cart: CartItem[],
  delivery: DeliveryInfo,
): Promise<{ orderId: string; totals: OrderTotals }> {
  if (cart.length === 0) throw new Error("Cart is empty.");

  const supabase = createAdminClient();
  const totals = computeOrderTotals(cart);

  const { data: order, error: orderError } = await supabase
    .from("rental_orders")
    .insert({
      user_id: userId,
      status: "pending",
      billing_period: totals.billingPeriod,
      start_date: totals.startDate,
      end_date: totals.endDate,
      delivery_date: delivery.deliveryDate,
      delivery_address: delivery.address,
      delivery_contact_name: delivery.contactName,
      delivery_contact_phone: delivery.contactPhone,
      notes: delivery.notes,
      subtotal: totals.subtotal,
      deposit_total: totals.depositTotal,
      delivery_fee: totals.deliveryFee,
      total: totals.total,
      currency: "usd",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Could not create order.");
  }

  // Insert items and get their ids back for the bookings.
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      cart.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        billing_period: item.period,
        rate: item.rate,
        periods: item.periods,
        deposit: item.deposit,
        start_date: item.startDate,
        end_date: item.endDate,
        line_total: round2(item.rate * item.periods),
      })),
    )
    .select("id, product_id, start_date, end_date");

  if (itemsError || !items) {
    await supabase.from("rental_orders").delete().eq("id", order.id);
    throw new Error(itemsError?.message ?? "Could not create order items.");
  }

  // Reserve the dates. The exclusion constraint rejects overlaps.
  const bookingRows = items.map((item) => ({
    product_id: item.product_id,
    order_item_id: item.id,
    during: rangeLiteral({ start: item.start_date, end: item.end_date }),
    reason: "rental",
  }));

  const { error: bookingError } = await supabase
    .from("bookings")
    .insert(bookingRows);

  if (bookingError) {
    // Roll back the whole order (cascades items).
    await supabase.from("rental_orders").delete().eq("id", order.id);
    if (bookingError.code === "23P01" || /exclu/i.test(bookingError.message)) {
      throw new UnavailableError(
        "One of your dates was just booked by someone else.",
      );
    }
    throw new Error(bookingError.message);
  }

  // Payment records (pending until Stripe confirms).
  const payments = [
    { type: "rental_fee" as const, amount: totals.subtotal },
    { type: "deposit" as const, amount: totals.depositTotal },
    { type: "delivery_fee" as const, amount: totals.deliveryFee },
  ].filter((p) => p.amount > 0);

  await supabase.from("payments").insert(
    payments.map((p) => ({
      order_id: order.id,
      type: p.type,
      amount: p.amount,
      currency: "usd",
      status: "pending" as const,
    })),
  );

  return { orderId: order.id, totals };
}

/** Half-open Postgres daterange literal, e.g. "[2026-01-01,2026-02-01)". */
function rangeLiteral(range: DateRange): string {
  return `[${range.start},${range.end})`;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
