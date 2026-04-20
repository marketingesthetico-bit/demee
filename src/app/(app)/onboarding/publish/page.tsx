"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PublicPageBody } from "@/components/public/PublicPageBody";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { getAestheticConfig } from "@/lib/aesthetics";
import { getIndustryConfig } from "@/lib/industries";
import { clearDraft, readDraft, writeDraft, type OnboardingDraft } from "@/lib/onboarding/draft";
import { buildPreviewProfile } from "@/lib/profile/preview";
import { cn } from "@/lib/utils";

type HandleState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; message: string };

const REASON_COPY: Record<string, string> = {
  "too-short": "Mínimo 3 caracteres.",
  "too-long": "Máximo 30 caracteres.",
  "invalid-chars": "Solo letras, números y guiones.",
  "starts-or-ends-with-hyphen": "No puede empezar ni terminar en guion.",
  reserved: "Ese nombre está reservado.",
  taken: "Ese handle ya lo tiene otro freelancer.",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export default function PublishStepPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleState, setHandleState] = useState<HandleState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const checkSeq = useRef(0);

  useEffect(() => {
    const d = readDraft();
    if (!d.industry || !d.aesthetic) {
      router.replace("/onboarding");
      return;
    }
    setDraft(d);
    setName(d.name ?? "");
    setHandle(d.handle ?? slugify(d.name ?? ""));
  }, [router]);

  const trimmedHandle = handle.trim().toLowerCase();

  useEffect(() => {
    if (trimmedHandle.length < 3) {
      setHandleState({ status: "idle" });
      return;
    }
    setHandleState({ status: "checking" });
    const seq = ++checkSeq.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/handles/check?handle=${encodeURIComponent(trimmedHandle)}`);
        const data = (await res.json()) as
          | { available: true }
          | { available: false; reason: string };
        if (seq !== checkSeq.current) return;
        if (data.available) setHandleState({ status: "available" });
        else
          setHandleState({
            status: "unavailable",
            message: REASON_COPY[data.reason] ?? "No podemos usar ese handle.",
          });
      } catch (err) {
        if (seq !== checkSeq.current) return;
        console.error(err);
        setHandleState({ status: "unavailable", message: "Error comprobando disponibilidad." });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [trimmedHandle]);

  const industryConfig = draft?.industry ? getIndustryConfig(draft.industry) : null;
  const aestheticConfig = draft?.aesthetic ? getAestheticConfig(draft.aesthetic) : null;

  const previewProfile = useMemo(
    () =>
      draft
        ? buildPreviewProfile({
            draft,
            name: name.trim(),
            handle: trimmedHandle,
            email: null,
            photoURL: null,
          })
        : null,
    [draft, name, trimmedHandle],
  );

  const canSubmit = useMemo(
    () => handleState.status === "available" && name.trim().length > 0 && !submitting,
    [handleState, name, submitting],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !draft) return;
    writeDraft({ name: name.trim(), handle: trimmedHandle });

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: trimmedHandle,
          displayName: name.trim(),
          industry: draft.industry,
          aesthetic: draft.aesthetic,
          imported: draft.imported,
        }),
      });
      if (res.ok) {
        clearDraft();
        router.replace(`/${trimmedHandle}`);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; handle?: string };
      if (body.error === "already-onboarded" && body.handle) {
        clearDraft();
        router.replace(`/${body.handle}`);
        return;
      }
      if (body.error === "taken") {
        setHandleState({ status: "unavailable", message: REASON_COPY.taken! });
      } else {
        setServerError("No pudimos crear la cuenta. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setServerError("Error de red. Comprueba tu conexión.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!draft || !industryConfig || !aestheticConfig) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Último paso: tu URL.</h1>
        <p className="text-ink/70">
          Esta es la vista previa con el estilo <strong>{aestheticConfig.label}</strong>. Reservamos
          tu handle y la publicamos.
        </p>
      </header>

      {previewProfile && (
        <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-ink/10 bg-paper px-4 py-2 text-xs">
            <span className="font-mono text-ink/60">demee.app/{previewProfile.handle}</span>
            <span className="text-ink/50">Vista previa</span>
          </div>
          <ThemeProvider
            aesthetic={previewProfile.aesthetic}
            className="bg-aesthetic-bg font-aesthetic-body text-aesthetic-fg"
          >
            <div className="mx-auto max-w-2xl px-6 py-10 text-sm sm:px-8">
              <PublicPageBody profile={previewProfile} />
            </div>
          </ThemeProvider>
        </section>
      )}

      <div className="space-y-6 rounded-lg border border-ink/10 bg-white p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">¿Cómo te llamas?</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => !handle && setHandle(slugify(name))}
            placeholder="María García"
            required
            maxLength={80}
            autoComplete="name"
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <div className="space-y-2">
          <label htmlFor="handle" className="block text-sm font-medium text-ink">
            Tu URL en Demee
          </label>
          <div
            className={cn(
              "flex items-stretch overflow-hidden rounded-md border bg-white shadow-sm",
              "focus-within:border-olive-500 focus-within:ring-2 focus-within:ring-olive-500/20",
              "border-ink/15",
            )}
          >
            <span className="flex items-center bg-paper px-3 text-sm text-ink/60">demee.app/</span>
            <input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(slugify(e.target.value))}
              placeholder="tunombre"
              required
              minLength={3}
              maxLength={30}
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-white px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <HandleStateHint state={handleState} />
        </div>
      </div>

      {serverError && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding/import")}
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Atrás
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Publicando…" : "Publicar mi página"}
        </button>
      </div>
    </form>
  );
}

function HandleStateHint({ state }: { state: HandleState }) {
  if (state.status === "idle") {
    return <p className="text-xs text-ink/50">Entre 3 y 30 caracteres. Letras, números y guiones.</p>;
  }
  if (state.status === "checking") {
    return <p className="text-xs text-ink/60">Comprobando disponibilidad…</p>;
  }
  if (state.status === "available") {
    return <p className="text-xs text-success">Disponible. Es tuyo.</p>;
  }
  return <p className="text-xs text-danger">{state.message}</p>;
}
