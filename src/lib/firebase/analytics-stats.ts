import "server-only";

import { getAdminDb } from "./admin";

export interface Bucket {
  label: string;
  leads: number;
  bookings: number;
  revenue: number; // sum of lead budget totals for the period, as loose indicator
}

export interface AnalyticsSummary {
  thisMonth: Bucket;
  lastMonth: Bucket;
  last90d: Bucket;
  allTime: Bucket;
  byStatus: { new: number; viewed: number; replied: number; closed: number };
  bookingsByStatus: { confirmed: number; cancelled: number; completed: number };
  conversionHint: number; // leads per booking, rounded
}

function startOfMonthMadridIso(offsetMonths: number): string {
  // Good-enough boundary using UTC; the ±1h Madrid offset doesn't change
  // month membership for day 1 at 00:00 UTC in practice.
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + offsetMonths;
  return new Date(Date.UTC(y, m, 1)).toISOString();
}

function nDaysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function loadAnalyticsSummary(uid: string): Promise<AnalyticsSummary> {
  const db = getAdminDb();
  const [leadsSnap, bookingsSnap] = await Promise.all([
    db.collection("leads").where("ownerUid", "==", uid).get(),
    db.collection("bookings").where("ownerUid", "==", uid).get(),
  ]);

  const thisMonthStart = startOfMonthMadridIso(0);
  const lastMonthStart = startOfMonthMadridIso(-1);
  const last90 = nDaysAgoIso(90);

  const empty: Bucket = { label: "", leads: 0, bookings: 0, revenue: 0 };
  const thisMonth: Bucket = { ...empty, label: "Este mes" };
  const lastMonth: Bucket = { ...empty, label: "Mes anterior" };
  const last90d: Bucket = { ...empty, label: "Últimos 90 días" };
  const allTime: Bucket = { ...empty, label: "Total" };
  const byStatus = { new: 0, viewed: 0, replied: 0, closed: 0 };
  const bookingsByStatus = { confirmed: 0, cancelled: 0, completed: 0 };

  for (const doc of leadsSnap.docs) {
    const data = doc.data();
    const total = (data.budget?.total as number) ?? 0;
    const created =
      (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.().toISOString() ?? null;
    const status = (data.status as keyof typeof byStatus) ?? "new";
    if (byStatus[status] !== undefined) byStatus[status] += 1;

    allTime.leads += 1;
    allTime.revenue += total;
    if (created) {
      if (created >= thisMonthStart) {
        thisMonth.leads += 1;
        thisMonth.revenue += total;
      } else if (created >= lastMonthStart) {
        lastMonth.leads += 1;
        lastMonth.revenue += total;
      }
      if (created >= last90) {
        last90d.leads += 1;
        last90d.revenue += total;
      }
    }
  }

  for (const doc of bookingsSnap.docs) {
    const data = doc.data();
    const created =
      (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.().toISOString() ?? null;
    const status = (data.status as keyof typeof bookingsByStatus) ?? "confirmed";
    if (bookingsByStatus[status] !== undefined) bookingsByStatus[status] += 1;

    allTime.bookings += 1;
    if (created) {
      if (created >= thisMonthStart) thisMonth.bookings += 1;
      else if (created >= lastMonthStart) lastMonth.bookings += 1;
      if (created >= last90) last90d.bookings += 1;
    }
  }

  const conversionHint =
    allTime.bookings > 0 ? Math.round(allTime.leads / allTime.bookings) : 0;

  return {
    thisMonth,
    lastMonth,
    last90d,
    allTime,
    byStatus,
    bookingsByStatus,
    conversionHint,
  };
}
