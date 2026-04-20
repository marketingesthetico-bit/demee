import "server-only";

import type { SupportedIndustry } from "@/lib/industries";
import { getBudgetTemplate } from "@/lib/budget/templates";
import type { BudgetConfig, BudgetItem, BudgetOption } from "@/lib/budget/types";

import { getAdminDb } from "./admin";

function coerceItem(raw: Record<string, unknown>): BudgetItem | null {
  const id = raw.id;
  const name = raw.name;
  if (typeof id !== "string" || !id || typeof name !== "string" || !name) return null;
  const rawOptions = Array.isArray(raw.options) ? (raw.options as unknown[]) : [];
  const options: BudgetOption[] = rawOptions
    .filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null)
    .map((o) => ({
      id: typeof o.id === "string" ? o.id : "",
      label: typeof o.label === "string" ? o.label : "",
      multiplier: typeof o.multiplier === "number" ? o.multiplier : 1,
    }))
    .filter((o) => o.id && o.label);
  return {
    id,
    name,
    description: typeof raw.description === "string" ? raw.description : "",
    basePrice: typeof raw.basePrice === "number" ? raw.basePrice : 0,
    unit:
      raw.unit === "hour" || raw.unit === "month" || raw.unit === "project"
        ? raw.unit
        : "project",
    selectable: raw.selectable !== false,
    defaultSelected: raw.defaultSelected === true,
    options,
  };
}

function coerceConfig(data: Record<string, unknown> | undefined): BudgetConfig | null {
  if (!data) return null;
  const rawItems = Array.isArray(data.items) ? (data.items as unknown[]) : [];
  const items = rawItems
    .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
    .map(coerceItem)
    .filter((i): i is BudgetItem => i !== null);
  return {
    enabled: data.enabled === true,
    introText: typeof data.introText === "string" ? data.introText : "",
    suggestBooking: data.suggestBooking === true,
    items,
  };
}

/**
 * Owner-side loader. Falls back to the industry's starter template
 * when the user has never saved a budget — so the editor always has
 * something to show.
 */
export async function loadOwnBudget(
  uid: string,
  industry: SupportedIndustry | null,
): Promise<BudgetConfig> {
  const snap = await getAdminDb().collection("users").doc(uid).collection("budget").doc("main").get();
  const stored = coerceConfig(snap.exists ? snap.data() : undefined);
  if (stored && stored.items.length > 0) return stored;
  if (industry) return getBudgetTemplate(industry);
  return {
    enabled: false,
    introText: "",
    suggestBooking: false,
    items: [],
  };
}

/**
 * Public loader for the /[handle]/budget page. Resolves handle → uid,
 * reads the budget only if enabled, and returns null otherwise so the
 * page can 404/hide.
 */
export async function loadPublicBudget(
  handle: string,
): Promise<{ uid: string; handle: string; config: BudgetConfig } | null> {
  const db = getAdminDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) return null;
  const uid = handleSnap.data()?.uid as string | undefined;
  if (!uid) return null;

  const budgetSnap = await db.collection("users").doc(uid).collection("budget").doc("main").get();
  if (!budgetSnap.exists) return null;
  const config = coerceConfig(budgetSnap.data());
  if (!config || !config.enabled || config.items.length === 0) return null;
  return { uid, handle, config };
}
