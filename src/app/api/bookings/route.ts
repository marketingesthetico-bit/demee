import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { loadPublicBookingConfig } from "@/lib/firebase/booking-loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  handle: z.string().min(3).max(30),
  startsAt: z.string().datetime(),
  guest: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
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

  // Honeypot — bots fill hidden fields.
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const handle = parsed.data.handle.toLowerCase();
  const bundle = await loadPublicBookingConfig(handle);
  if (!bundle) {
    return NextResponse.json({ error: "booking-not-found" }, { status: 404 });
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (!Number.isFinite(startsAt.getTime())) {
    return NextResponse.json({ error: "invalid-slot" }, { status: 400 });
  }
  const durationMs = bundle.config.durationMinutes * 60_000;
  const endsAt = new Date(startsAt.getTime() + durationMs);

  // Reject slots in the past and slots that violate lead time.
  const now = Date.now();
  const leadCutoff = now + bundle.config.leadTimeHours * 3_600_000;
  if (startsAt.getTime() < leadCutoff) {
    return NextResponse.json({ error: "slot-too-soon" }, { status: 400 });
  }
  const maxCutoff = now + bundle.config.maxAdvanceDays * 86_400_000;
  if (startsAt.getTime() > maxCutoff) {
    return NextResponse.json({ error: "slot-too-far" }, { status: 400 });
  }

  const db = getAdminDb();

  // Server-side overlap check. Firestore doesn't have range locks, so
  // this is best-effort (a second concurrent booking for the exact same
  // slot is possible but extremely unlikely at MVP traffic).
  const bufferMs = Math.max(0, bundle.config.bufferMinutes) * 60_000;
  const winStart = new Date(startsAt.getTime() - bufferMs).toISOString();
  const winEnd = new Date(endsAt.getTime() + bufferMs).toISOString();
  const overlapSnap = await db
    .collection("bookings")
    .where("ownerUid", "==", bundle.uid)
    .where("startsAt", "<", winEnd)
    .get();
  const hasOverlap = overlapSnap.docs.some((doc) => {
    const data = doc.data();
    if (data.status === "cancelled") return false;
    const otherEnd = data.endsAt as string;
    return otherEnd > winStart;
  });
  if (hasOverlap) {
    return NextResponse.json({ error: "slot-taken" }, { status: 409 });
  }

  const bookingRef = db.collection("bookings").doc();
  await bookingRef.set({
    id: bookingRef.id,
    ownerUid: bundle.uid,
    handle,
    status: "confirmed",
    guest: {
      name: parsed.data.guest.name,
      email: parsed.data.guest.email,
      phone: parsed.data.guest.phone ?? null,
      notes: parsed.data.guest.notes ?? null,
    },
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    durationMinutes: bundle.config.durationMinutes,
    locationType: bundle.config.locationType,
    location: bundle.config.location,
    meetingName: bundle.config.name,
    timezone: bundle.config.timezone,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Email notifications are intentionally fire-and-forget (commit later
  // — needs dedicated booking templates).

  return NextResponse.json({
    ok: true,
    bookingId: bookingRef.id,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  });
}
