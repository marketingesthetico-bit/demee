"use client";

import { useMemo, useState } from "react";

import type { LoadedBooking } from "@/lib/firebase/booking-loader";
import { cn } from "@/lib/utils";

type Filter = "upcoming" | "past" | "cancelled" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Próximas" },
  { value: "past", label: "Pasadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "all", label: "Todas" },
];

const LOCATION_LABEL: Record<LoadedBooking["locationType"], string> = {
  online: "Online",
  phone: "Teléfono",
  "in-person": "Presencial",
};

function formatMadridDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

function formatMadridTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
    hour12: false,
  }).format(new Date(iso));
}

export function BookingsList({ initialBookings }: { initialBookings: LoadedBooking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nowIso = new Date().toISOString();

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    if (filter === "cancelled") return bookings.filter((b) => b.status === "cancelled");
    const upcoming = (b: LoadedBooking) => b.status !== "cancelled" && b.endsAt > nowIso;
    const past = (b: LoadedBooking) => b.status !== "cancelled" && b.endsAt <= nowIso;
    return bookings.filter(filter === "upcoming" ? upcoming : past);
  }, [bookings, filter, nowIso]);

  const ordered = useMemo(
    () =>
      filter === "upcoming"
        ? [...filtered].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        : filtered,
    [filtered, filter],
  );

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  async function cancel(id: string) {
    if (!confirm("¿Cancelar esta reunión? El cliente tendrá que agendar otra.")) return;
    const previous = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setBookings(previous);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
        <p className="text-sm text-ink/60">Todavía no tienes reservas.</p>
        <p className="mt-2 text-xs text-ink/50">
          Activa la agenda en la pestaña <em>Ajustes</em> y comparte tu página
          para empezar a recibirlas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition",
                active ? "bg-ink text-paper" : "bg-white text-ink/70 hover:bg-ink/5",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <ul className="space-y-2">
          {ordered.map((booking) => {
            const active = booking.id === selectedId;
            return (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(booking.id)}
                  className={cn(
                    "block w-full rounded-md border bg-white p-4 text-left transition",
                    active
                      ? "border-olive-500 ring-2 ring-olive-500/20"
                      : "border-ink/10 hover:border-ink/20",
                    booking.status === "cancelled" && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="truncate font-medium text-ink">
                        {booking.guest.name}
                      </div>
                      <div className="truncate text-xs text-ink/50">
                        {booking.guest.email}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-medium text-ink">
                        {formatMadridDate(booking.startsAt)}
                      </div>
                      <div className="text-ink/60">
                        {formatMadridTime(booking.startsAt)} ·{" "}
                        {booking.durationMinutes}m
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
          {ordered.length === 0 && (
            <li className="rounded-md border border-dashed border-ink/15 bg-white/50 px-4 py-8 text-center text-sm text-ink/50">
              Nada con este filtro.
            </li>
          )}
        </ul>

        <section className="rounded-lg border border-ink/10 bg-white p-6">
          {selected ? (
            <BookingDetail booking={selected} onCancel={() => void cancel(selected.id)} />
          ) : (
            <p className="text-sm text-ink/50">Selecciona una reunión a la izquierda.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function BookingDetail({
  booking,
  onCancel,
}: {
  booking: LoadedBooking;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-ink/50">
          {booking.meetingName}
        </div>
        <h2 className="font-display text-2xl text-ink">{booking.guest.name}</h2>
        <a
          href={`mailto:${booking.guest.email}`}
          className="text-sm text-olive-700 hover:underline"
        >
          {booking.guest.email}
        </a>
        {booking.guest.phone && (
          <p className="text-sm text-ink/60">{booking.guest.phone}</p>
        )}
      </header>

      <div className="space-y-1 rounded-md bg-paper/60 p-4 text-sm">
        <div className="font-medium text-ink">{formatMadridDate(booking.startsAt)}</div>
        <div className="text-ink/70">
          {formatMadridTime(booking.startsAt)} – {formatMadridTime(booking.endsAt)} ·{" "}
          {booking.durationMinutes} min
        </div>
        <div className="text-xs text-ink/50">
          {LOCATION_LABEL[booking.locationType]}
          {booking.location ? ` · ${booking.location}` : ""}
        </div>
      </div>

      {booking.guest.notes && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-ink/50">Notas</h3>
          <p className="whitespace-pre-line rounded-md bg-paper/60 px-3 py-2 text-sm text-ink/80">
            {booking.guest.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <a
          href={`mailto:${booking.guest.email}?subject=Re:%20${encodeURIComponent(booking.meetingName)}`}
          className="flex-1 rounded-md bg-ink px-4 py-2.5 text-center text-sm font-medium text-paper hover:bg-ink/90"
        >
          Email al cliente
        </a>
        {booking.status === "confirmed" && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
          >
            Cancelar
          </button>
        )}
        {booking.status === "cancelled" && (
          <span className="rounded-md bg-ink/5 px-4 py-2.5 text-sm text-ink/50">
            Cancelada
          </span>
        )}
      </div>
    </div>
  );
}
