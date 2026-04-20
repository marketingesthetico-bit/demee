"use client";

import { getAestheticConfig, type SupportedAesthetic } from "@/lib/aesthetics";
import type { ThemeColorOverrides } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

type ColorField = keyof ThemeColorOverrides;

interface FieldConfig {
  key: ColorField;
  label: string;
  hint: string;
}

const FIELDS: FieldConfig[] = [
  { key: "bg", label: "Fondo", hint: "Color de la página" },
  { key: "fg", label: "Texto", hint: "Color del texto principal" },
  { key: "muted", label: "Texto suave", hint: "Metadatos, fechas, subtítulos" },
  { key: "accent", label: "Acento", hint: "Botones, enlaces, detalles destacados" },
];

interface Props {
  value: ThemeColorOverrides;
  aesthetic: SupportedAesthetic;
  onChange: (next: ThemeColorOverrides) => void;
}

function defaultFor(aesthetic: SupportedAesthetic, key: ColorField): string {
  const config = getAestheticConfig(aesthetic);
  const tokens = config?.tokens;
  if (!tokens) return "#000000";
  if (key === "bg") return tokens.colorBg;
  if (key === "fg") return tokens.colorFg;
  if (key === "muted") return tokens.colorMuted;
  return tokens.colorAccent;
}

export function ColorsForm({ value, aesthetic, onChange }: Props) {
  function setField(key: ColorField, next: string | null) {
    onChange({ ...value, [key]: next });
  }

  const anyOverride = Object.values(value).some((v) => v !== null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const current = value[field.key];
          const fallback = defaultFor(aesthetic, field.key);
          const effective = current ?? fallback;
          const isOverridden = current !== null;
          return (
            <div
              key={field.key}
              className="flex items-center gap-3 rounded-md border border-ink/10 bg-white p-3"
            >
              <label className="relative block h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-ink/15">
                <input
                  type="color"
                  value={effective}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`Elegir color ${field.label.toLowerCase()}`}
                />
                <span
                  aria-hidden="true"
                  className="block h-full w-full"
                  style={{ backgroundColor: effective }}
                />
              </label>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{field.label}</span>
                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => setField(field.key, null)}
                      className="text-[11px] text-ink/50 underline-offset-2 hover:text-ink hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="text"
                    value={effective}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) setField(field.key, v);
                    }}
                    className={cn(
                      "w-24 rounded border border-ink/15 bg-white px-1.5 py-0.5 font-mono text-xs uppercase",
                      "outline-none focus:border-olive-500",
                    )}
                  />
                  <span className="truncate text-[11px] text-ink/50">{field.hint}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-ink/50">
        <span>
          {anyOverride
            ? "Has personalizado algún color. El resto sigue el estilo elegido."
            : "Todos los colores salen del estilo visual. Toca cualquiera para cambiarlo."}
        </span>
        {anyOverride && (
          <button
            type="button"
            onClick={() =>
              onChange({ bg: null, fg: null, muted: null, accent: null })
            }
            className="text-ink/60 underline-offset-2 hover:text-ink hover:underline"
          >
            Resetear todos
          </button>
        )}
      </div>
    </div>
  );
}
