import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { parseDateRange, type DateRange } from "@/lib/rental";

/**
 * Booked date ranges for a product (rentals + manual blocks). Used to render
 * the availability calendar and validate a selected range client-side.
 * Returns [] when Supabase isn't configured.
 */
export async function getBookedRanges(
  productId: string,
): Promise<DateRange[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("during")
      .eq("product_id", productId);

    if (error || !data) return [];
    return data
      .map((row) => parseDateRange(row.during))
      .filter((r): r is DateRange => r !== null);
  } catch {
    return [];
  }
}

/**
 * Authoritative availability check via the DB function. Returns true only when
 * the product has no booking overlapping [start, end).
 */
export async function checkAvailability(
  productId: string,
  start: string,
  end: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("is_product_available", {
      p_product: productId,
      p_start: start,
      p_end: end,
    });
    if (error) {
      console.error("checkAvailability failed:", error.message);
      return false;
    }
    return Boolean(data);
  } catch {
    return false;
  }
}
