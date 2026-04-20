"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface GoogleConnectionStatus {
  connected: boolean;
  accountEmail: string | null;
  connectedAt: string | null;
  configured: boolean;
}

interface Props {
  initial: GoogleConnectionStatus;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Drop-in connect/disconnect card. Server-rendered initial status, with
 * client-side disconnect mutation. After reconnect (redirect round-trip)
 * the page reloads and the card reflects the new status.
 */
export function GoogleCalendarConnect({ initial }: Props) {
  const [status, setStatus] = useState(initial);
  const [disconnecting, setDisconnecting] = useState(false);
  const [flash, setFlash] = useState<null | "connected" | "error" | "expired" | "denied" | "not-configured">(null);

  // Read the ?google=... flash set by the callback and clean it out of the URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const g = url.searchParams.get("google");
    if (!g) return;
    if (g === "connected" || g === "error" || g === "expired" || g === "denied" || g === "not-configured") {
      setFlash(g);
    }
    url.searchParams.delete("google");
    window.history.replaceState({}, "", url.toString());
  }, []);

  async function disconnect() {
    if (!confirm("¿Desconectar Google Calendar? Las reuniones ya creadas se mantienen, pero las futuras no se sincronizarán.")) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
      if (!res.ok) throw new Error();
      setStatus({ connected: false, accountEmail: null, connectedAt: null, configured: status.configured });
      setFlash(null);
    } catch {
      alert("No se pudo desconectar. Inténtalo de nuevo.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (!status.configured) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-ink/10 bg-paper/40 p-3">
        <span className="text-2xl" aria-hidden="true">🔒</span>
        <div className="space-y-1">
          <div className="text-sm font-medium text-ink">Google Calendar no está configurado aún</div>
          <p className="text-xs text-ink/60">
            El administrador de Demee debe añadir las credenciales de OAuth. Los bookings se guardan
            igualmente; cuando esté activo, empezarán a aparecer en tu calendario.
          </p>
        </div>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="space-y-2 rounded-md border border-success/30 bg-success/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              Google Calendar conectado
            </div>
            {status.accountEmail && (
              <div className="font-mono text-xs text-ink/70">{status.accountEmail}</div>
            )}
            {status.connectedAt && (
              <div className="text-[11px] text-ink/50">
                Desde el {formatDate(status.connectedAt)}
              </div>
            )}
            <p className="pt-1 text-xs text-ink/70">
              Cada nueva reserva se crea como evento en tu Google Calendar con enlace de Meet
              (si la reunión es online) e invita al cliente por email.
            </p>
          </div>
          <button
            type="button"
            onClick={disconnect}
            disabled={disconnecting}
            className="shrink-0 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/70 hover:border-ink/30 hover:text-ink disabled:opacity-50"
          >
            {disconnecting ? "Desconectando…" : "Desconectar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-ink/10 bg-white p-4">
      <div className="flex items-start gap-3">
        <GoogleIcon className="mt-0.5 h-7 w-7" />
        <div className="space-y-1">
          <div className="text-sm font-medium text-ink">
            Conecta tu Google Calendar
          </div>
          <p className="text-xs text-ink/60">
            Una sola vez. Cada reserva desde <code className="font-mono">/book</code> crea el evento
            en tu calendario, envía la invitación al cliente y añade un enlace de Google Meet
            automáticamente cuando la reunión es online.
          </p>
        </div>
      </div>

      {flash && <FlashMessage flash={flash} />}

      <a
        href="/api/auth/google/connect"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper",
          "hover:bg-ink/90",
        )}
      >
        <GoogleIcon className="h-4 w-4 bg-white/10 rounded-full p-0.5" />
        Conectar con Google Calendar
      </a>

      <p className="text-[11px] text-ink/50">
        Solo pedimos permiso para crear eventos en tu calendario. Puedes desconectar cuando quieras.
      </p>
    </div>
  );
}

function FlashMessage({
  flash,
}: {
  flash: "connected" | "error" | "expired" | "denied" | "not-configured";
}) {
  if (flash === "connected") {
    return (
      <p className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-xs text-success">
        ¡Conectado! Si sigues viendo el botón, recarga la página.
      </p>
    );
  }
  if (flash === "denied") {
    return (
      <p className="rounded-md border border-mustard/30 bg-mustard/10 px-3 py-2 text-xs text-ink/70">
        No nos diste permiso. Inténtalo de nuevo para conectar.
      </p>
    );
  }
  if (flash === "expired") {
    return (
      <p className="rounded-md border border-mustard/30 bg-mustard/10 px-3 py-2 text-xs text-ink/70">
        La solicitud expiró. Inicia de nuevo la conexión.
      </p>
    );
  }
  return (
    <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
      Algo ha fallado en Google. Inténtalo en un minuto.
    </p>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.67-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
