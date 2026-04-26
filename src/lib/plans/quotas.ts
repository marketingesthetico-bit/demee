import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Plan } from "@/types/user";

import { getPlanLimits, startOfUtcMonth } from "./config";

/**
 * Reads the user's plan straight off `/users/{uid}.plan`. Defaults to
 * "free" if the doc is missing the field (or is missing entirely) so
 * downstream gates fail closed.
 */
export async function loadUserPlan(uid: string): Promise<Plan> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return "free";
  const raw = snap.data()?.plan as string | undefined;
  return raw === "pro" || raw === "studio" ? raw : "free";
}

/**
 * Counts the leads for an owner created in the current UTC month.
 *
 * Uses a single-field equality (`ownerUid == X`) so no composite index
 * is required and an in-memory filter cuts to the current month. At
 * Free-tier scale the doc count for an owner stays in the dozens, so
 * this is cheaper than a composite query and avoids index churn.
 */
export async function countLeadsThisMonthForOwner(uid: string): Promise<number> {
  const since = startOfUtcMonth();
  const sinceIso = since.toISOString();
  const snap = await getAdminDb()
    .collection("leads")
    .where("ownerUid", "==", uid)
    .get();
  let count = 0;
  for (const doc of snap.docs) {
    const created = doc.data().createdAt as
      | { toDate?: () => Date }
      | undefined;
    if (!created?.toDate) continue;
    const iso = created.toDate().toISOString();
    if (iso >= sinceIso) count += 1;
  }
  return count;
}

/**
 * Counts non-cancelled bookings for an owner created in the current
 * UTC month. We count by `createdAt` (when the visitor booked) rather
 * than by `startsAt` (when the meeting happens) so the cap matches the
 * natural mental model: "this month X reservations came in".
 *
 * Cancelled bookings are excluded — if a visitor books and cancels,
 * the slot is immediately freed so it shouldn't burn quota either.
 */
export async function countBookingsThisMonthForOwner(uid: string): Promise<number> {
  const since = startOfUtcMonth();
  const sinceIso = since.toISOString();
  const snap = await getAdminDb()
    .collection("bookings")
    .where("ownerUid", "==", uid)
    .get();
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.status === "cancelled") continue;
    const created = data.createdAt as { toDate?: () => Date } | undefined;
    if (!created?.toDate) continue;
    const iso = created.toDate().toISOString();
    if (iso >= sinceIso) count += 1;
  }
  return count;
}

export interface QuotaState {
  plan: Plan;
  /** Whether the next operation is allowed right now. */
  allowed: boolean;
  /** Used count this month. 0 for unlimited plans. */
  used: number;
  /** Cap for the current plan, or `null` if unlimited. */
  limit: number | null;
}

export async function checkLeadQuota(uid: string): Promise<QuotaState> {
  const plan = await loadUserPlan(uid);
  const limit = getPlanLimits(plan).monthlyLeads;
  if (limit === null) return { plan, allowed: true, used: 0, limit: null };
  const used = await countLeadsThisMonthForOwner(uid);
  return { plan, allowed: used < limit, used, limit };
}

export async function checkBookingQuota(uid: string): Promise<QuotaState> {
  const plan = await loadUserPlan(uid);
  const limit = getPlanLimits(plan).monthlyBookings;
  if (limit === null) return { plan, allowed: true, used: 0, limit: null };
  const used = await countBookingsThisMonthForOwner(uid);
  return { plan, allowed: used < limit, used, limit };
}
