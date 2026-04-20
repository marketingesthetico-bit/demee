import { NextResponse } from "next/server";
import { z } from "zod";

import {
  loadBookingsInRange,
  loadPublicBookingConfig,
} from "@/lib/firebase/booking-loader";
import {
  computeAvailableSlots,
  type ExistingBooking,
} from "@/lib/booking/slots";
import { madridWallClockToUtc } from "@/lib/booking/madrid-tz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  handle: z.string().min(3).max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    handle: url.searchParams.get("handle"),
    date: url.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-query" }, { status: 400 });
  }

  const bundle = await loadPublicBookingConfig(parsed.data.handle.toLowerCase());
  if (!bundle) {
    return NextResponse.json({ slots: [] });
  }

  const [y, m, d] = parsed.data.date.split("-").map(Number);
  if (!y || !m || !d) {
    return NextResponse.json({ error: "invalid-query" }, { status: 400 });
  }
  const dayStartUtc = madridWallClockToUtc(y, m, d, 0, 0);
  const dayEndUtc = madridWallClockToUtc(y, m, d + 1, 0, 0);
  const existing: ExistingBooking[] = await loadBookingsInRange(
    bundle.uid,
    dayStartUtc,
    dayEndUtc,
  );

  const slots = computeAvailableSlots({
    config: bundle.config,
    madridDate: parsed.data.date,
    existingBookings: existing,
    nowUtc: new Date(),
  });

  return NextResponse.json({ slots });
}
