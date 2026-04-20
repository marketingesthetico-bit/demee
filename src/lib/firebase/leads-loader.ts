import "server-only";

import type { CalculatedBudget } from "@/lib/budget/types";

import { getAdminDb } from "./admin";

export type LeadStatus = "new" | "viewed" | "replied" | "closed";

export interface LoadedLead {
  id: string;
  ownerUid: string;
  handle: string;
  type: "budget";
  status: LeadStatus;
  guest: {
    name: string;
    email: string;
    company: string | null;
    message: string | null;
  };
  budget: CalculatedBudget;
  createdAt: Date | null;
}

export async function loadLeadsForOwner(ownerUid: string): Promise<LoadedLead[]> {
  const snap = await getAdminDb()
    .collection("leads")
    .where("ownerUid", "==", ownerUid)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    const created = data.createdAt as { toDate?: () => Date } | undefined;
    return {
      id: doc.id,
      ownerUid: data.ownerUid,
      handle: data.handle,
      type: "budget",
      status: (data.status as LeadStatus | undefined) ?? "new",
      guest: {
        name: (data.guest?.name as string) ?? "",
        email: (data.guest?.email as string) ?? "",
        company: (data.guest?.company as string | null) ?? null,
        message: (data.guest?.message as string | null) ?? null,
      },
      budget: (data.budget as CalculatedBudget) ?? { lines: [], total: 0, currency: "EUR" },
      createdAt: created?.toDate?.() ?? null,
    } satisfies LoadedLead;
  });
}
