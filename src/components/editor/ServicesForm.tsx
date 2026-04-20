"use client";

import type { PublicService } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const UNIT_OPTIONS: { value: NonNullable<PublicService["unit"]> | ""; label: string }[] = [
  { value: "", label: "Sin unidad" },
  { value: "project", label: "por proyecto" },
  { value: "hour", label: "por hora" },
  { value: "month", label: "por mes" },
];

interface Props {
  value: PublicService[];
  onChange: (next: PublicService[]) => void;
}

export function ServicesForm({ value, onChange }: Props) {
  function patchAt(index: number, changes: Partial<PublicService>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    onChange(next);
  }

  function add() {
    if (value.length >= 10) return;
    onChange([
      ...value,
      { name: "Nuevo servicio", description: "", priceFrom: null, unit: null },
    ]);
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="rounded-md border border-dashed border-ink/15 bg-paper/60 px-3 py-4 text-center text-sm text-ink/60">
          Sin servicios todavía. Añade el primero.
        </p>
      )}

      <ul className="space-y-3">
        {value.map((service, i) => (
          <li key={i} className="space-y-3 rounded-md border border-ink/10 bg-paper/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <input
                type="text"
                value={service.name}
                onChange={(e) => patchAt(i, { name: e.target.value })}
                placeholder="Nombre del servicio"
                maxLength={80}
                className="flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              />
              <div className="flex items-center gap-0.5">
                <IconButton
                  label="Subir"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  ↑
                </IconButton>
                <IconButton
                  label="Bajar"
                  onClick={() => move(i, +1)}
                  disabled={i === value.length - 1}
                >
                  ↓
                </IconButton>
                <IconButton label="Quitar" onClick={() => remove(i)} variant="danger">
                  ×
                </IconButton>
              </div>
            </div>
            <textarea
              value={service.description}
              onChange={(e) => patchAt(i, { description: e.target.value })}
              placeholder="Qué incluye, plazos, forma de trabajo…"
              rows={2}
              maxLength={280}
              className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={service.priceFrom ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = raw === "" ? null : Number(raw);
                  patchAt(i, { priceFrom: Number.isFinite(next as number) ? (next as number) : null });
                }}
                placeholder="Precio desde (€)"
                className="rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              />
              <select
                value={service.unit ?? ""}
                onChange={(e) =>
                  patchAt(i, {
                    unit: (e.target.value === "" ? null : e.target.value) as PublicService["unit"],
                  })
                }
                className="rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>

      {value.length < 10 && (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm text-ink/70 hover:border-olive-500 hover:bg-olive-50"
        >
          + Añadir servicio
        </button>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  label,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-sm transition",
        "hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-30",
        variant === "danger" && "hover:bg-danger/10 hover:text-danger",
      )}
    >
      {children}
    </button>
  );
}
