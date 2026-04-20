"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BudgetForm } from "@/components/editor/BudgetForm";
import type { BudgetConfig } from "@/lib/budget/types";

import { SaveStatusPill, type SaveStatus } from "./SaveStatusPill";

const SAVE_DEBOUNCE_MS = 800;

interface Props {
  initialConfig: BudgetConfig;
  handle: string;
}

/**
 * Settings surface for the budget module — lives inside the /leads page
 * under the "Ajustes" tab. Same debounced-save pattern as
 * BookingSettings; kept separate for clarity (the two modules may
 * diverge on validation or UX later).
 */
export function BudgetSettings({ initialConfig, handle }: Props) {
  const [config, setConfig] = useState<BudgetConfig>(initialConfig);
  const [status, setStatus] = useState<SaveStatus>({ kind: "clean" });
  const pending = useRef<BudgetConfig | null>(null);
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
      const res = await fetch("/api/budget", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: "No se pudo guardar el presupuesto." });
        return;
      }
      setStatus({ kind: "saved", at: Date.now() });
    } catch (err) {
      console.error("[budget-settings] save failed", err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }, []);

  function update(next: BudgetConfig) {
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
          <h2 className="font-display text-xl text-ink">Ajustes del presupuestador</h2>
          <p className="text-xs text-ink/60">
            Se guarda automáticamente · página pública en{" "}
            <a
              href={`/${handle}/budget`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-olive-700 hover:underline"
            >
              demee.app/{handle}/budget
            </a>
          </p>
        </div>
        <SaveStatusPill status={status} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-6">
        <BudgetForm value={config} onChange={update} />
      </div>
    </div>
  );
}
