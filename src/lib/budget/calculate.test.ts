import { describe, expect, it } from "vitest";

import { calculateBudget } from "./calculate";
import type { BudgetConfig } from "./types";

function config(overrides: Partial<BudgetConfig> = {}): BudgetConfig {
  return {
    enabled: true,
    introText: "",
    suggestBooking: false,
    items: [],
    ...overrides,
  };
}

describe("calculateBudget", () => {
  it("returns an empty budget when no selections", () => {
    const result = calculateBudget(config(), []);
    expect(result).toEqual({ lines: [], total: 0, currency: "EUR" });
  });

  it("empty selections = empty total even if some items are defaultSelected", () => {
    // Regression test. Previously the calculator was auto-including any
    // defaultSelected item regardless of the visitor's explicit choice,
    // so unchecking a pre-selected checkbox left the total stuck at the
    // original value.
    const cfg = config({
      items: [
        {
          id: "brand",
          name: "Identidad",
          description: "",
          basePrice: 1200,
          unit: "project",
          selectable: true,
          defaultSelected: true,
          options: [],
        },
      ],
    });
    const result = calculateBudget(cfg, []);
    expect(result.lines).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("includes an item iff it's in the selections (regardless of defaultSelected)", () => {
    const cfg = config({
      items: [
        {
          id: "brand",
          name: "Identidad",
          description: "",
          basePrice: 1200,
          unit: "project",
          selectable: true,
          defaultSelected: true,
          options: [],
        },
        {
          id: "web",
          name: "Web",
          description: "",
          basePrice: 800,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
      ],
    });
    const result = calculateBudget(cfg, [
      // Picks "web" (not defaultSelected), drops "brand" (defaultSelected).
      { itemId: "web", optionId: null },
    ]);
    expect(result.lines.map((l) => l.itemId)).toEqual(["web"]);
    expect(result.total).toBe(800);
  });

  it("applies the multiplier from the chosen option", () => {
    const cfg = config({
      items: [
        {
          id: "web",
          name: "Web",
          description: "",
          basePrice: 2000,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [
            { id: "basic", label: "Basic", multiplier: 1 },
            { id: "pro", label: "Pro", multiplier: 1.5 },
            { id: "premium", label: "Premium", multiplier: 2 },
          ],
        },
      ],
    });
    const result = calculateBudget(cfg, [{ itemId: "web", optionId: "pro" }]);
    expect(result.lines[0]?.total).toBe(3000);
    expect(result.lines[0]?.optionLabel).toBe("Pro");
    expect(result.total).toBe(3000);
  });

  it("falls back to the first option when the chosen optionId is unknown", () => {
    const cfg = config({
      items: [
        {
          id: "web",
          name: "Web",
          description: "",
          basePrice: 1000,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [
            { id: "basic", label: "Basic", multiplier: 1 },
            { id: "pro", label: "Pro", multiplier: 2 },
          ],
        },
      ],
    });
    const result = calculateBudget(cfg, [{ itemId: "web", optionId: "ghost" }]);
    expect(result.lines[0]?.optionId).toBe("basic");
    expect(result.lines[0]?.total).toBe(1000);
  });

  it("drops selections that reference unknown items", () => {
    const cfg = config({
      items: [
        {
          id: "brand",
          name: "Identidad",
          description: "",
          basePrice: 500,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
      ],
    });
    const result = calculateBudget(cfg, [
      { itemId: "brand", optionId: null },
      { itemId: "ghost-id", optionId: null },
    ]);
    expect(result.lines).toHaveLength(1);
    expect(result.total).toBe(500);
  });

  it("drops duplicate selections (first one wins)", () => {
    const cfg = config({
      items: [
        {
          id: "a",
          name: "A",
          description: "",
          basePrice: 100,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
      ],
    });
    const result = calculateBudget(cfg, [
      { itemId: "a", optionId: null },
      { itemId: "a", optionId: null },
    ]);
    expect(result.lines).toHaveLength(1);
    expect(result.total).toBe(100);
  });

  it("floors negative prices and multipliers at zero", () => {
    const cfg = config({
      items: [
        {
          id: "weird",
          name: "Weird",
          description: "",
          basePrice: -50,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [{ id: "x", label: "X", multiplier: -3 }],
        },
      ],
    });
    const result = calculateBudget(cfg, [{ itemId: "weird", optionId: "x" }]);
    expect(result.lines[0]?.total).toBe(0);
    expect(result.total).toBe(0);
  });

  it("rounds each line and the total to 2 decimals", () => {
    const cfg = config({
      items: [
        {
          id: "a",
          name: "A",
          description: "",
          basePrice: 33.33,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
        {
          id: "b",
          name: "B",
          description: "",
          basePrice: 10,
          unit: "hour",
          selectable: true,
          defaultSelected: false,
          options: [{ id: "x", label: "×1.1", multiplier: 1.1 }],
        },
      ],
    });
    const result = calculateBudget(cfg, [
      { itemId: "a", optionId: null },
      { itemId: "b", optionId: "x" },
    ]);
    expect(result.lines[0]?.total).toBe(33.33);
    expect(result.lines[1]?.total).toBe(11);
    expect(result.total).toBe(44.33);
  });

  it("preserves selection order in the output lines", () => {
    const cfg = config({
      items: [
        {
          id: "a",
          name: "A",
          description: "",
          basePrice: 100,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
        {
          id: "b",
          name: "B",
          description: "",
          basePrice: 200,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
      ],
    });
    const result = calculateBudget(cfg, [
      { itemId: "b", optionId: null },
      { itemId: "a", optionId: null },
    ]);
    expect(result.lines.map((l) => l.itemId)).toEqual(["b", "a"]);
  });
});
