"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCart, saveCart, type CartItem } from "@/lib/cart";
import { checkAvailability } from "@/lib/data/availability";
import { getProductBySlug, primaryImage } from "@/lib/data/products";
import {
  computeEndDate,
  isRangeAvailable,
  todayISO,
} from "@/lib/rental";
import type { BillingPeriod } from "@/lib/types/database";

export interface CartActionState {
  error?: string | null;
}

export async function addToCart(
  _prev: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const slug = String(formData.get("slug") ?? "");
  const period = String(formData.get("period") ?? "monthly") as BillingPeriod;
  const periods = Math.max(1, Math.floor(Number(formData.get("periods") ?? 1)));
  const startDate = String(formData.get("start_date") ?? "");

  if (!slug || !startDate) {
    return { error: "Choose a start date first." };
  }
  if (startDate < todayISO()) {
    return { error: "Start date can't be in the past." };
  }

  const product = await getProductBySlug(slug);
  if (!product) return { error: "Product not found." };

  if (period === "weekly" && product.weekly_rate == null) {
    return { error: "This item isn't available weekly." };
  }

  const endDate = computeEndDate(startDate, period, periods);

  // Authoritative availability check against the database.
  const available = await checkAvailability(product.id, startDate, endDate);
  if (!available) {
    return { error: "Those dates just became unavailable. Try others." };
  }

  const cart = await getCart();

  // Guard against overlapping the same product twice within the cart.
  const sameProduct = cart
    .filter((i) => i.productId === product.id)
    .map((i) => ({ start: i.startDate, end: i.endDate }));
  if (!isRangeAvailable({ start: startDate, end: endDate }, sameProduct)) {
    return { error: "This item is already in your cart for overlapping dates." };
  }

  const rate =
    period === "weekly" ? Number(product.weekly_rate) : product.monthly_rate;
  const img = primaryImage(product);

  const item: CartItem = {
    id: randomUUID(),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: img?.url ?? null,
    period,
    periods,
    startDate,
    endDate,
    rate,
    deposit: product.deposit,
    deliveryFee: product.delivery_fee,
  };

  await saveCart([...cart, item]);
  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const cart = await getCart();
  await saveCart(cart.filter((i) => i.id !== id));
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}
