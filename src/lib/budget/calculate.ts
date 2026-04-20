import type {
  BudgetConfig,
  BudgetItem,
  BudgetSelection,
  CalculatedBudget,
  CalculatedLineItem,
} from "./types";

/**
 * Pure budget calculator. Given a config + the visitor's explicit
 * selections, returns each selected line with multiplier applied plus
 * the total. Deterministic — same inputs always produce the same output.
 * No I/O.
 *
 * Contract:
 * - `selections` is the authoritative list of what the visitor picked.
 *   `defaultSelected: true` on a BudgetItem is only a hint to the UI for
 *   the INITIAL state of the checkbox; the caller is responsible for
 *   seeding its initial selections from it. Once the visitor interacts,
 *   their explicit state wins — deselecting a default-selected item
 *   must remove it from the total.
 * - Selections referring to deleted items are silently dropped.
 * - Unknown optionIds fall back to the item's first option, or to the
 *   base price (multiplier 1) if the item has no options at all.
 * - Multiplier is floor-capped at 0 to guard against config bugs.
 * - Totals are rounded to 2 decimals at the very end.
 */
export function calculateBudget(
  config: BudgetConfig,
  selections: BudgetSelection[],
): CalculatedBudget {
  const itemsById = new Map<string, BudgetItem>();
  for (const item of config.items) itemsById.set(item.id, item);

  // Preserve the visitor's order of selection (de-duping by itemId so a
  // repeated selection doesn't render twice).
  const seen = new Set<string>();
  const activeSelections: BudgetSelection[] = [];
  for (const sel of selections) {
    if (seen.has(sel.itemId)) continue;
    if (!itemsById.has(sel.itemId)) continue; // drop selections for deleted items
    seen.add(sel.itemId);
    activeSelections.push(sel);
  }

  const lines: CalculatedLineItem[] = [];
  for (const sel of activeSelections) {
    const item = itemsById.get(sel.itemId)!;

    let optionId: string | null = null;
    let optionLabel: string | null = null;
    let multiplier = 1;

    if (item.options.length > 0) {
      const firstOption = item.options[0]!;
      const fromSelection =
        sel.optionId != null
          ? item.options.find((o) => o.id === sel.optionId)
          : undefined;
      const chosen = fromSelection ?? firstOption;
      optionId = chosen.id;
      optionLabel = chosen.label;
      multiplier = Math.max(0, chosen.multiplier);
    }

    const basePrice = Math.max(0, item.basePrice);
    const total = round2(basePrice * multiplier);

    lines.push({
      itemId: item.id,
      name: item.name,
      description: item.description,
      unit: item.unit,
      basePrice,
      optionId,
      optionLabel,
      multiplier,
      total,
    });
  }

  const total = round2(lines.reduce((sum, line) => sum + line.total, 0));
  return { lines, total, currency: "EUR" };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
