"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  mintServerSession,
  sendMagicLink,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

type Mode = "sign-in" | "sign-up";

interface Props {
  mode: Mode;
}

const COPY: Record<Mode, { title: string; subtitle: string; switchPrompt: string; switchHref: string; switchCta: string }> = {
  "sign-in": {
    title: "Entrar en Demee",
    subtitle: "Usa tu Google o te mandamos un enlace mágico al email.",
    switchPrompt: "¿Todavía sin cuenta?",
    switchHref: "/sign-up",
    switchCta: "Crear cuenta",
  },
  "sign-up": {
    title: "Crear cuenta en Demee",
    subtitle: "60 segundos y tu mini-web está viva.",
    switchPrompt: "¿Ya tienes cuenta?",
    switchHref: "/sign-in",
    switchCta: "Entrar",
  },
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      const credential = await signInWithGoogle();
      const idToken = await credential.user.getIdToken();
      await mintServerSession(idToken);
      router.replace(next);
    } catch (err) {
      console.error(err);
      setError("No se pudo completar el inicio con Google. Inténtalo de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduce un email válido.");
      return;
    }
    setLoading("email");
    try {
      await sendMagicLink(email);
      setLinkSent(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el enlace. Inténtalo de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl text-ink">{copy.title}</h1>
        <p className="text-sm text-ink/70">{copy.subtitle}</p>
      </header>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-medium text-ink shadow-sm transition",
          "hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <GoogleIcon className="h-5 w-5" />
        {loading === "google" ? "Conectando…" : "Continuar con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink/40">
        <span className="h-px flex-1 bg-ink/10" />
        o
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      {linkSent ? (
        <div className="rounded-md border border-olive-200 bg-olive-50 px-4 py-4 text-sm text-olive-700">
          Enlace enviado a <strong>{email}</strong>. Revisa la bandeja (y spam).
          Al hacer clic volverás aquí automáticamente.
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full rounded-md bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "email" ? "Enviando…" : "Enviarme un enlace mágico"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <p className="text-center text-sm text-ink/60">
        {copy.switchPrompt}{" "}
        <a href={copy.switchHref} className="font-medium text-olive-600 underline-offset-4 hover:underline">
          {copy.switchCta}
        </a>
      </p>
    </div>
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
