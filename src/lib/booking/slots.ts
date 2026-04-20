import { madridWallClock, madridWallClockToUtc } from "./madrid-tz";
import type {
  AvailabilitySlot,
  BookingConfig,
  TimeWindow,
  Weekday,
} from "./types";
import { WEEKDAYS } from "./types";

export interface ExistingBooking {
  startsAt: string;
  endsAt: string;
  status: string;
}

interface SlotComputeInput {
  config: BookingConfig;
  /** YYYY-MM-DD in Madrid time. */
  madridDate: string;
  existingBookings: ExistingBooking[];
  /** Current UTC instant. Injected so tests can freeze "now". */
  nowUtc: Date;
}

/** Weekday index from WEEKDAYS (monday=0) for a Madrid-wallclock weekday. */
function madridWeekdayFromIndex(jsWeekday: number): Weekday {
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat. We want monday=0.
  const zeroBased = (jsWeekday + 6) % 7;
  return WEEKDAYS[zeroBased]!;
}

function parseHm(hm: string): { hour: number; minute: number } | null {
  const match = hm.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function slotOverlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Generates bookable slots for a given Madrid-local date given the
 * freelancer's BookingConfig. Pure function.
 *
 * Contract:
 * - Slots start on the hour / half-hour boundaries inferred from each
 *   availability window's `start`, stepping by `durationMinutes`. The
 *   buffer between bookings is applied via the existing-bookings
 *   occlusion check, not by shortening the slot grid.
 * - A slot is discarded if it ends after its window closes.
 * - A slot is discarded if it starts before `nowUtc + leadTimeHours`.
 * - A slot is discarded if it conflicts with any non-cancelled booking
 *   when extended by `bufferMinutes` on both sides.
 * - A slot is discarded if it's more than `maxAdvanceDays` in the future.
 * - Cancelled bookings are ignored for occupancy.
 */
export function computeAvailableSlots(input: SlotComputeInput): AvailabilitySlot[] {
  const { config, madridDate, existingBookings, nowUtc } = input;
  const parts = madridDate.split("-");
  if (parts.length !== 3) return [];
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return [];

  // Use a 13:00 local anchor to avoid DST hour landing exactly on 02:00.
  const anchor = madridWallClockToUtc(year, month, day, 13, 0);
  const wall = madridWallClock(anchor);
  if (wall.year !== year || wall.month !== month || wall.day !== day) {
    return [];
  }
  const weekday = madridWeekdayFromIndex(wall.weekdayIndex);
  const windows = config.availability[weekday] ?? [];
  if (windows.length === 0) return [];

  const leadCutoff = nowUtc.getTime() + config.leadTimeHours * 3_600_000;
  const maxCutoff = nowUtc.getTime() + config.maxAdvanceDays * 86_400_000;
  const bufferMs = Math.max(0, config.bufferMinutes) * 60_000;
  const durationMs = Math.max(1, config.durationMinutes) * 60_000;

  // Pre-compute UTC ranges of existing (non-cancelled) bookings with
  // buffer applied.
  const occupied = existingBookings
    .filter((b) => b.status !== "cancelled")
    .map((b) => {
      const start = Date.parse(b.startsAt);
      const end = Date.parse(b.endsAt);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      return { start: start - bufferMs, end: end + bufferMs };
    })
    .filter((x): x is { start: number; end: number } => x !== null);

  const slots: AvailabilitySlot[] = [];
  for (const window of windows) {
    const startHm = parseHm(window.start);
    const endHm = parseHm(window.end);
    if (!startHm || !endHm) continue;

    const windowStartUtc = madridWallClockToUtc(
      year,
      month,
      day,
      startHm.hour,
      startHm.minute,
    );
    const windowEndUtc = madridWallClockToUtc(year, month, day, endHm.hour, endHm.minute);
    if (windowEndUtc.getTime() <= windowStartUtc.getTime()) continue;

    let cursor = windowStartUtc.getTime();
    while (cursor + durationMs <= windowEndUtc.getTime()) {
      const slotEnd = cursor + durationMs;

      if (cursor < leadCutoff) {
        cursor += durationMs;
        continue;
      }
      if (cursor > maxCutoff) break;

      const conflicts = occupied.some((o) =>
        slotOverlaps(cursor, slotEnd, o.start, o.end),
      );
      if (!conflicts) {
        slots.push({
          startsAt: new Date(cursor).toISOString(),
          endsAt: new Date(slotEnd).toISOString(),
        });
      }
      cursor += durationMs;
    }
  }
  return slots;
}

export function emptyWindow(): TimeWindow {
  return { start: "09:00", end: "18:00" };
}
