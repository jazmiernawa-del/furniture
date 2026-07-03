import "server-only";

import { formatCurrency, formatDate } from "@/lib/format";
import { BRAND_NAME } from "@/lib/brand";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Maison <onboarding@resend.dev>";

export interface OrderEmailItem {
  product_name: string;
  periods: number;
  billing_period: "weekly" | "monthly";
  line_total: number;
}

export interface OrderEmailData {
  to: string;
  orderId: string;
  startDate: string;
  endDate: string;
  billingPeriod: "weekly" | "monthly";
  subtotal: number;
  deposit: number;
  deliveryFee: number;
  total: number;
  items: OrderEmailItem[];
}

/** Sends the order-confirmation email via Resend. No-op if not configured. */
export async function sendOrderConfirmationEmail(
  data: OrderEmailData,
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [data.to],
        subject: `Your ${BRAND_NAME} rental is confirmed`,
        html: renderOrderConfirmationHtml(data),
      }),
    });
    if (!res.ok) {
      console.error("Resend email failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("sendOrderConfirmationEmail threw:", err);
  }
}

/** Standalone HTML renderer (table-based, inline styles for email clients). */
export function renderOrderConfirmationHtml(data: OrderEmailData): string {
  const ink = "#1b1813";
  const cream = "#f5efe6";
  const gold = "#b08d57";
  const taupe = "#877c6d";
  const border = "#e0d6c5";

  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${border};font-family:Georgia,serif;font-size:16px;color:${ink};">
          ${escapeHtml(i.product_name)}
          <div style="font-family:Arial,sans-serif;font-size:12px;color:${taupe};margin-top:4px;">
            ${i.periods} ${i.billing_period === "weekly" ? "week" : "month"}${i.periods > 1 ? "s" : ""}
          </div>
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid ${border};font-family:Arial,sans-serif;font-size:15px;color:${ink};">
          ${formatCurrency(Number(i.line_total))}
        </td>
      </tr>`,
    )
    .join("");

  const summaryRow = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:${bold ? "16px" : "14px"};color:${bold ? ink : taupe};${bold ? "font-weight:bold;" : ""}">${label}</td>
      <td align="right" style="padding:6px 0;font-family:Arial,sans-serif;font-size:${bold ? "16px" : "14px"};color:${ink};${bold ? "font-weight:bold;" : ""}">${value}</td>
    </tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${cream};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cream};padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${border};">
          <tr>
            <td style="background:${ink};padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:26px;color:#ffffff;letter-spacing:1px;">${BRAND_NAME}<span style="color:${gold};">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 8px;">
              <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${gold};margin:0 0 12px;">Order confirmed</p>
              <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;color:${ink};margin:0 0 12px;">Thank you for your rental</h1>
              <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${taupe};margin:0;">
                Your pieces are reserved. We'll be in touch to schedule white-glove delivery.
                Order <strong style="color:${ink};">#${data.orderId.slice(0, 8)}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cream};border:1px solid ${border};">
                <tr>
                  <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:13px;color:${taupe};">
                    <strong style="color:${ink};">Rental period</strong><br/>
                    ${formatDate(data.startDate)} &nbsp;&rarr;&nbsp; ${formatDate(data.endDate)} &middot; ${data.billingPeriod}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${summaryRow("Rental", formatCurrency(data.subtotal))}
                ${summaryRow("Refundable deposit", formatCurrency(data.deposit))}
                ${summaryRow("Delivery", formatCurrency(data.deliveryFee))}
                <tr><td colspan="2" style="border-top:1px solid ${border};padding-top:8px;"></td></tr>
                ${summaryRow("Total paid", formatCurrency(data.total), true)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${ink};padding:24px 40px;text-align:center;">
              <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(239,231,216,0.6);margin:0;">
                ${BRAND_NAME} — rented, never ordinary. Your deposit is refunded after pickup.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
