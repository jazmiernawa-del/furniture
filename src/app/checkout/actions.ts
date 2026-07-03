"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { requireUser } from "@/lib/auth";
import { getCart, clearCart } from "@/lib/cart";
import {
  createPendingOrder,
  UnavailableError,
  type DeliveryInfo,
} from "@/lib/data/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, isStripeConfigured, toCents } from "@/lib/stripe";
import { publicEnv } from "@/lib/env";
import { periodLabel } from "@/lib/format";

export interface CheckoutState {
  error?: string | null;
}

export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await requireUser("/login?next=/checkout");

  if (!isStripeConfigured()) {
    return { error: "Payments aren't configured yet (missing Stripe keys)." };
  }

  const cart = await getCart();
  if (cart.length === 0) return { error: "Your cart is empty." };

  // Required delivery fields.
  const line1 = String(formData.get("line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postal = String(formData.get("postal_code") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();
  const deliveryDate = String(formData.get("delivery_date") ?? "").trim() || null;

  if (!line1 || !city || !state || !postal || !contactName) {
    return { error: "Please complete the delivery address and contact name." };
  }

  const delivery: DeliveryInfo = {
    address: {
      line1,
      line2: String(formData.get("line2") ?? "").trim() || null,
      city,
      state,
      postal_code: postal,
      country: String(formData.get("country") ?? "US").trim() || "US",
    },
    contactName,
    contactPhone,
    deliveryDate,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  // Create the pending order (also reserves the dates).
  let orderId: string;
  try {
    const result = await createPendingOrder(user.id, cart, delivery);
    orderId = result.orderId;
  } catch (err) {
    if (err instanceof UnavailableError) return { error: err.message };
    console.error("createPendingOrder failed:", err);
    return { error: "Something went wrong creating your order." };
  }

  // Build Stripe line items.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map(
    (item) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: toCents(item.rate * item.periods),
        product_data: {
          name: `${item.name} — ${item.periods} ${periodLabel(item.period)}${
            item.periods > 1 ? "s" : ""
          } rental`,
          description: `${item.startDate} → ${item.endDate}`,
        },
      },
    }),
  );

  const depositTotal = round2(
    cart.reduce((s, i) => s + i.deposit, 0),
  );
  const deliveryTotal = round2(cart.reduce((s, i) => s + i.deliveryFee, 0));

  if (depositTotal > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: toCents(depositTotal),
        product_data: {
          name: "Refundable security deposit",
          description: "Returned in full after pickup.",
        },
      },
    });
  }
  if (deliveryTotal > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: toCents(deliveryTotal),
        product_data: { name: "Delivery & pickup" },
      },
    });
  }

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user.email,
      client_reference_id: user.id,
      // Create a Customer and save the card for off-session charges (used when
      // extending a rental) and the billing portal.
      customer_creation: "always",
      metadata: { order_id: orderId, user_id: user.id },
      payment_intent_data: {
        metadata: { order_id: orderId },
        setup_future_usage: "off_session",
      },
      success_url: `${publicEnv.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicEnv.siteUrl}/checkout?canceled=1`,
    });
  } catch (err) {
    console.error("Stripe session failed:", err);
    // Roll back the reservation so the dates free up.
    await createAdminClient().from("rental_orders").delete().eq("id", orderId);
    return { error: "Could not start checkout. Please try again." };
  }

  // Persist the session id and clear the cart.
  await createAdminClient()
    .from("rental_orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", orderId);
  await clearCart();

  if (!session.url) return { error: "Stripe did not return a checkout URL." };
  redirect(session.url);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
