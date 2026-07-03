"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAvailability } from "@/lib/data/availability";
import { getStripe, isStripeConfigured, toCents } from "@/lib/stripe";
import { publicEnv } from "@/lib/env";
import { computeEndDate, todayISO } from "@/lib/rental";
import { createOrderNotification } from "@/lib/data/notifications";
import type { OrderItem, RentalOrder } from "@/lib/types/database";

type OwnedOrder = RentalOrder & { order_items: OrderItem[] };

const EXTENDABLE = new Set([
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "overdue",
]);
const RETURNABLE = new Set([
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
  "overdue",
]);

/** Loads an order the current user owns, or null. Uses RLS (own rows only). */
async function ownedOrder(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rental_orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();
  return (data as unknown as OwnedOrder | null) ?? null;
}

/**
 * Return a rental early: marks it returned and frees future dates by clamping
 * each item's booking to end today.
 */
export async function returnEarly(formData: FormData): Promise<void> {
  const user = await requireUser();
  const orderId = String(formData.get("order_id") ?? "");
  if (!orderId) return;

  const order = await ownedOrder(orderId);
  if (!order || order.user_id !== user.id) return;
  if (!RETURNABLE.has(order.status)) return;

  const admin = createAdminClient();
  const today = todayISO();

  for (const item of order.order_items ?? []) {
    // Find this item's booking and clamp it.
    const { data: booking } = await admin
      .from("bookings")
      .select("id")
      .eq("order_item_id", item.id)
      .maybeSingle();
    if (!booking) continue;

    if (today > item.start_date) {
      // Occupied through today; free everything after.
      await admin
        .from("bookings")
        .update({ during: `[${item.start_date},${today})` })
        .eq("id", booking.id);
    } else {
      // Not started yet — free the whole reservation.
      await admin.from("bookings").delete().eq("id", booking.id);
    }
  }

  await admin
    .from("rental_orders")
    .update({ status: "returned" })
    .eq("id", orderId);
  await createOrderNotification(orderId, "returned");

  revalidatePath("/account");
  revalidatePath("/admin/rentals");
}

/**
 * Extend a rental by N additional billing periods. Validates the extra window
 * is free for every item, updates bookings + item terms + order totals, and
 * records (and attempts to charge, off-session) the additional rent.
 */
export async function extendRental(formData: FormData): Promise<void> {
  const user = await requireUser();
  const orderId = String(formData.get("order_id") ?? "");
  const extra = Math.max(1, Math.floor(Number(formData.get("periods") ?? 1)));
  if (!orderId) return;

  const order = await ownedOrder(orderId);
  if (!order || order.user_id !== user.id) return;
  if (!EXTENDABLE.has(order.status)) return;

  const admin = createAdminClient();
  let deltaTotal = 0;
  let latestEnd = order.end_date;

  for (const item of order.order_items ?? []) {
    const newEnd = computeEndDate(item.end_date, item.billing_period, extra);

    // The extra window [current end, new end) must be free.
    const free = await checkAvailability(item.product_id, item.end_date, newEnd);
    if (!free) {
      // Abort the whole extension if any item can't extend.
      revalidatePath("/account");
      return;
    }

    const { data: booking } = await admin
      .from("bookings")
      .select("id")
      .eq("order_item_id", item.id)
      .maybeSingle();
    if (booking) {
      await admin
        .from("bookings")
        .update({ during: `[${item.start_date},${newEnd})` })
        .eq("id", booking.id);
    }

    const newPeriods = item.periods + extra;
    await admin
      .from("order_items")
      .update({
        periods: newPeriods,
        end_date: newEnd,
        line_total: round2(item.rate * newPeriods),
      })
      .eq("id", item.id);

    deltaTotal += round2(item.rate * extra);
    if (newEnd > latestEnd) latestEnd = newEnd;
  }

  deltaTotal = round2(deltaTotal);

  await admin
    .from("rental_orders")
    .update({
      end_date: latestEnd,
      subtotal: round2(Number(order.subtotal) + deltaTotal),
      total: round2(Number(order.total) + deltaTotal),
    })
    .eq("id", orderId);

  // Record the additional rent and try to charge the saved card off-session.
  let paymentStatus: "pending" | "paid" = "pending";
  let paymentIntentId: string | null = null;

  if (deltaTotal > 0 && isStripeConfigured()) {
    const profile = await getProfile();
    if (profile?.stripe_customer_id) {
      try {
        const stripe = getStripe();
        const methods = await stripe.paymentMethods.list({
          customer: profile.stripe_customer_id,
          type: "card",
          limit: 1,
        });
        const pm = methods.data[0];
        if (pm) {
          const intent = await stripe.paymentIntents.create({
            amount: toCents(deltaTotal),
            currency: "usd",
            customer: profile.stripe_customer_id,
            payment_method: pm.id,
            off_session: true,
            confirm: true,
            metadata: { order_id: orderId, kind: "extension" },
          });
          if (intent.status === "succeeded") {
            paymentStatus = "paid";
            paymentIntentId = intent.id;
          }
        }
      } catch (err) {
        console.error("off-session extension charge failed:", err);
      }
    }
  }

  if (deltaTotal > 0) {
    await admin.from("payments").insert({
      order_id: orderId,
      type: "rental_fee",
      amount: deltaTotal,
      currency: "usd",
      status: paymentStatus,
      stripe_payment_intent_id: paymentIntentId,
    });
  }

  revalidatePath("/account");
  revalidatePath("/admin/rentals");
}

export interface ProfileState {
  error?: string | null;
  message?: string | null;
}

/** Update the current user's profile (name + phone). */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account", "layout");
  return { message: "Profile updated." };
}

/** Open the Stripe billing portal to manage saved payment methods. */
export async function manageBilling(): Promise<void> {
  await requireUser();
  const profile = await getProfile();

  if (!isStripeConfigured() || !profile?.stripe_customer_id) {
    redirect("/account?billing=unavailable");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile!.stripe_customer_id!,
    return_url: `${publicEnv.siteUrl}/account`,
  });
  redirect(session.url);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
