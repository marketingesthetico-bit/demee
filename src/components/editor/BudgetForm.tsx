"use client";

import type { BudgetConfig, BudgetItem, BudgetOption, BudgetUnit } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

const UNIT_OPTIONS: { value: BudgetUnit; label: string }[] = [
  { value: "project", label: "por proyecto" },
  { value: "hour", label: "por hora" },
  { value: "month", label: "por mes" },
];

interface Props {
  value: BudgetConfig;
  onChange: (next: BudgetConfig) => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function BudgetForm({ value, onChange }: Props) {
  function patch(changes: Partial<BudgetConfig>) {
    onChange({ ...value, ...changes });
  }

  function patchItem(index: number, changes: Partial<BudgetItem>) {
    onChange({
      ...value,
      items: value.items.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    });
  }

  function addItem() {
    if (value.items.length >= 20) return;
    onChange({
      ...value,
      items: [
        ...value.items,
        {
          id: makeId(),
          name: "Nuevo servicio",
          description: "",
          basePrice: 500,
          unit: "project",
          selectable: true,
          defaultSelected: false,
          options: [],
        },
      ],
    });
  }

  function removeItem(index: number) {
    onChange({ ...value, items: value.items.filter((_, i) => i !== index) });
  }

  function moveItem(index: number, delta: number) {
    const next = [...value.items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    onChange({ ...value, items: next });
  }

  function patchOption(itemIndex: number, optIndex: number, changes: Partial<BudgetOption>) {
    const item = value.items[itemIndex];
    if (!item) return;
    patchItem(itemIndex, {
      options: item.options.map((o, i) => (i === optIndex ? { ...o, ...changes } : o)),
    });
  }

  function addOption(itemIndex: number) {
    const item = value.items[itemIndex];
    if (!item || item.options.length >= 6) return;
    patchItem(itemIndex, {
      options: [
        ...item.options,
        { id: makeId(), label: "Nueva opción", multiplier: 1 },
      ],
    });
  }

  function removeOption(itemIndex: number, optIndex: number) {
    const item = value.items[itemIndex];
    if (!item) return;
    patchItem(itemIndex, {
      options: item.options.filter((_, i) => i !== optIndex),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper/40 p-3">
        <div className="space-y-0.5">
          <span className="block text-sm font-medium text-ink">Activar presupuestador</span>
          <span className="block text-xs text-ink/50">
            Cuando esté activo, los visitantes verán <code className="font-mono">demee.app/tuhandle/budget</code>.
          </span>
        </div>
        <Switch on={value.enabled} onClick={() => patch({ enabled: !value.enabled })} />
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Intro (la ve el visitante arriba)</span>
        <textarea
          value={value.introText}
          onChange={(e) => patch({ introText: e.target.value })}
          rows={2}
          maxLength={600}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
        />
      </label>

      <div className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper/40 p-3">
        <div className="space-y-0.5">
          <span className="block text-sm font-medium text-ink">Sugerir agendar llamada al enviar</span>
          <span className="block text-xs text-ink/50">Aparece al final del presupuesto enviado.</span>
        </div>
        <Switch
          on={value.suggestBooking}
          onClick={() => patch({ suggestBooking: !value.suggestBooking })}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink/50">Servicios</h4>
        {value.items.length === 0 && (
          <p className="rounded-md border border-dashed border-ink/15 bg-paper/60 px-3 py-4 text-center text-sm text-ink/60">
            Sin servicios todavía.
          </p>
        )}

        <ul className="space-y-3">
          {value.items.map((item, i) => (
            <li key={item.id} className="space-y-3 rounded-md border border-ink/10 bg-paper/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => patchItem(i, { name: e.target.value })}
                  maxLength={80}
                  className="flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
                <div className="flex items-center gap-0.5">
                  <IconButton label="Subir" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                    ↑
                  </IconButton>
                  <IconButton
                    label="Bajar"
                    onClick={() => moveItem(i, +1)}
                    disabled={i === value.items.length - 1}
                  >
                    ↓
                  </IconButton>
                  <IconButton label="Quitar" onClick={() => removeItem(i)} variant="danger">
                    ×
                  </IconButton>
                </div>
              </div>

              <textarea
                value={item.description}
                onChange={(e) => patchItem(i, { description: e.target.value })}
                placeholder="Qué incluye, plazos…"
                rows={2}
                maxLength={500}
                className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              />

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs text-ink/60">
                  Precio base (€)
                  <input
                    type="number"
                    min={0}
                    value={item.basePrice}
                    onChange={(e) => patchItem(i, { basePrice: Number(e.target.value) || 0 })}
                    className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                  />
                </label>
                <label className="space-y-1 text-xs text-ink/60">
                  Unidad
                  <select
                    value={item.unit}
                    onChange={(e) => patchItem(i, { unit: e.target.value as BudgetUnit })}
                    className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-ink/70">
                  <input
                    type="checkbox"
                    checked={item.defaultSelected}
                    onChange={(e) => patchItem(i, { defaultSelected: e.target.checked })}
                    className="rounded border-ink/30"
                  />
                  Pre-seleccionado
                </label>
                <label className="flex items-center gap-2 text-xs text-ink/70">
                  <input
                    type="checkbox"
                    checked={item.selectable}
                    onChange={(e) => patchItem(i, { selectable: e.target.checked })}
                    className="rounded border-ink/30"
                  />
                  El visitante puede añadirlo/quitarlo
                </label>
              </div>

              <div className="space-y-2 rounded-md border border-ink/10 bg-white p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink/60">
                    Opciones {item.options.length > 0 && `(${item.options.length})`}
                  </span>
                  {item.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOption(i)}
                      className="text-xs text-olive-600 hover:underline"
                    >
                      + añadir opción
                    </button>
                  )}
                </div>
                {item.options.length === 0 ? (
                  <p className="text-xs text-ink/40">
                    Sin opciones — precio fijo. Añade para ofrecer variantes (Basic / Pro / Premium,
                    tamaños, tiempos…).
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {item.options.map((opt, oi) => (
                      <li key={opt.id} className="grid grid-cols-[1fr_80px_auto] gap-1.5">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => patchOption(i, oi, { label: e.target.value })}
                          placeholder="Etiqueta"
                          className="rounded border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-olive-500"
                        />
                        <input
                          type="number"
                          step={0.1}
                          min={0}
                          value={opt.multiplier}
                          onChange={(e) =>
                            patchOption(i, oi, { multiplier: Number(e.target.value) || 0 })
                          }
                          placeholder="×"
                          className="rounded border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-olive-500"
                        />
                        <IconButton
                          label="Quitar opción"
                          onClick={() => removeOption(i, oi)}
                          variant="danger"
                        >
                          ×
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>

        {value.items.length < 20 && (
          <button
            type="button"
            onClick={addItem}
            className="w-full rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm text-ink/70 hover:border-olive-500 hover:bg-olive-50"
          >
            + Añadir servicio al presupuestador
          </button>
        )}
      </div>
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
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
    </button>
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
