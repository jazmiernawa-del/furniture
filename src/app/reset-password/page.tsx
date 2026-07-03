import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // Reaching here requires the recovery session set by /auth/callback.
  const user = await getUser();
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a new password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
