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
 * Used both for the public slot calculator and the overlap check before
 * confirming a new booking.
 *
 * We query by ownerUid alone (a single-field where, no composite index
 * needed) and filter in-memory. For a freelancer at MVP scale total
 * bookings stay comfortably under 1k — the network round-trip is the
 * dominant cost either way, and this means the hot path doesn't depend
 * on the bookings(ownerUid, startsAt) index existing.
 */
export async function loadBookingsInRange(
  ownerUid: string,
  fromUtc: Date,
  toUtc: Date,
): Promise<{ startsAt: string; endsAt: string; status: string }[]> {
  const snap = await getAdminDb()
    .collection("bookings")
    .where("ownerUid", "==", ownerUid)
    .get();
  const fromIso = fromUtc.toISOString();
  const toIso = toUtc.toISOString();
  const result: { startsAt: string; endsAt: string; status: string }[] = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const startsAt = data.startsAt as string | undefined;
    const endsAt = data.endsAt as string | undefined;
    if (!startsAt || !endsAt) continue;
    // Overlap check: booking intersects [from, to) if it starts before `to`
    // and ends after `from`. Using string comparison works because ISO
    // timestamps are lexicographically ordered.
    if (startsAt < toIso && endsAt > fromIso) {
      result.push({
        startsAt,
        endsAt,
        status: (data.status as string) ?? "confirmed",
      });
    }
  }
  return result;
}

export interface LoadedBooking {
  id: string;
  ownerUid: string;
  handle: string;
  status: "confirmed" | "cancelled" | "completed";
  guest: { name: string; email: string; phone: string | null; notes: string | null };
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  locationType: LocationType;
  location: string;
  meetingName: string;
  createdAt: string | null;
}

/**
 * Owner's full booking history, most recent first. Capped at 200 for MVP.
 * Queries by single-field ownerUid equality (auto-indexed) and sorts in
 * memory so no composite index is required.
 */
export async function loadBookingsForOwner(ownerUid: string): Promise<LoadedBooking[]> {
  const snap = await getAdminDb()
    .collection("bookings")
    .where("ownerUid", "==", ownerUid)
    .get();
  const items: LoadedBooking[] = snap.docs.map((doc) => {
    const data = doc.data();
    const created = data.createdAt as { toDate?: () => Date } | undefined;
    return {
      id: doc.id,
      ownerUid: data.ownerUid as string,
      handle: (data.handle as string) ?? "",
      status: (data.status as LoadedBooking["status"]) ?? "confirmed",
      guest: {
        name: (data.guest?.name as string) ?? "",
        email: (data.guest?.email as string) ?? "",
        phone: (data.guest?.phone as string | null) ?? null,
        notes: (data.guest?.notes as string | null) ?? null,
      },
      startsAt: (data.startsAt as string) ?? "",
      endsAt: (data.endsAt as string) ?? "",
      durationMinutes: (data.durationMinutes as number) ?? 30,
      locationType: (data.locationType as LocationType) ?? "online",
      location: (data.location as string) ?? "",
      meetingName: (data.meetingName as string) ?? "",
      createdAt: created?.toDate?.().toISOString() ?? null,
    };
  });
  items.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return items.slice(0, 200);
}
