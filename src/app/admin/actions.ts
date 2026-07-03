"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { getStripe, isStripeConfigured, toCents } from "@/lib/stripe";
import { slugify } from "@/lib/slug";
import type {
  OrderStatus,
  ProductCondition,
  ProductStatus,
} from "@/lib/types/database";

export interface ActionState {
  error?: string | null;
  message?: string | null;
}

const CONDITIONS: ProductCondition[] = ["new", "like_new", "good", "fair"];
const STATUSES: ProductStatus[] = ["active", "archived"];

function parseMoney(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

interface ProductInput {
  name: string;
  category: string;
  style: string | null;
  description: string | null;
  condition: ProductCondition;
  monthly_rate: number;
  weekly_rate: number | null;
  deposit: number;
  delivery_fee: number;
  status: ProductStatus;
}

function readProduct(formData: FormData):
  | { ok: true; value: ProductInput }
  | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const condition = String(formData.get("condition") ?? "good") as ProductCondition;
  const status = String(formData.get("status") ?? "active") as ProductStatus;
  const monthly = parseMoney(formData.get("monthly_rate"));
  const deposit = parseMoney(formData.get("deposit")) ?? 0;
  const deliveryFee = parseMoney(formData.get("delivery_fee")) ?? 0;
  const weeklyRaw = formData.get("weekly_rate");
  const weekly = parseMoney(weeklyRaw);

  if (!name) return { ok: false, error: "Name is required." };
  if (!category) return { ok: false, error: "Category is required." };
  if (monthly == null) return { ok: false, error: "Enter a valid monthly rate." };
  if (!CONDITIONS.includes(condition))
    return { ok: false, error: "Invalid condition." };
  if (!STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  return {
    ok: true,
    value: {
      name,
      category,
      style: (String(formData.get("style") ?? "").trim() || null),
      description: (String(formData.get("description") ?? "").trim() || null),
      condition,
      monthly_rate: monthly,
      weekly_rate: weeklyRaw === "" ? null : weekly,
      deposit,
      delivery_fee: deliveryFee,
      status,
    },
  };
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readProduct(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const slug = `${slugify(parsed.value.name)}-${randomUUID().slice(0, 6)}`;

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.value, slug })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect(`/admin/products/${data.id}/edit?created=1`);
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const parsed = readProduct(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(parsed.value)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/catalog");
  return { message: "Saved." };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect("/admin/products");
}

export async function uploadProductImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const file = formData.get("file");
  if (!productId || !(file instanceof File) || file.size === 0) return;

  const supabase = await createClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${productId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(publicEnv.productBucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("image upload failed:", uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(publicEnv.productBucket).getPublicUrl(path);

  // Count existing images to set position and primary flag.
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const position = count ?? 0;
  await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl,
    alt: null,
    position,
    is_primary: position === 0, // first image becomes primary
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/catalog");
}

export async function addImageByUrl(formData: FormData): Promise<void> {
  await requireAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!productId || !url) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const position = count ?? 0;
  await supabase.from("product_images").insert({
    product_id: productId,
    url,
    alt: null,
    position,
    is_primary: position === 0,
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/catalog");
}

export async function deleteProductImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const imageId = String(formData.get("image_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  if (!imageId) return;

  const supabase = await createClient();
  await supabase.from("product_images").delete().eq("id", imageId);

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/catalog");
}

export async function setPrimaryImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const imageId = String(formData.get("image_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  if (!imageId || !productId) return;

  const supabase = await createClient();
  // Clear the current primary first (partial unique index allows one).
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("is_primary", true);
  await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/catalog");
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivered",
  "active",
  "returned",
  "overdue",
  "cancelled",
];

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderId || !ORDER_STATUSES.includes(status)) return;

  const supabase = await createClient();
  await supabase.from("rental_orders").update({ status }).eq("id", orderId);

  revalidatePath("/admin/rentals");
  revalidatePath("/account");
}

/**
 * Refunds the security deposit for an order. Issues a partial Stripe refund
 * (deposit amount) against the order's PaymentIntent when Stripe is configured,
 * then records it. Falls back to a DB-only refund when Stripe isn't set up.
 */
export async function refundDeposit(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = String(formData.get("order_id") ?? "");
  if (!orderId) return;

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status, stripe_payment_intent_id")
    .eq("order_id", orderId)
    .eq("type", "deposit")
    .maybeSingle();

  if (!payment) return;
  if (payment.status === "refunded") return;

  let stripeRefundId: string | null = null;
  if (isStripeConfigured() && payment.stripe_payment_intent_id) {
    try {
      const refund = await getStripe().refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: toCents(Number(payment.amount)),
      });
      stripeRefundId = refund.id;
    } catch (err) {
      console.error("Stripe deposit refund failed:", err);
      return; // don't mark refunded if Stripe rejected it
    }
  }

  await supabase
    .from("payments")
    .update({
      status: "refunded",
      refunded_amount: payment.amount,
      stripe_refund_id: stripeRefundId,
    })
    .eq("id", payment.id);

  revalidatePath("/admin/rentals");
}
