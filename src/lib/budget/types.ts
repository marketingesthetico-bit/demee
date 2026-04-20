export type BudgetUnit = "project" | "hour" | "month";

export interface BudgetOption {
  /** Stable identifier for the option (used in Lead payloads). */
  id: string;
  label: string;
  /** Multiplier applied to the item's basePrice when this option is chosen. */
  multiplier: number;
}

export interface BudgetItem {
  /** Stable identifier — survives edits so Leads can reference historical items. */
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: BudgetUnit;
  /** When true, the visitor can add/remove the item in the public form. */
  selectable: boolean;
  /** When true, the item starts pre-selected in the public form. */
  defaultSelected: boolean;
  /**
   * Optional variants (e.g. "Basic / Standard / Premium"). When present,
   * visitors pick one — the multiplier scales basePrice. When absent,
   * the item has a single fixed price.
   */
  options: BudgetOption[];
}

export interface BudgetConfig {
  enabled: boolean;
  introText: string;
  items: BudgetItem[];
  /** Offer the visitor to also book a call after submitting. v5. */
  suggestBooking: boolean;
  updatedAt?: Date;
}

/**
 * Runtime selection state sent from the public form to the API.
 */
export interface BudgetSelection {
  itemId: string;
  /** Chosen optionId when the item has options; null when it's a simple item. */
  optionId: string | null;
}

export interface CalculatedLineItem {
  itemId: string;
  name: string;
  description: string;
  unit: BudgetUnit;
  basePrice: number;
  optionId: string | null;
  optionLabel: string | null;
  multiplier: number;
  total: number;
}

export interface CalculatedBudget {
  lines: CalculatedLineItem[];
  total: number;
  currency: "EUR";
}

export const EMPTY_BUDGET_CONFIG: BudgetConfig = {
  enabled: false,
  introText:
    "Dime qué necesitas y te doy una estimación orientativa al momento. Te contacto en menos de 24h.",
  items: [],
  suggestBooking: false,
};
