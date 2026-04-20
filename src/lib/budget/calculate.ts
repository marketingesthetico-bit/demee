import type {
  BudgetConfig,
  BudgetItem,
  BudgetSelection,
  CalculatedBudget,
  CalculatedLineItem,
} from "./types";

/**
 * Pure budget calculator. Given a config + a list of selections,
 * returns each selected line with multiplier applied plus the total.
 * Deterministic — same inputs always produce the same output. No I/O.
 *
 * Non-obvious rules:
 * - Items marked `defaultSelected: true` are included even if the
 *   caller didn't pass them, unless they're also in the selections with
 *   an explicit empty marker (we don't have negative selections; this
 *   matches the "opt-out not supported" UX of a checkbox list).
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

  const selectionByItemId = new Map<string, BudgetSelection>();
  for (const sel of selections) selectionByItemId.set(sel.itemId, sel);

  // Start with the union of selected items + defaultSelected items.
  const activeItemIds = new Set<string>();
  for (const item of config.items) {
    if (item.defaultSelected) activeItemIds.add(item.id);
  }
  for (const sel of selections) {
    if (itemsById.has(sel.itemId)) activeItemIds.add(sel.itemId);
  }

  const lines: CalculatedLineItem[] = [];
  for (const itemId of activeItemIds) {
    const item = itemsById.get(itemId);
    if (!item) continue;

    const chosenSelection = selectionByItemId.get(itemId);
    let optionId: string | null = null;
    let optionLabel: string | null = null;
    let multiplier = 1;

    if (item.options.length > 0) {
      const firstOption = item.options[0]!;
      const fromSelection =
        chosenSelection?.optionId != null
          ? item.options.find((o) => o.id === chosenSelection.optionId)
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
