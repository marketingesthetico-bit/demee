"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Opens the Stripe Billing Portal in the same tab so the user can
 * update their payment method, download invoices, or cancel. Stripe
 * sends them back to /settings via the configured return_url.
 */
export function ManageSubscriptionButton({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError("No se pudo abrir el portal. Intenta de nuevo.");
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
        onClick={open}
        disabled={loading}
        className={cn(
          "rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30 disabled:cursor-progress disabled:opacity-70",
          className,
        )}
      >
        {loading ? "Abriendo portal…" : "Gestionar suscripción"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
