import "server-only";

import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new Resend(apiKey);
  return cached;
}

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL ?? "Demee <noreply@demee.app>";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send an email via Resend. Fails silently (logs only) when the API key
 * isn't configured — the product keeps working, the freelancer just
 * doesn't get the email notification. This is deliberate: a missing
 * Resend key shouldn't 500 the lead submission.
 */
export async function sendEmail(options: SendOptions): Promise<{ sent: boolean; id?: string }> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping", {
      to: options.to,
      subject: options.subject,
    });
    return { sent: false };
  }
  try {
    const result = await client.emails.send({
      from: DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    if (result.error) {
      console.error("[email] Resend rejected", result.error);
      return { sent: false };
    }
    return { sent: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false };
  }
}
