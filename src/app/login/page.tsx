import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  // Already signed in? Skip the form.
  if (await getUser()) redirect(next ?? "/account");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your rentals."
    >
      {error && (
        <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
