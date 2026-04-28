import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email/resend";
import { buildMagicLinkEmail } from "@/lib/email/templates";
import { getAdminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(200),
  /**
   * Where Firebase Auth should redirect the visitor after they click
   * the link. We validate it against an allowlist below so we can't
   * be turned into an open redirect.
   */
  continueUrl: z.string().url().max(500),
});

/**
 * Hosts that are allowed as the magic-link `continueUrl`. Vercel
 * preview URLs are matched by suffix because they're per-deploy.
 */
function isAllowedContinueHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host === "demee.app" || host.endsWith(".demee.app")) return true;
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * Generates a Firebase magic link via the Admin SDK and ships it to
 * the visitor through Resend with our own branded template — instead
 * of Firebase's default email sender.
 *
 * The link itself is identical to what Firebase's stock flow would
 * produce: same `oobCode`, same expiration, same client-side
 * `signInWithEmailLink` consumes it. We only swap the *delivery*.
 *
 * Same response is returned whether the email exists in Firebase Auth
 * or not — Firebase magic links are a unified sign-in/sign-up flow,
 * so there's no oracle to leak. Network failures (Resend down, etc.)
 * surface as 500 so the UI can show a retry message.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const continueUrl = parsed.data.continueUrl;

  // Reject continueUrls that aren't on a Demee-controlled host. This
  // closes the open-redirect hole an attacker could use to phish a
  // Demee user into authenticating somewhere else.
  try {
    const u = new URL(continueUrl);
    if (!isAllowedContinueHost(u.hostname)) {
      return NextResponse.json({ error: "invalid-continue-url" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid-continue-url" }, { status: 400 });
  }

  let link: string;
  try {
    link = await getAdminAuth().generateSignInWithEmailLink(email, {
      url: continueUrl,
      handleCodeInApp: true,
    });
  } catch (err) {
    console.error("[auth/magic-link] generateSignInWithEmailLink failed", err);
    return NextResponse.json(
      { error: "link-generation-failed" },
      { status: 500 },
    );
  }

  const { subject, html } = buildMagicLinkEmail({ link });
  const result = await sendEmail({ to: email, subject, html });
  if (!result.sent) {
    // sendEmail already logs the underlying cause. Treat any failure
    // (missing key, Resend rejection, network) as a generic 500 so
    // the client shows the retry-friendly message.
    return NextResponse.json({ error: "email-send-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
