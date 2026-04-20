"use client";

import { cn } from "@/lib/utils";

export type SaveStatus =
  | { kind: "clean" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

/**
 * Small pill surfacing the autosave lifecycle. Lives in `dashboard/`
 * because both the editor and the settings tabs in /bookings and /leads
 * consume it — keeping it in one place means the visual grammar for
 * "still saving / saved / failed" stays identical across the app.
 */
export function SaveStatusPill({ status }: { status: SaveStatus }) {
  const base = "rounded-full px-2.5 py-1 text-xs font-medium";
  if (status.kind === "clean") {
    return <span className={cn(base, "bg-ink/5 text-ink/50")}>Al día</span>;
  }
  if (status.kind === "dirty") {
    return <span className={cn(base, "bg-mustard/20 text-mustard-600")}>Sin guardar</span>;
  }
  if (status.kind === "saving") {
    return <span className={cn(base, "bg-olive-100 text-olive-700")}>Guardando…</span>;
  }
  if (status.kind === "saved") {
    return <span className={cn(base, "bg-success/10 text-success")}>Guardado</span>;
  }
  return <span className={cn(base, "bg-danger/10 text-danger")}>{status.message}</span>;
}
