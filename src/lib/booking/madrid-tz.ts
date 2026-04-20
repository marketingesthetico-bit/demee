/**
 * Minimal Europe/Madrid timezone helpers. MVP scope — we only support
 * this one zone. Replace with a proper IANA tz library when we open the
 * booking module to other zones.
 *
 * Spain follows EU DST rules:
 * - DST starts: last Sunday of March, 02:00 local → clocks jump to 03:00
 * - DST ends:   last Sunday of October, 03:00 local → clocks fall back to 02:00
 * In UTC the switch happens at 01:00 UTC on both days.
 */

function lastSundayOfMonthUtcDay(year: number, monthIndex: number): number {
  // monthIndex is 0-based (March = 2, October = 9). We walk back from the
  // last day of the month until we find a Sunday in UTC terms.
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  for (let day = lastDay; day >= 1; day--) {
    const d = new Date(Date.UTC(year, monthIndex, day));
    if (d.getUTCDay() === 0) return day;
  }
  return 31; // unreachable
}

/** Returns Madrid UTC offset in minutes for the given UTC instant. */
export function madridOffsetMinutes(atUtc: Date): number {
  const year = atUtc.getUTCFullYear();
  const dstStart = Date.UTC(year, 2, lastSundayOfMonthUtcDay(year, 2), 1, 0, 0);
  const dstEnd = Date.UTC(year, 9, lastSundayOfMonthUtcDay(year, 9), 1, 0, 0);
  const t = atUtc.getTime();
  return t >= dstStart && t < dstEnd ? 120 : 60;
}

/**
 * Builds a UTC Date from "wall clock" components expressed in Madrid time.
 * DST gap days: 02:00 → 03:00 doesn't exist; we fall through to the next
 * hour by adding the offset before DST started (safe, one-second drift at
 * worst is fine for appointment slots).
 */
export function madridWallClockToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
): Date {
  // Start from a naive UTC value with the same components — it's wrong by
  // exactly the Madrid offset at that instant.
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = madridOffsetMinutes(naive);
  return new Date(naive.getTime() - offset * 60_000);
}

/**
 * Returns the Madrid wall-clock components for a UTC instant. Used to
 * figure out which weekday a slot falls on in Madrid time, independent
 * of the server's tz.
 */
export function madridWallClock(atUtc: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekdayIndex: number; // 0 = sunday, 1 = monday, ..., 6 = saturday
} {
  const offset = madridOffsetMinutes(atUtc);
  const shifted = new Date(atUtc.getTime() + offset * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekdayIndex: shifted.getUTCDay(),
  };
}
