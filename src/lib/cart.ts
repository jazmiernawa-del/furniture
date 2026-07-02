import "server-only";

import { cookies } from "next/headers";

import type { BillingPeriod } from "@/lib/types/database";

const CART_COOKIE = "furniture_cart";

export interface CartItem {
  id: string; // unique per cart line
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  period: BillingPeriod;
  periods: number;
  startDate: string; // inclusive, YYYY-MM-DD
  endDate: string; // exclusive pickup day
  rate: number; // per-period snapshot
  deposit: number;
  deliveryFee: number;
}

export async function getCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 2 weeks
  });
}

export async function clearCart(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

export async function cartCount(): Promise<number> {
  return (await getCart()).length;
}
