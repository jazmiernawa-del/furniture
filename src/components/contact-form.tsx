"use client";

import { useActionState } from "react";

import { sendContactMessage, type ContactState } from "@/app/contact/actions";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initial,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <Field label="Subject" name="subject" placeholder="How can we help?" />

      <label className="block">
        <span className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Message
        </span>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
        />
      </label>

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
        className="btn-gold w-full rounded-full px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Send message"}
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
        className="w-full border-0 border-b border-border bg-transparent py-2.5 text-sm text-foreground outline-none transition focus:border-accent placeholder:text-muted-foreground/50"
      />
    </label>
  );
}
