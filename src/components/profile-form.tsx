"use client";

import { useActionState } from "react";

import { updateProfile, type ProfileState } from "@/app/account/actions";

const initial: ProfileState = {};

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <Field label="Full name" name="full_name" defaultValue={fullName} placeholder="Jane Doe" />
      <Field label="Phone" name="phone" type="tel" defaultValue={phone} placeholder="(555) 123-4567" />

      <div>
        <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Email
        </span>
        <p className="border-b border-border py-2.5 text-sm text-muted-foreground">
          {email}
        </p>
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
        className="btn-ink rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
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
