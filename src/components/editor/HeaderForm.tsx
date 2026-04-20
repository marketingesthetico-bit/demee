"use client";

import type { EditableProfile } from "@/lib/profile/editable";

import { TextField } from "./TextField";

type Header = EditableProfile["header"];

const AVAILABILITY_OPTIONS: { value: Header["availability"]; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "limited", label: "Plazas limitadas" },
  { value: "closed", label: "Cerrado por ahora" },
];

interface Props {
  value: Header;
  onChange: (next: Header) => void;
}

export function HeaderForm({ value, onChange }: Props) {
  function patch(changes: Partial<Header>) {
    onChange({ ...value, ...changes });
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Nombre"
        value={value.name}
        onChange={(v) => patch({ name: v })}
        maxLength={80}
      />
      <TextField
        label="Titular profesional"
        value={value.headline}
        onChange={(v) => patch({ headline: v })}
        maxLength={200}
        hint="Una frase que responda «qué haces y para quién». Máx. 200 caracteres."
      />
      <TextField
        label="Ubicación"
        value={value.location ?? ""}
        onChange={(v) => patch({ location: v.trim() === "" ? null : v })}
        placeholder="Madrid, Barcelona, remoto…"
        maxLength={120}
      />
      <div className="space-y-1.5">
        <label htmlFor="availability" className="text-sm font-medium text-ink">
          Disponibilidad
        </label>
        <select
          id="availability"
          value={value.availability}
          onChange={(e) => patch({ availability: e.target.value as Header["availability"] })}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
