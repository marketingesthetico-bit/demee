"use client";

import { AESTHETIC_LIST, type SupportedAesthetic } from "@/lib/aesthetics";
import type { Aesthetic } from "@/types/profile";
import { cn } from "@/lib/utils";

interface Props {
  value: Aesthetic;
  onChange: (next: SupportedAesthetic) => void;
}

export function AestheticPicker({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {AESTHETIC_LIST.map((aesthetic) => {
        const selected = value === aesthetic.slug;
        return (
          <button
            key={aesthetic.slug}
            type="button"
            onClick={() => onChange(aesthetic.slug as SupportedAesthetic)}
            className={cn(
              "flex flex-col overflow-hidden rounded-md border text-left transition",
              "hover:shadow-sm",
              selected ? "border-olive-500 ring-2 ring-olive-500/30" : "border-ink/10",
            )}
          >
            <div
              className="flex h-24 flex-col justify-between p-3"
              style={{
                backgroundColor: aesthetic.tokens.colorBg,
                color: aesthetic.tokens.colorFg,
                fontFamily: aesthetic.tokens.fontBody,
              }}
            >
              <span
                className="text-sm leading-tight"
                style={{ fontFamily: aesthetic.tokens.fontDisplay }}
              >
                {aesthetic.label}
              </span>
              <span
                className="inline-flex w-fit px-1.5 py-0.5 text-[10px]"
                style={{
                  backgroundColor: aesthetic.tokens.colorAccent,
                  color: aesthetic.tokens.colorAccentContrast,
                  borderRadius: aesthetic.tokens.radiusBase,
                }}
              >
                Muestra
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
