"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

/** Mark all of the current user's notifications as read. */
export async function markAllRead(): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);
  revalidatePath("/", "layout");
}
