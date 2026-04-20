"use client";

import { cn } from "@/lib/utils";

export interface TabDef<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (next: T) => void;
  tabs: readonly TabDef<T>[];
}

/**
 * Flat pill-style tab bar used at the top of /bookings and /leads to
 * switch between the list view and the module settings. Mirrors the
 * filter-pill look that already lives on those pages so the two
 * controls read as siblings rather than competing.
 */
export function TabBar<T extends string>({ value, onChange, tabs }: Props<T>) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1"
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              active
                ? "bg-ink text-paper"
                : "text-ink/60 hover:bg-ink/5 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
