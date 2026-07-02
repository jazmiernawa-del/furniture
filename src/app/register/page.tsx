import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (await getUser()) redirect(next ?? "/account");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Rent beautiful furniture in minutes."
    >
      <AuthForm mode="register" next={next} />
    </AuthShell>
  );
}
