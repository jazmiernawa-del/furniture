"use client";

import { useActionState } from "react";
import Link from "next/link";

import { login, register, type AuthState } from "@/app/auth/actions";
import { SocialAuthButtons } from "@/components/social-auth-buttons";

const initialState: AuthState = {};

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next?: string;
}) {
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState(action, initialState);

  const isRegister = mode === "register";

  return (
    <div>
      <SocialAuthButtons next={next} />

      <form action={formAction} className="space-y-5">
        {next && <input type="hidden" name="next" value={next} />}

        {isRegister && (
          <Field
            label="Full name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
          />
        )}

        <Field
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <div>
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
            required
          />
          {!isRegister && (
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground underline-offset-4 transition hover:text-accent-strong"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {state.error && (
          <p className="border-l-2 border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="border-l-2 border-accent bg-accent/10 px-3 py-2 text-sm text-foreground">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-ink w-full rounded-full px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : isRegister
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {/* Sign-up / sign-in switch — directly below the primary button. */}
      <div className="mt-8 border-t border-border pt-6 text-center">
        {isRegister ? (
          <p className="text-sm text-muted-foreground">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-medium text-accent-strong underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            New to Furniture?{" "}
            <Link
              href="/register"
              className="font-medium text-accent-strong underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm text-foreground outline-none transition focus:border-accent placeholder:text-muted-foreground/50"
      />
    </label>
  );
}
