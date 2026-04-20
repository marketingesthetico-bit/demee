"use client";

import type {
  BookingConfig,
  LocationType,
  TimeWindow,
  Weekday,
} from "@/lib/booking/types";
import { WEEKDAYS } from "@/lib/booking/types";
import { emptyWindow } from "@/lib/booking/slots";
import { cn } from "@/lib/utils";

import {
  GoogleCalendarConnect,
  type GoogleConnectionStatus,
} from "./GoogleCalendarConnect";

const WEEKDAY_LABEL: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DURATION_OPTIONS = [15, 30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];
const LEAD_TIME_OPTIONS = [1, 2, 4, 8, 12, 24, 48];
const MAX_ADVANCE_OPTIONS = [7, 14, 21, 30, 45, 60, 90];

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "online", label: "Online (videollamada)" },
  { value: "phone", label: "Teléfono" },
  { value: "in-person", label: "Presencial" },
];

interface Props {
  value: BookingConfig;
  onChange: (next: BookingConfig) => void;
  googleStatus: GoogleConnectionStatus;
}

export function BookingForm({ value, onChange, googleStatus }: Props) {
  function patch(changes: Partial<BookingConfig>) {
    onChange({ ...value, ...changes });
  }

  function patchWindows(day: Weekday, windows: TimeWindow[]) {
    onChange({ ...value, availability: { ...value.availability, [day]: windows } });
  }

  return (
    <div className="space-y-5">
      <GoogleCalendarConnect initial={googleStatus} />

      <div className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper/40 p-3">
        <div className="space-y-0.5">
          <span className="block text-sm font-medium text-ink">Activar agenda</span>
          <span className="block text-xs text-ink/50">
            Cuando esté activa, los visitantes podrán reservar en{" "}
            <code className="font-mono">demee.app/tuhandle/book</code>.
          </span>
        </div>
        <Switch on={value.enabled} onClick={() => patch({ enabled: !value.enabled })} />
      </div>

      <div className="space-y-4 rounded-md border border-ink/10 bg-white p-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink/50">Llamada</h4>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Nombre de la reunión</span>
          <input
            type="text"
            value={value.name}
            onChange={(e) => patch({ name: e.target.value })}
            maxLength={80}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Descripción</span>
          <textarea
            value={value.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            maxLength={600}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs text-ink/60">
            Duración
            <select
              value={value.durationMinutes}
              onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            >
              {DURATION_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} min
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-ink/60">
            Buffer entre llamadas
            <select
              value={value.bufferMinutes}
              onChange={(e) => patch({ bufferMinutes: Number(e.target.value) })}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            >
              {BUFFER_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} min
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-ink/60">
            Antelación mínima
            <select
              value={value.leadTimeHours}
              onChange={(e) => patch({ leadTimeHours: Number(e.target.value) })}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            >
              {LEAD_TIME_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} h
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-ink/60">
            Reservar hasta
            <select
              value={value.maxAdvanceDays}
              onChange={(e) => patch({ maxAdvanceDays: Number(e.target.value) })}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            >
              {MAX_ADVANCE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} días
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-ink/60">
            Modalidad
            <select
              value={value.locationType}
              onChange={(e) => patch({ locationType: e.target.value as LocationType })}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            >
              {LOCATION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-ink/60">
            Detalles
            <input
              type="text"
              value={value.location}
              onChange={(e) => patch({ location: e.target.value })}
              placeholder={
                value.locationType === "phone"
                  ? "+34 6xx…"
                  : value.locationType === "in-person"
                    ? "Calle, ciudad"
                    : "Te envío enlace al confirmar"
              }
              maxLength={400}
              className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-olive-500"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-ink/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Horarios disponibles
          </h4>
          <span className="text-xs text-ink/40">Europe/Madrid</span>
        </div>
        <div className="divide-y divide-ink/5">
          {WEEKDAYS.map((day) => (
            <DayRow
              key={day}
              label={WEEKDAY_LABEL[day]}
              windows={value.availability[day]}
              onChange={(windows) => patchWindows(day, windows)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayRow({
  label,
  windows,
  onChange,
}: {
  label: string;
  windows: TimeWindow[];
  onChange: (next: TimeWindow[]) => void;
}) {
  function add() {
    if (windows.length >= 6) return;
    onChange([...windows, emptyWindow()]);
  }
  function remove(i: number) {
    onChange(windows.filter((_, idx) => idx !== i));
  }
  function patch(i: number, changes: Partial<TimeWindow>) {
    onChange(windows.map((w, idx) => (idx === i ? { ...w, ...changes } : w)));
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <span className="w-20 shrink-0 text-sm font-medium text-ink">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {windows.length === 0 ? (
          <span className="text-xs text-ink/40">Cerrado</span>
        ) : (
          windows.map((w, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="time"
                value={w.start}
                onChange={(e) => patch(i, { start: e.target.value })}
                className="rounded border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-olive-500"
              />
              <span className="text-xs text-ink/40">→</span>
              <input
                type="time"
                value={w.end}
                onChange={(e) => patch(i, { end: e.target.value })}
                className="rounded border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-olive-500"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Quitar tramo"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-sm text-ink/40",
                  "hover:bg-danger/10 hover:text-danger",
                )}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      {windows.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="text-xs text-olive-600 hover:underline"
        >
          + tramo
        </button>
      )}
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
