import { describe, expect, it } from "vitest";

import { madridOffsetMinutes, madridWallClockToUtc } from "./madrid-tz";
import { computeAvailableSlots, type ExistingBooking } from "./slots";
import {
  DEFAULT_BOOKING_CONFIG,
  type BookingConfig,
  type WeeklyAvailability,
} from "./types";

const EMPTY_AVAILABILITY: WeeklyAvailability = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

function config(overrides: Partial<BookingConfig> = {}): BookingConfig {
  return {
    ...DEFAULT_BOOKING_CONFIG,
    durationMinutes: 30,
    bufferMinutes: 0,
    leadTimeHours: 0,
    maxAdvanceDays: 365,
    availability: EMPTY_AVAILABILITY,
    ...overrides,
  };
}

describe("madridOffsetMinutes", () => {
  it("returns +60 (CET) in January", () => {
    expect(madridOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(60);
  });

  it("returns +120 (CEST) in July", () => {
    expect(madridOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });

  it("switches to CEST on last Sunday of March at 01:00 UTC", () => {
    // Last Sun of March 2026 = 29th. 00:59 UTC should still be CET,
    // 01:00 UTC should be CEST.
    expect(madridOffsetMinutes(new Date("2026-03-29T00:59:00Z"))).toBe(60);
    expect(madridOffsetMinutes(new Date("2026-03-29T01:00:00Z"))).toBe(120);
  });
});

describe("madridWallClockToUtc", () => {
  it("converts a winter wall clock correctly (CET = UTC+1)", () => {
    const utc = madridWallClockToUtc(2026, 1, 15, 10, 30);
    expect(utc.toISOString()).toBe("2026-01-15T09:30:00.000Z");
  });

  it("converts a summer wall clock correctly (CEST = UTC+2)", () => {
    const utc = madridWallClockToUtc(2026, 7, 15, 10, 30);
    expect(utc.toISOString()).toBe("2026-07-15T08:30:00.000Z");
  });
});

describe("computeAvailableSlots", () => {
  it("returns no slots when the weekday has no availability", () => {
    const slots = computeAvailableSlots({
      config: config({ availability: EMPTY_AVAILABILITY }),
      madridDate: "2026-04-22", // Wednesday
      existingBookings: [],
      nowUtc: new Date("2026-04-20T08:00:00Z"),
    });
    expect(slots).toEqual([]);
  });

  it("generates hourly-step slots inside a single window", () => {
    const slots = computeAvailableSlots({
      config: config({
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "12:00" }],
        },
      }),
      madridDate: "2026-04-22", // Wednesday
      existingBookings: [],
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    // 30-minute slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30 → 6 slots
    expect(slots).toHaveLength(6);
    expect(slots[0]?.startsAt).toBe("2026-04-22T07:00:00.000Z"); // CEST = UTC+2
    expect(slots[5]?.startsAt).toBe("2026-04-22T09:30:00.000Z");
  });

  it("drops slots that start before lead time", () => {
    // Lead time = 24h, "now" = Tuesday 10:00 Madrid → cutoff Wednesday 10:00 Madrid
    const slots = computeAvailableSlots({
      config: config({
        durationMinutes: 30,
        leadTimeHours: 24,
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "12:00" }],
        },
      }),
      madridDate: "2026-04-22",
      existingBookings: [],
      nowUtc: new Date("2026-04-21T08:00:00Z"), // Tue 10:00 Madrid (CEST)
    });
    // Cutoff: 2026-04-22 08:00 UTC = 10:00 Madrid.
    // Only 10:00, 10:30, 11:00, 11:30 remain.
    expect(slots).toHaveLength(4);
    expect(slots[0]?.startsAt).toBe("2026-04-22T08:00:00.000Z");
  });

  it("removes slots that conflict with existing bookings (with buffer)", () => {
    const existing: ExistingBooking[] = [
      {
        startsAt: "2026-04-22T08:00:00.000Z", // 10:00 Madrid
        endsAt: "2026-04-22T08:30:00.000Z",
        status: "confirmed",
      },
    ];
    const slots = computeAvailableSlots({
      config: config({
        durationMinutes: 30,
        bufferMinutes: 10,
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "12:00" }],
        },
      }),
      madridDate: "2026-04-22",
      existingBookings: existing,
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    // With buffer 10m, blocked range in UTC is 07:50 – 08:40.
    // 09:30 slot (07:30 UTC) ends at 08:00 UTC → conflicts with buffered start.
    // 10:00 slot is the existing booking → conflict.
    // 10:30 slot (08:30 UTC) starts inside buffer end (08:40) → conflict.
    // Remaining: 09:00, 11:00, 11:30 → 3 slots.
    expect(slots).toHaveLength(3);
    expect(slots.map((s) => s.startsAt)).toEqual([
      "2026-04-22T07:00:00.000Z",
      "2026-04-22T09:00:00.000Z",
      "2026-04-22T09:30:00.000Z",
    ]);
  });

  it("ignores cancelled bookings", () => {
    const slots = computeAvailableSlots({
      config: config({
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "10:00" }],
        },
      }),
      madridDate: "2026-04-22",
      existingBookings: [
        {
          startsAt: "2026-04-22T07:00:00.000Z",
          endsAt: "2026-04-22T07:30:00.000Z",
          status: "cancelled",
        },
      ],
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    expect(slots).toHaveLength(2);
  });

  it("honors maxAdvanceDays", () => {
    const slots = computeAvailableSlots({
      config: config({
        maxAdvanceDays: 3,
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "12:00" }],
        },
      }),
      madridDate: "2026-04-29", // next Wednesday, 9 days ahead
      existingBookings: [],
      nowUtc: new Date("2026-04-20T00:00:00Z"),
    });
    expect(slots).toEqual([]);
  });

  it("handles two windows in the same day", () => {
    const slots = computeAvailableSlots({
      config: config({
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [
            { start: "09:00", end: "11:00" },
            { start: "15:00", end: "16:00" },
          ],
        },
      }),
      madridDate: "2026-04-22",
      existingBookings: [],
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    // 4 + 2 = 6 slots
    expect(slots).toHaveLength(6);
  });

  it("only keeps slots that fit entirely inside the window", () => {
    const slots = computeAvailableSlots({
      config: config({
        durationMinutes: 45,
        availability: {
          ...EMPTY_AVAILABILITY,
          wednesday: [{ start: "09:00", end: "10:00" }],
        },
      }),
      madridDate: "2026-04-22",
      existingBookings: [],
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    // 09:00-09:45 fits; the next slot would be 09:45-10:30 which overflows.
    expect(slots).toHaveLength(1);
    expect(slots[0]?.startsAt).toBe("2026-04-22T07:00:00.000Z");
  });

  it("returns empty for invalid date string", () => {
    const slots = computeAvailableSlots({
      config: config({
        availability: { ...EMPTY_AVAILABILITY, wednesday: [{ start: "09:00", end: "12:00" }] },
      }),
      madridDate: "not-a-date",
      existingBookings: [],
      nowUtc: new Date("2026-04-01T00:00:00Z"),
    });
    expect(slots).toEqual([]);
  });
});
