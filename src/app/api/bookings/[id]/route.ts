import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getFreshAccessToken } from "@/lib/firebase/google-integration";
import { getServerSession } from "@/lib/firebase/session";
import { CalendarApiError, deleteCalendarEvent } from "@/lib/google/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    status: z.enum(["confirmed", "cancelled", "completed"]),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("bookings").doc(params.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const data = snap.data();
  if ((data?.ownerUid as string | undefined) !== session.uid) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await ref.update({ status: parsed.data.status });

  // When the freelancer cancels, best-effort remove the event from their
  // Google Calendar too (Google emails the attendee about the cancel).
  if (parsed.data.status === "cancelled") {
    const eventId = data?.googleCalendarEventId as string | undefined;
    if (eventId) {
      try {
        const token = await getFreshAccessToken(session.uid);
        if (token) {
          await deleteCalendarEvent(token.accessToken, eventId, token.calendarId);
        }
      } catch (err) {
        if (err instanceof CalendarApiError) {
          console.error(
            "[api/bookings/:id] calendar delete failed",
            err.status,
            err.body.slice(0, 200),
          );
        } else {
          console.error("[api/bookings/:id] calendar delete unexpected error", err);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
