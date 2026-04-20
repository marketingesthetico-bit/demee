import "server-only";

import { getAdminDb } from "./admin";

export interface DashboardSummary {
  leads: {
    total: number;
    newCount: number;
    last30d: number;
  };
  bookings: {
    total: number;
    upcoming: number;
    last30d: number;
  };
  recentLeads: {
    id: string;
    guestName: string;
    guestEmail: string;
    total: number;
    status: "new" | "viewed" | "replied" | "closed";
    createdAt: string | null;
  }[];
  upcomingBookings: {
    id: string;
    guestName: string;
    guestEmail: string;
    startsAt: string;
    durationMinutes: number;
  }[];
}

function thirtyDaysAgoIso(): string {
  return new Date(Date.now() - 30 * 86_400_000).toISOString();
}

/**
 * Fetches a summary of the freelancer's leads + bookings for the
 * dashboard home page. Does per-owner fetches with single-field
 * filters (no composite indexes needed).
 */
export async function loadDashboardSummary(uid: string): Promise<DashboardSummary> {
  const db = getAdminDb();
  const [leadsSnap, bookingsSnap] = await Promise.all([
    db.collection("leads").where("ownerUid", "==", uid).get(),
    db.collection("bookings").where("ownerUid", "==", uid).get(),
  ]);

  const thirty = thirtyDaysAgoIso();
  const nowIso = new Date().toISOString();

  let leadsTotal = 0;
  let leadsNew = 0;
  let leadsRecent = 0;
  const leadRows: DashboardSummary["recentLeads"] = [];

  for (const doc of leadsSnap.docs) {
    const data = doc.data();
    leadsTotal += 1;
    if (data.status === "new") leadsNew += 1;
    const created = (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.();
    const createdIso = created?.toISOString() ?? null;
    if (createdIso && createdIso >= thirty) leadsRecent += 1;
    leadRows.push({
      id: doc.id,
      guestName: (data.guest?.name as string) ?? "",
      guestEmail: (data.guest?.email as string) ?? "",
      total: (data.budget?.total as number) ?? 0,
      status: (data.status as "new" | "viewed" | "replied" | "closed") ?? "new",
      createdAt: createdIso,
    });
  }
  leadRows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  let bookingsTotal = 0;
  let bookingsUpcoming = 0;
  let bookingsRecent = 0;
  const bookingRows: DashboardSummary["upcomingBookings"] = [];

  for (const doc of bookingsSnap.docs) {
    const data = doc.data();
    bookingsTotal += 1;
    const startsAt = data.startsAt as string | undefined;
    const status = (data.status as string) ?? "confirmed";
    if (status !== "cancelled" && startsAt && startsAt >= nowIso) {
      bookingsUpcoming += 1;
      bookingRows.push({
        id: doc.id,
        guestName: (data.guest?.name as string) ?? "",
        guestEmail: (data.guest?.email as string) ?? "",
        startsAt,
        durationMinutes: (data.durationMinutes as number) ?? 30,
      });
    }
    const created = (data.createdAt as { toDate?: () => Date } | undefined)?.toDate?.();
    const createdIso = created?.toISOString() ?? null;
    if (createdIso && createdIso >= thirty) bookingsRecent += 1;
  }
  bookingRows.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return {
    leads: { total: leadsTotal, newCount: leadsNew, last30d: leadsRecent },
    bookings: {
      total: bookingsTotal,
      upcoming: bookingsUpcoming,
      last30d: bookingsRecent,
    },
    recentLeads: leadRows.slice(0, 5),
    upcomingBookings: bookingRows.slice(0, 5),
  };
}
