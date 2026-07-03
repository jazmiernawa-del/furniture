"use server";

import { isEmailConfigured } from "@/lib/email";

export interface ContactState {
  error?: string | null;
  message?: string | null;
}

/**
 * Handle a support message. Emails the support inbox via Resend when
 * configured; otherwise acknowledges gracefully (logged server-side).
 */
export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("message") ?? "").trim();

  if (!name || !email || !body) {
    return { error: "Please add your name, email, and a message." };
  }

  const to = process.env.SUPPORT_EMAIL ?? process.env.EMAIL_FROM;

  if (isEmailConfigured() && to) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Maison <onboarding@resend.dev>",
          to: [to],
          reply_to: email,
          subject: `[Support] ${subject || "New message"} — ${name}`,
          text: `From: ${name} <${email}>\n\n${body}`,
        }),
      });
    } catch (err) {
      console.error("contact email failed:", err);
    }
  } else {
    console.log("Contact message:", { name, email, subject, body });
  }

  return {
    message: "Thank you — a member of our concierge team will be in touch soon.",
  };
}
