"use client";

import type { ProfileSectionKey } from "@/lib/industries";
import { cn } from "@/lib/utils";

// Header is always on and not toggleable.
const TOGGLEABLE: { key: ProfileSectionKey; label: string; hint: string }[] = [
  { key: "about", label: "Sobre mí", hint: "Bio + habilidades" },
  { key: "services", label: "Servicios", hint: "Lista de servicios con precio" },
  { key: "gallery", label: "Galería", hint: "Imágenes de tu trabajo" },
  { key: "portfolio", label: "Portfolio", hint: "Proyectos con título, descripción y enlace" },
  { key: "contact", label: "Contacto", hint: "Email y redes" },
];

interface Props {
  value: ProfileSectionKey[];
  onChange: (next: ProfileSectionKey[]) => void;
}

export function SectionsToggle({ value, onChange }: Props) {
  function toggle(key: ProfileSectionKey) {
    const set = new Set(value);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    // Always keep header first.
    const next: ProfileSectionKey[] = ["header"];
    for (const k of TOGGLEABLE.map((t) => t.key)) {
      if (set.has(k)) next.push(k);
    }
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {TOGGLEABLE.map((item) => {
        const on = value.includes(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition",
              on
                ? "border-olive-500 bg-olive-50/50"
                : "border-ink/10 bg-white hover:border-ink/20",
            )}
          >
            <div className="space-y-0.5">
              <span className="block text-sm font-medium text-ink">{item.label}</span>
              <span className="block text-xs text-ink/50">{item.hint}</span>
            </div>
            <Switch on={on} />
          </button>
        );
      })}
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition",
        on ? "bg-olive-500" : "bg-ink/20",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition",
          on ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </span>
  );
}
