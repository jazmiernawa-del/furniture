"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

export interface AuthState {
  error?: string | null;
  message?: string | null;
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet." };
  }

  const { email, password } = readCredentials(formData);
  const next = String(formData.get("next") ?? "/account");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(
      `[auth/login] signInWithPassword failed — code=${error.code ?? "n/a"} ` +
        `status=${error.status ?? "n/a"} message="${error.message}"`,
    );
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet." };
  }

  const { email, password } = readCredentials(formData);
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    console.error(
      `[auth/register] signUp failed — code=${error.code ?? "n/a"} ` +
        `status=${error.status ?? "n/a"} message="${error.message}"`,
    );
    return { error: error.message };
  }

  // If email confirmation is enabled there's no session yet.
  if (!data.session) {
    return {
      message:
        "Check your inbox to confirm your email, then sign in to get started.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${publicEnv.siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error(
      `[auth/reset] resetPasswordForEmail failed — code=${error.code ?? "n/a"} ` +
        `status=${error.status ?? "n/a"} message="${error.message}"`,
    );
    return { error: error.message };
  }

  // Always show the same confirmation (don't reveal whether the email exists).
  return {
    message:
      "If an account exists for that email, we've sent a password reset link.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase isn't configured yet." };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error(
      `[auth/update-password] updateUser failed — code=${error.code ?? "n/a"} ` +
        `status=${error.status ?? "n/a"} message="${error.message}"`,
    );
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}
