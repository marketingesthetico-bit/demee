"use client";

import { useMemo, useState } from "react";

import { calculateBudget } from "@/lib/budget/calculate";
import type {
  BudgetConfig,
  BudgetSelection,
  CalculatedBudget,
} from "@/lib/budget/types";
import { cn } from "@/lib/utils";

type Selections = Record<string, { selected: boolean; optionId: string | null }>;

function buildInitialSelections(config: BudgetConfig): Selections {
  const map: Selections = {};
  for (const item of config.items) {
    map[item.id] = {
      selected: item.defaultSelected,
      optionId: item.options[0]?.id ?? null,
    };
  }
  return map;
}

function toApiSelections(config: BudgetConfig, state: Selections): BudgetSelection[] {
  return config.items
    .filter((item) => state[item.id]?.selected)
    .map((item) => ({
      itemId: item.id,
      optionId: state[item.id]?.optionId ?? null,
    }));
}

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; total: number }
  | { kind: "error"; message: string };

interface Props {
  handle: string;
  config: BudgetConfig;
  hasBooking: boolean;
}

export function BudgetRequestForm({ handle, config, hasBooking }: Props) {
  const [selections, setSelections] = useState<Selections>(() =>
    buildInitialSelections(config),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Honeypot — kept out of labels so humans don't see it; bots fill it.
  const [honeypot, setHoneypot] = useState("");

  const preview: CalculatedBudget = useMemo(
    () => calculateBudget(config, toApiSelections(config, selections)),
    [config, selections],
  );

  function toggle(itemId: string) {
    setSelections((s) => ({
      ...s,
      [itemId]: { ...(s[itemId] ?? { optionId: null, selected: false }), selected: !s[itemId]?.selected },
    }));
  }

  function pickOption(itemId: string, optionId: string) {
    setSelections((s) => ({
      ...s,
      [itemId]: { ...(s[itemId] ?? { selected: true, optionId: null }), optionId },
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "submitting") return;
    if (!name.trim() || !email.trim()) {
      setStatus({ kind: "error", message: "Rellena nombre y email." });
      return;
    }
    if (preview.lines.length === 0) {
      setStatus({ kind: "error", message: "Marca al menos un servicio." });
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          guest: {
            name: name.trim(),
            email: email.trim(),
            company: company.trim() || null,
            message: message.trim() || null,
          },
          selections: toApiSelections(config, selections),
          honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        total?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        // Owner hit the Free-tier monthly cap between the page render
        // and this submit. Race-condition window is small; surface a
        // calm message rather than the generic "no se pudo enviar".
        if (data.error === "lead-quota-exceeded") {
          setStatus({
            kind: "error",
            message:
              "Este freelancer ya no acepta más solicitudes este mes. Vuelve a intentarlo el mes que viene.",
          });
          return;
        }
        setStatus({
          kind: "error",
          message: data.error === "invalid-body" ? "Revisa los datos." : "No se pudo enviar.",
        });
        return;
      }
      setStatus({ kind: "sent", total: data.total ?? preview.total });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }

  if (status.kind === "sent") {
    const showBookingCTA = config.suggestBooking && hasBooking;
    return (
      <div className="space-y-5 rounded-aesthetic-base border border-aesthetic-fg/15 p-6 text-center">
        <div className="font-aesthetic-display text-2xl">Solicitud enviada</div>
        <p className="text-sm text-aesthetic-fg/80">
          Total estimado: <strong>{euro(status.total)}</strong>. Te responderá pronto.
        </p>
        {showBookingCTA && (
          <div className="space-y-3 border-t border-aesthetic-fg/10 pt-5">
            <p className="text-sm text-aesthetic-fg/70">
              ¿Quieres que avancemos más rápido? Agenda una llamada de 15-30 min ahora.
            </p>
            <a
              href={`/${handle}/book`}
              className="inline-flex items-center justify-center rounded-aesthetic-base bg-aesthetic-accent px-4 py-2.5 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90"
            >
              Agendar llamada →
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-aesthetic-display text-xl">Servicios</h2>
        <ul className="space-y-2">
          {config.items.map((item) => {
            const sel = selections[item.id] ?? { selected: false, optionId: null };
            const isSelected = sel.selected;
            return (
              <li
                key={item.id}
                className={cn(
                  "rounded-aesthetic-base border p-4 transition",
                  isSelected
                    ? "border-aesthetic-accent bg-aesthetic-accent/5"
                    : "border-aesthetic-fg/15",
                )}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(item.id)}
                    disabled={!item.selectable}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-aesthetic-muted">
                        desde {euro(item.basePrice)}
                        {item.unit === "hour" ? " / hora" : item.unit === "month" ? " / mes" : ""}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-aesthetic-fg/75">{item.description}</p>
                    )}

                    {item.options.length > 0 && isSelected && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.options.map((opt) => {
                          const active = sel.optionId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => pickOption(item.id, opt.id)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs transition",
                                active
                                  ? "border-aesthetic-accent bg-aesthetic-accent text-aesthetic-accent-contrast"
                                  : "border-aesthetic-fg/20 text-aesthetic-fg/70 hover:border-aesthetic-fg/40",
                              )}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sticky bottom-4 rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-aesthetic-muted">Total estimado</span>
          <span className="font-aesthetic-display text-2xl">{euro(preview.total)}</span>
        </div>
      </section>

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
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Empresa (opcional)"
          maxLength={120}
          className="w-full rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-2.5 text-sm outline-none focus:border-aesthetic-accent"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Cuéntame más del proyecto (opcional)"
          rows={4}
          maxLength={2000}
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
          {status.kind === "submitting" ? "Enviando…" : "Enviar solicitud"}
        </button>
      </section>
    </form>
  );
}
