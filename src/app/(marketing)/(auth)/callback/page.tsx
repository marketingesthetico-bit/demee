"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  completeMagicLinkSignIn,
  getStoredEmailForSignIn,
  isMagicLinkUrl,
  mintServerSession,
} from "@/lib/firebase/auth";

type State =
  | { kind: "loading" }
  | { kind: "ask-email" }
  | { kind: "error"; message: string };

export default function CallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [email, setEmail] = useState("");

  const finish = useCallback(
    async (emailToUse: string, url: string) => {
      try {
        const credential = await completeMagicLinkSignIn(emailToUse, url);
        const idToken = await credential.user.getIdToken();
        await mintServerSession(idToken);
        router.replace("/dashboard");
      } catch (err) {
        console.error(err);
        setState({
          kind: "error",
          message:
            "No pudimos completar el inicio. El enlace puede haber caducado o el email no coincide.",
        });
      }
    },
    [router],
  );

  useEffect(() => {
    const url = window.location.href;
    if (!isMagicLinkUrl(url)) {
      setState({ kind: "error", message: "Este enlace no es válido o ha caducado." });
      return;
    }
    const storedEmail = getStoredEmailForSignIn();
    if (storedEmail) {
      void finish(storedEmail, url);
    } else {
      setState({ kind: "ask-email" });
    }
  }, [finish]);

  if (state.kind === "loading") {
    return <p className="text-sm text-ink/60">Completando inicio de sesión…</p>;
  }

  if (state.kind === "error") {
    return (
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-display text-2xl text-ink">No ha funcionado</h1>
        <p className="text-sm text-ink/70">{state.message}</p>
        <a
          href="/sign-in"
          className="inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Volver a intentarlo
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void finish(email, window.location.href);
      }}
      className="w-full max-w-md space-y-4"
    >
      <header className="space-y-2 text-center">
        <h1 className="font-display text-2xl text-ink">Confirma tu email</h1>
        <p className="text-sm text-ink/70">
          Abriste el enlace en un dispositivo distinto al que pediste. Introduce el email al que lo enviamos.
        </p>
      </header>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        autoComplete="email"
        className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-ink px-4 py-3 text-sm font-medium text-paper hover:bg-ink/90"
      >
        Confirmar y entrar
      </button>
    </form>
  );
}
