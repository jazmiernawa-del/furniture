"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

/**
 * Toggle a product in the current user's wishlist. Logged-out users are sent
 * to sign in first. `redirectTo` returns them to the page they were on.
 */
export async function toggleFavorite(formData: FormData): Promise<void> {
  const productId = String(formData.get("product_id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/catalog");
  if (!productId) return;

  const user = await getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("product_id", productId);
  } else {
    await supabase
      .from("favorites")
      .insert({ user_id: user!.id, product_id: productId });
  }

  revalidatePath(redirectTo);
  revalidatePath("/account/saved");
}
