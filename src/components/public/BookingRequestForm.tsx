"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { AvailabilitySlot, BookingConfig } from "@/lib/booking/types";
import { madridWallClock } from "@/lib/booking/madrid-tz";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; startsAt: string; endsAt: string; meetUrl: string | null }
  | { kind: "error"; message: string };

const ERROR_COPY: Record<string, string> = {
  "invalid-body": "Revisa los datos.",
  "invalid-slot": "Ese horario ya no es válido.",
  "slot-too-soon": "No se puede reservar con tan poca antelación.",
  "slot-too-far": "Esa fecha supera el máximo permitido.",
  "slot-taken": "Ese horario acaba de ocuparse. Elige otro.",
  "booking-not-found": "Este freelancer no acepta reservas ahora.",
};

/** Format "YYYY-MM-DD" in Madrid for a given UTC instant offset. */
function madridDateFromOffset(daysFromToday: number): string {
  const now = new Date();
  const targetUtc = new Date(now.getTime() + daysFromToday * 86_400_000);
  const wall = madridWallClock(targetUtc);
  return `${wall.year.toString().padStart(4, "0")}-${wall.month
    .toString()
    .padStart(2, "0")}-${wall.day.toString().padStart(2, "0")}`;
}

function formatMadridTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
    hour12: false,
  }).format(new Date(iso));
}

function formatMadridDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

function formatDayLabel(madridDate: string): { weekday: string; day: string; month: string } {
  const parts = madridDate.split("-").map(Number);
  if (parts.length !== 3) return { weekday: "", day: "", month: "" };
  // Use UTC midnight + shift — good enough for label.
  const approx = new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!, 12, 0));
  const weekday = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    timeZone: "Europe/Madrid",
  }).format(approx);
  const day = String(parts[2]);
  const month = new Intl.DateTimeFormat("es-ES", {
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(approx);
  return { weekday, day, month };
}

interface Props {
  handle: string;
  config: BookingConfig;
}

export function BookingRequestForm({ handle, config }: Props) {
  const daysToShow = Math.min(14, Math.max(1, config.maxAdvanceDays));
  const dateOptions = useMemo(
    () => Array.from({ length: daysToShow }, (_, i) => madridDateFromOffset(i)),
    [daysToShow],
  );

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0] ?? "");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const loadSlotsFor = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/bookings/slots?handle=${encodeURIComponent(handle)}&date=${encodeURIComponent(date)}`,
        );
        const data = (await res.json()) as { slots?: AvailabilitySlot[] };
        setSlots(data.slots ?? []);
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [handle],
  );

  useEffect(() => {
    if (selectedDate) void loadSlotsFor(selectedDate);
  }, [selectedDate, loadSlotsFor]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setStatus({ kind: "error", message: "Elige un horario primero." });
      return;
    }
    if (!name.trim() || !email.trim()) {
      setStatus({ kind: "error", message: "Rellena nombre y email." });
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          startsAt: selectedSlot.startsAt,
          guest: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            notes: notes.trim() || null,
          },
          honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        startsAt?: string;
        endsAt?: string;
        meetUrl?: string | null;
      };
      if (!res.ok || !data.ok) {
        const msg = ERROR_COPY[data.error ?? ""] ?? "No se pudo reservar.";
        setStatus({ kind: "error", message: msg });
        if (data.error === "slot-taken") {
          // Refresh slots so the user picks another.
          void loadSlotsFor(selectedDate);
        }
        return;
      }
      setStatus({
        kind: "sent",
        startsAt: data.startsAt ?? selectedSlot.startsAt,
        endsAt: data.endsAt ?? selectedSlot.endsAt,
        meetUrl: data.meetUrl ?? null,
      });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="space-y-4 rounded-aesthetic-base border border-aesthetic-fg/15 p-6 text-center">
        <div className="font-aesthetic-display text-2xl">Reunión confirmada</div>
        <p className="text-sm text-aesthetic-fg/80">
          {formatMadridDate(status.startsAt)} · {formatMadridTime(status.startsAt)} –{" "}
          {formatMadridTime(status.endsAt)}
        </p>
        {status.meetUrl && (
          <a
            href={status.meetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-aesthetic-base bg-aesthetic-accent px-4 py-2 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90"
          >
            Abrir enlace de Google Meet
          </a>
        )}
        <p className="text-xs text-aesthetic-muted">
          Te llegará la invitación por email con los detalles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-aesthetic-display text-xl">Elige el día</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dateOptions.map((date) => {
            const isActive = date === selectedDate;
            const label = formatDayLabel(date);
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex min-w-[68px] flex-col items-center gap-0.5 rounded-aesthetic-base border px-3 py-2 text-xs transition",
                  isActive
                    ? "border-aesthetic-accent bg-aesthetic-accent text-aesthetic-accent-contrast"
                    : "border-aesthetic-fg/15 text-aesthetic-fg/80 hover:border-aesthetic-fg/30",
                )}
              >
                <span className="uppercase">{label.weekday}</span>
                <span className="text-lg font-medium">{label.day}</span>
                <span className="uppercase">{label.month}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-aesthetic-display text-xl">Elige la hora</h2>
        {loadingSlots ? (
          <p className="text-sm text-aesthetic-muted">Cargando disponibilidad…</p>
        ) : slots.length === 0 ? (
          <p className="rounded-aesthetic-base border border-aesthetic-fg/15 px-3 py-4 text-center text-sm text-aesthetic-muted">
            Sin horarios disponibles este día.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const active = selectedSlot?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-aesthetic-base border px-3 py-2 text-sm transition",
                    active
                      ? "border-aesthetic-accent bg-aesthetic-accent text-aesthetic-accent-contrast"
                      : "border-aesthetic-fg/15 text-aesthetic-fg/80 hover:border-aesthetic-fg/30",
                  )}
                >
                  {formatMadridTime(slot.startsAt)}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedSlot && (
        <section className="space-y-4">
          <h2 className="font-aesthetic-display text-xl">Tus datos</h2>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            required
            maxLength={120}
            className="w-full rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-2.5 text-sm outline-none focus:border-aesthetic-accent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            maxLength={200}
            className="w-full rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-2.5 text-sm outline-none focus:border-aesthetic-accent"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono (opcional)"
            maxLength={40}
            className="w-full rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-2.5 text-sm outline-none focus:border-aesthetic-accent"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cuéntame de qué quieres hablar (opcional)"
            rows={3}
            maxLength={1000}
            className="w-full rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-2.5 text-sm outline-none focus:border-aesthetic-accent"
          />

          <input
            type="text"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
          />

          <div className="rounded-aesthetic-base border border-aesthetic-fg/15 p-3 text-sm">
            <div className="text-aesthetic-muted">Reservarás</div>
            <div className="font-medium">
              {formatMadridDate(selectedSlot.startsAt)} · {formatMadridTime(selectedSlot.startsAt)}
            </div>
          </div>

          {status.kind === "error" && (
            <p className="rounded-aesthetic-base border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={status.kind === "submitting"}
            className="w-full rounded-aesthetic-base bg-aesthetic-accent px-4 py-3 font-medium text-aesthetic-accent-contrast transition hover:opacity-90 disabled:opacity-60"
          >
            {status.kind === "submitting" ? "Reservando…" : "Confirmar reserva"}
          </button>
        </section>
      )}
    </form>
  );
}
