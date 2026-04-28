"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * "Pasar a Pro" CTA. Posts to /api/stripe/checkout, takes the hosted
 * URL Stripe gives us, and full-page-redirects there. Disabled while
 * the request is in flight to avoid double-clicks creating multiple
 * Checkout sessions in Stripe.
 */
export function UpgradeProButton({
  className,
  label = "Pasar a Pro · 7 €/mes",
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        if (data.error === "already-pro") {
          // Stale UI — refresh so /settings re-renders the Pro state.
          window.location.reload();
          return;
        }
        setError(
          data.error === "stripe-not-configured"
            ? "El checkout no está configurado todavía."
            : "No se pudo iniciar el pago. Intenta de nuevo.",
        );
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={cn(
          "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:cursor-progress disabled:opacity-70",
          className,
        )}
      >
        {loading ? "Abriendo Stripe…" : label}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
