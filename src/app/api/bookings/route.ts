import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import {
  loadBookingsInRange,
  loadPublicBookingConfig,
} from "@/lib/firebase/booking-loader";
import { getFreshAccessToken } from "@/lib/firebase/google-integration";
import {
  CalendarApiError,
  createCalendarEvent,
} from "@/lib/google/calendar";
import { checkBookingQuota } from "@/lib/plans/quotas";

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

  // Plan-level cap on received bookings. Free is monthly-capped
  // (10/month UTC, cancelled bookings excluded), Pro/Studio are
  // unlimited. We check before slot validation so visitors get a clear
  // 429 instead of 400/409 when the owner is at their cap.
  const quota = await checkBookingQuota(bundle.uid);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "booking-quota-exceeded",
        plan: quota.plan,
        used: quota.used,
        limit: quota.limit,
      },
      { status: 429 },
    );
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
  // Uses the same index-free loader the slots endpoint uses.
  const bufferMs = Math.max(0, bundle.config.bufferMinutes) * 60_000;
  const winStart = new Date(startsAt.getTime() - bufferMs);
  const winEnd = new Date(endsAt.getTime() + bufferMs);
  try {
    const conflicts = await loadBookingsInRange(bundle.uid, winStart, winEnd);
    const hasOverlap = conflicts.some((c) => c.status !== "cancelled");
    if (hasOverlap) {
      return NextResponse.json({ error: "slot-taken" }, { status: 409 });
    }
  } catch (err) {
    console.error("[api/bookings] overlap check failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
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

  // Google Calendar sync — fire-and-forget. If the freelancer has the
  // integration connected we add the event to their calendar and pull a
  // Meet link back onto the booking. Any failure here is logged but
  // never fails the booking itself.
  let meetUrl: string | null = null;
  let calendarEventId: string | null = null;
  try {
    const token = await getFreshAccessToken(bundle.uid);
    if (token) {
      const description = [
        `Reserva desde demee.app/${handle}/book`,
        "",
        `Cliente: ${parsed.data.guest.name} <${parsed.data.guest.email}>`,
        parsed.data.guest.phone ? `Teléfono: ${parsed.data.guest.phone}` : null,
        "",
        parsed.data.guest.notes ? `Notas:\n${parsed.data.guest.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const result = await createCalendarEvent({
        accessToken: token.accessToken,
        calendarId: token.calendarId,
        summary: `${bundle.config.name} · ${parsed.data.guest.name}`,
        description,
        startIso: startsAt.toISOString(),
        endIso: endsAt.toISOString(),
        timeZone: bundle.config.timezone,
        attendeeEmail: parsed.data.guest.email,
        withMeet: bundle.config.locationType === "online",
        requestId: bookingRef.id,
      });
      meetUrl = result.meetUrl;
      calendarEventId = result.eventId;
      await bookingRef.update({
        googleCalendarEventId: result.eventId,
        googleCalendarHtmlLink: result.htmlLink,
        meetUrl: result.meetUrl,
      });
    }
  } catch (err) {
    if (err instanceof CalendarApiError) {
      console.error("[api/bookings] calendar event failed", err.status, err.body.slice(0, 200));
    } else {
      console.error("[api/bookings] calendar event unexpected error", err);
    }
  }

  return NextResponse.json({
    ok: true,
    bookingId: bookingRef.id,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    meetUrl,
    calendarEventId,
  });
}
