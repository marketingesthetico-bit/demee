"use client";

import { useMemo, useState } from "react";

import type { CalculatedBudget } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

type LeadStatus = "new" | "viewed" | "replied" | "closed";

interface ClientLead {
  id: string;
  handle: string;
  status: LeadStatus;
  guest: {
    name: string;
    email: string;
    company: string | null;
    message: string | null;
  };
  budget: CalculatedBudget;
  createdAt: string | null;
}

interface Props {
  initialLeads: ClientLead[];
}

const STATUS_FILTER_OPTIONS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "new", label: "Nuevos" },
  { value: "viewed", label: "Vistos" },
  { value: "replied", label: "Respondidos" },
  { value: "closed", label: "Cerrados" },
];

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nuevo",
  viewed: "Visto",
  replied: "Respondido",
  closed: "Cerrado",
};

const STATUS_DOT: Record<LeadStatus, string> = {
  new: "bg-mustard",
  viewed: "bg-olive-400",
  replied: "bg-success",
  closed: "bg-ink/30",
};

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

export function LeadsList({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLeads[0]?.id ?? null,
  );

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [filter, leads],
  );

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  async function updateStatus(id: string, status: LeadStatus) {
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("update failed");
    } catch (err) {
      console.error(err);
      setLeads(previous);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
        <p className="text-sm text-ink/60">
          Todavía no te ha llegado ninguna solicitud.
        </p>
        <p className="mt-2 text-xs text-ink/50">
          Activa el presupuestador en{" "}
          <a href="/edit" className="text-olive-700 hover:underline">
            /edit
          </a>{" "}
          y comparte tu página para recibir la primera.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          const count =
            opt.value === "all"
              ? leads.length
              : leads.filter((l) => l.status === opt.value).length;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition",
                active
                  ? "bg-ink text-paper"
                  : "bg-white text-ink/70 hover:bg-ink/5",
              )}
            >
              {opt.label}{" "}
              <span className={cn("text-xs", active ? "opacity-70" : "opacity-50")}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <ul className="space-y-2">
          {filtered.map((lead) => {
            const active = lead.id === selectedId;
            return (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(lead.id);
                    if (lead.status === "new") void updateStatus(lead.id, "viewed");
                  }}
                  className={cn(
                    "block w-full rounded-md border bg-white p-4 text-left transition",
                    active
                      ? "border-olive-500 ring-2 ring-olive-500/20"
                      : "border-ink/10 hover:border-ink/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="truncate font-medium text-ink">{lead.guest.name}</div>
                      <div className="truncate text-xs text-ink/50">{lead.guest.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-ink">{euro(lead.budget.total)}</div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink/50">
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[lead.status])} />
                        {STATUS_LABEL[lead.status]}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-ink/40">{formatDate(lead.createdAt)}</div>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-md border border-dashed border-ink/15 bg-white/50 px-4 py-8 text-center text-sm text-ink/50">
              Nada con este filtro.
            </li>
          )}
        </ul>

        <section className="rounded-lg border border-ink/10 bg-white p-6">
          {selected ? (
            <LeadDetail lead={selected} onStatusChange={(s) => void updateStatus(selected.id, s)} />
          ) : (
            <p className="text-sm text-ink/50">Selecciona un lead a la izquierda.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function LeadDetail({
  lead,
  onStatusChange,
}: {
  lead: ClientLead;
  onStatusChange: (status: LeadStatus) => void;
}) {
  const STATUSES: LeadStatus[] = ["new", "viewed", "replied", "closed"];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-display text-2xl text-ink">{lead.guest.name}</h2>
          <a
            href={`mailto:${lead.guest.email}`}
            className="text-sm text-olive-700 hover:underline"
          >
            {lead.guest.email}
          </a>
          {lead.guest.company && (
            <p className="text-sm text-ink/60">{lead.guest.company}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-display text-3xl text-ink">{euro(lead.budget.total)}</div>
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
            className="rounded-md border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-olive-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </header>

      {lead.guest.message && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-ink/50">Mensaje</h3>
          <p className="whitespace-pre-line rounded-md bg-paper/60 px-3 py-2 text-sm text-ink/80">
            {lead.guest.message}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Presupuesto solicitado
        </h3>
        <table className="w-full text-sm">
          <tbody>
            {lead.budget.lines.map((line) => (
              <tr key={line.itemId} className="border-b border-ink/5 last:border-b-0">
                <td className="py-2 pr-3">
                  <div className="text-ink">{line.name}</div>
                  {line.optionLabel && (
                    <div className="text-xs text-ink/50">{line.optionLabel}</div>
                  )}
                </td>
                <td className="py-2 text-right text-ink">{euro(line.total)}</td>
              </tr>
            ))}
            <tr>
              <td className="pt-3 font-medium text-ink">Total</td>
              <td className="pt-3 text-right font-medium text-ink">
                {euro(lead.budget.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 pt-2">
        <a
          href={`mailto:${lead.guest.email}?subject=Re:%20Presupuesto%20Demee`}
          className="flex-1 rounded-md bg-ink px-4 py-2.5 text-center text-sm font-medium text-paper hover:bg-ink/90"
        >
          Responder por email
        </a>
      </div>
    </div>
  );
}
