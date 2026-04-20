import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const timeWindowSchema = z.object({
  start: z.string().regex(/^\d{1,2}:\d{2}$/),
  end: z.string().regex(/^\d{1,2}:\d{2}$/),
});

const weeklyAvailabilitySchema = z.object({
  monday: z.array(timeWindowSchema).max(6),
  tuesday: z.array(timeWindowSchema).max(6),
  wednesday: z.array(timeWindowSchema).max(6),
  thursday: z.array(timeWindowSchema).max(6),
  friday: z.array(timeWindowSchema).max(6),
  saturday: z.array(timeWindowSchema).max(6),
  sunday: z.array(timeWindowSchema).max(6),
});

// Not .strict() because the client sends back the full BookingConfig
// shape (timezone, updatedAt) and we only care about the fields below.
// Unknown keys are stripped silently by Zod's default behavior.
const bodySchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(600).optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
  leadTimeHours: z.number().int().min(0).max(240).optional(),
  maxAdvanceDays: z.number().int().min(1).max(180).optional(),
  locationType: z.enum(["online", "phone", "in-person"]).optional(),
  location: z.string().max(400).optional(),
  introText: z.string().max(600).optional(),
  availability: weeklyAvailabilitySchema.optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid-body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(session.uid);
  const bookingRef = userRef.collection("booking").doc("main");

  let handle: string | undefined;
  try {
    const userSnap = await userRef.get();
    handle = userSnap.exists ? (userSnap.data()?.handle as string | undefined) : undefined;
    await bookingRef.set(
      {
        ...parsed.data,
        timezone: "Europe/Madrid",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("[api/booking] update failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }

  if (handle) {
    try {
      revalidatePath(`/${handle}/book`);
      revalidatePath(`/${handle}`);
    } catch (err) {
      console.warn("[api/booking] revalidate failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
