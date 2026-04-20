import "server-only";

import {
  DEFAULT_BOOKING_CONFIG,
  WEEKDAYS,
  type BookingConfig,
  type LocationType,
  type TimeWindow,
  type WeeklyAvailability,
} from "@/lib/booking/types";

import { getAdminDb } from "./admin";

function coerceWindows(raw: unknown): TimeWindow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((w): w is Record<string, unknown> => typeof w === "object" && w !== null)
    .map((w) => ({
      start: typeof w.start === "string" ? w.start : "",
      end: typeof w.end === "string" ? w.end : "",
    }))
    .filter((w) => w.start && w.end);
}

function coerceAvailability(raw: unknown): WeeklyAvailability {
  const base: WeeklyAvailability = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
  };
  if (!raw || typeof raw !== "object") return base;
  const record = raw as Record<string, unknown>;
  for (const day of WEEKDAYS) {
    base[day] = coerceWindows(record[day]);
  }
  return base;
}

function coerceConfig(data: Record<string, unknown> | undefined): BookingConfig | null {
  if (!data) return null;
  const name = typeof data.name === "string" && data.name ? data.name : DEFAULT_BOOKING_CONFIG.name;
  return {
    enabled: data.enabled === true,
    name,
    description:
      typeof data.description === "string" ? data.description : DEFAULT_BOOKING_CONFIG.description,
    durationMinutes:
      typeof data.durationMinutes === "number" && data.durationMinutes > 0
        ? data.durationMinutes
        : DEFAULT_BOOKING_CONFIG.durationMinutes,
    bufferMinutes: typeof data.bufferMinutes === "number" ? Math.max(0, data.bufferMinutes) : 0,
    leadTimeHours: typeof data.leadTimeHours === "number" ? Math.max(0, data.leadTimeHours) : 0,
    maxAdvanceDays:
      typeof data.maxAdvanceDays === "number" && data.maxAdvanceDays > 0
        ? data.maxAdvanceDays
        : DEFAULT_BOOKING_CONFIG.maxAdvanceDays,
    timezone:
      typeof data.timezone === "string" && data.timezone ? data.timezone : "Europe/Madrid",
    availability: coerceAvailability(data.availability),
    locationType:
      data.locationType === "phone" || data.locationType === "in-person"
        ? (data.locationType as LocationType)
        : "online",
    location: typeof data.location === "string" ? data.location : "",
    introText: typeof data.introText === "string" ? data.introText : "",
  };
}

export async function loadOwnBookingConfig(uid: string): Promise<BookingConfig> {
  const snap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("booking")
    .doc("main")
    .get();
  return coerceConfig(snap.exists ? snap.data() : undefined) ?? DEFAULT_BOOKING_CONFIG;
}

export async function loadPublicBookingConfig(
  handle: string,
): Promise<{ uid: string; handle: string; config: BookingConfig } | null> {
  const db = getAdminDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) return null;
  const uid = handleSnap.data()?.uid as string | undefined;
  if (!uid) return null;
  const snap = await db.collection("users").doc(uid).collection("booking").doc("main").get();
  const config = coerceConfig(snap.exists ? snap.data() : undefined);
  if (!config || !config.enabled) return null;
  return { uid, handle, config };
}

/**
 * Returns bookings that overlap the [fromUtc, toUtc] window for an owner.
 * Used both for the public slot calculator (to block already-booked slots)
 * and the owner's bookings dashboard.
 */
export async function loadBookingsInRange(
  ownerUid: string,
  fromUtc: Date,
  toUtc: Date,
): Promise<{ startsAt: string; endsAt: string; status: string }[]> {
  const snap = await getAdminDb()
    .collection("bookings")
    .where("ownerUid", "==", ownerUid)
    .where("startsAt", ">=", fromUtc.toISOString())
    .where("startsAt", "<", toUtc.toISOString())
    .get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      startsAt: data.startsAt as string,
      endsAt: data.endsAt as string,
      status: (data.status as string) ?? "confirmed",
    };
  });
}
