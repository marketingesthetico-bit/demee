"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BookingForm } from "@/components/editor/BookingForm";
import type { GoogleConnectionStatus } from "@/components/editor/GoogleCalendarConnect";
import type { BookingConfig } from "@/lib/booking/types";

import { SaveStatusPill, type SaveStatus } from "./SaveStatusPill";

const SAVE_DEBOUNCE_MS = 800;

interface Props {
  initialConfig: BookingConfig;
  googleStatus: GoogleConnectionStatus;
  handle: string;
}

/**
 * Settings surface for the booking module — lives inside the /bookings
 * page under the "Ajustes" tab. Owns its own debounced-save loop so
 * the user can tweak availability from the same place they see the
 * resulting reservations, without hopping to /edit.
 */
export function BookingSettings({ initialConfig, googleStatus, handle }: Props) {
  const [config, setConfig] = useState<BookingConfig>(initialConfig);
  const [status, setStatus] = useState<SaveStatus>({ kind: "clean" });
  const pending = useRef<BookingConfig | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const next = pending.current;
    if (!next) {
      setStatus({ kind: "clean" });
      return;
    }
    pending.current = null;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: "No se pudo guardar la agenda." });
        return;
      }
      setStatus({ kind: "saved", at: Date.now() });
    } catch (err) {
      console.error("[booking-settings] save failed", err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }, []);

  function update(next: BookingConfig) {
    setConfig(next);
    pending.current = next;
    setStatus({ kind: "dirty" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-ink">Ajustes de agenda</h2>
          <p className="text-xs text-ink/60">
            Se guarda automáticamente · página pública en{" "}
            <a
              href={`/${handle}/book`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-olive-700 hover:underline"
            >
              demee.app/{handle}/book
            </a>
          </p>
        </div>
        <SaveStatusPill status={status} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-6">
        <BookingForm value={config} onChange={update} googleStatus={googleStatus} />
      </div>
    </div>
  );
}
