import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Shown at the top of /leads and /bookings for Free-tier users so they
 * always know how close they are to the monthly cap. Pro users (`limit
 * === null`) see nothing — there's no cap to surface.
 *
 * Three visual states match the urgency:
 *   - safe         → first 80% of the cap, neutral grey
 *   - approaching  → 80–99% used, mustard
 *   - exhausted    → at or over the cap, danger red
 */
interface Props {
  kind: "leads" | "bookings";
  used: number;
  limit: number | null;
  /** Display name for the over-cap CTA, e.g. "el plan Pro". */
  upgradeHref?: string;
}

const LABELS: Record<Props["kind"], string> = {
  leads: "presupuestos este mes",
  bookings: "reuniones este mes",
};

export function PlanUsageBadge({
  kind,
  used,
  limit,
  upgradeHref = "/settings",
}: Props) {
  if (limit === null) return null; // Pro / Studio: nothing to surface.

  const remaining = Math.max(0, limit - used);
  const ratio = used / limit;
  const tone =
    ratio >= 1
      ? "exhausted"
      : ratio >= 0.8
        ? "approaching"
        : "safe";

  const toneClass = {
    safe: "border-ink/10 bg-white text-ink/70",
    approaching: "border-mustard/40 bg-mustard/10 text-mustard-700",
    exhausted: "border-danger/30 bg-danger/5 text-danger",
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-md border px-4 py-2.5 text-sm",
        toneClass,
      )}
    >
      <span className="font-medium">
        {used} / {limit} {LABELS[kind]}
      </span>
      {tone !== "exhausted" ? (
        <span className="text-xs opacity-80">
          {remaining === 0
            ? "Has llegado al máximo del plan Free."
            : `Te quedan ${remaining} en el plan Free.`}
        </span>
      ) : (
        <span className="text-xs">
          {kind === "leads"
            ? "El formulario de presupuesto se reabre el 1 del mes que viene."
            : "La agenda se reabre el 1 del mes que viene."}
        </span>
      )}
      <Link
        href={upgradeHref}
        className={cn(
          "ml-auto rounded-md px-2.5 py-1 text-xs font-medium transition",
          tone === "exhausted"
            ? "bg-danger text-white hover:opacity-90"
            : "border border-current/30 hover:bg-current/5",
        )}
      >
        {tone === "exhausted" ? "Pasa a Pro" : "Quitar el límite"}
      </Link>
    </div>
  );
}
