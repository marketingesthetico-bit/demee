import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { calculateBudget } from "@/lib/budget/calculate";
import { getAdminDb } from "@/lib/firebase/admin";
import { loadPublicBudget } from "@/lib/firebase/budget-loader";
import {
  buildFreelancerNotificationEmail,
  buildGuestConfirmationEmail,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";
import { checkLeadQuota } from "@/lib/plans/quotas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const selectionSchema = z.object({
  itemId: z.string().min(1).max(40),
  optionId: z.string().min(1).max(40).nullable(),
});

const bodySchema = z.object({
  handle: z.string().min(3).max(30),
  guest: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    company: z.string().max(120).optional().nullable(),
    message: z.string().max(2000).optional().nullable(),
  }),
  selections: z.array(selectionSchema).max(40),
  honeypot: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid-body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Honeypot — spambots fill hidden fields. Real users never do.
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const handle = parsed.data.handle.toLowerCase();
  const bundle = await loadPublicBudget(handle);
  if (!bundle) {
    return NextResponse.json({ error: "budget-not-found" }, { status: 404 });
  }

  // Plan-level cap on received leads. Free is monthly-capped (10/month
  // UTC), Pro/Studio are unlimited. This blocks even before the budget
  // calculation so we don't waste work on a request we'd reject anyway.
  const quota = await checkLeadQuota(bundle.uid);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "lead-quota-exceeded",
        plan: quota.plan,
        used: quota.used,
        limit: quota.limit,
      },
      { status: 429 },
    );
  }

  const budget = calculateBudget(bundle.config, parsed.data.selections);

  // Look up freelancer email + name for the notification.
  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(bundle.uid).get();
  const profileSnap = await db
    .collection("users")
    .doc(bundle.uid)
    .collection("profile")
    .doc("main")
    .get();
  const freelancerEmail =
    (userSnap.exists ? (userSnap.data()?.email as string | undefined) : undefined) ?? null;
  const freelancerName =
    ((profileSnap.exists ? (profileSnap.data()?.header?.name as string | undefined) : undefined) ??
      (userSnap.exists ? (userSnap.data()?.displayName as string | undefined) : undefined) ??
      handle);

  const guest = parsed.data.guest;

  const leadRef = db.collection("leads").doc();
  const leadPayload = {
    id: leadRef.id,
    ownerUid: bundle.uid,
    handle,
    type: "budget" as const,
    status: "new" as const,
    guest: {
      name: guest.name,
      email: guest.email,
      company: guest.company ?? null,
      message: guest.message ?? null,
    },
    budget,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await leadRef.set(leadPayload);
  } catch (err) {
    console.error("[api/leads] create failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }

  // Emails are best-effort — don't fail the submission if they don't send.
  if (freelancerEmail) {
    const freelancerEmailBody = buildFreelancerNotificationEmail({
      freelancerName,
      freelancerHandle: handle,
      guestName: guest.name,
      guestEmail: guest.email,
      guestCompany: guest.company ?? null,
      guestMessage: guest.message ?? "",
      budget,
    });
    void sendEmail({
      to: freelancerEmail,
      subject: freelancerEmailBody.subject,
      html: freelancerEmailBody.html,
      replyTo: guest.email,
    });
  }

  const guestEmailBody = buildGuestConfirmationEmail({
    guestName: guest.name,
    freelancerName,
    freelancerHandle: handle,
    budget,
  });
  void sendEmail({
    to: guest.email,
    subject: guestEmailBody.subject,
    html: guestEmailBody.html,
    replyTo: freelancerEmail ?? undefined,
  });

  return NextResponse.json({ ok: true, leadId: leadRef.id, total: budget.total });
}
