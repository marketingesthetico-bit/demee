"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getIndustryConfig } from "@/lib/industries";
import type { SupportedIndustry } from "@/lib/industries";
import {
  readDraft,
  writeDraft,
  type ImportedProfile,
} from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

type ImportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; summary: string }
  | { kind: "error"; message: string };

const ERROR_COPY: Record<string, string> = {
  "source-too-short": "Añade más texto — necesitamos al menos 40 caracteres.",
  "source-too-long": "El texto es demasiado largo. Recórtalo a lo esencial.",
  "provider-error": "La IA no responde ahora mismo. Intenta de nuevo en un minuto.",
  "invalid-json": "La IA devolvió algo raro. Intenta con otro texto.",
  "schema-mismatch": "No pudimos estructurar la información. Rellena a mano o prueba con otro texto.",
  "empty-response": "La IA no encontró nada útil. Añade más detalle.",
  "invalid-body": "El texto no es válido.",
};

export default function ImportStepPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<ReturnType<typeof getIndustryConfig>>(null);
  const [industrySlug, setIndustrySlug] = useState<SupportedIndustry | null>(null);
  const [source, setSource] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [servicesPreview, setServicesPreview] = useState<ImportedProfile["services"]>(undefined);
  const [portfolioPreview, setPortfolioPreview] = useState<ImportedProfile["portfolio"]>(undefined);
  const [socialPreview, setSocialPreview] = useState<ImportedProfile["social"]>(undefined);
  const [status, setStatus] = useState<ImportStatus>({ kind: "idle" });

  useEffect(() => {
    const draft = readDraft();
    if (!draft.industry || !draft.aesthetic) {
      router.replace("/onboarding");
      return;
    }
    setIndustry(getIndustryConfig(draft.industry));
    setIndustrySlug(draft.industry);
    setHeadline(draft.imported?.headline ?? "");
    setBio(draft.imported?.bio ?? "");
    setSkillsText(draft.imported?.skills?.join(", ") ?? "");
    setServicesPreview(draft.imported?.services);
    setPortfolioPreview(draft.imported?.portfolio);
    setSocialPreview(draft.imported?.social);
  }, [router]);

  const skills = useMemo(
    () =>
      skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
    [skillsText],
  );

  const composedImported = useMemo<ImportedProfile>(
    () => ({
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      services: servicesPreview,
      portfolio: portfolioPreview,
      social: socialPreview,
    }),
    [headline, bio, skills, servicesPreview, portfolioPreview, socialPreview],
  );

  async function runAI() {
    if (!industrySlug) return;
    const text = source.trim();
    if (text.length < 40) {
      setStatus({ kind: "error", message: ERROR_COPY["source-too-short"]! });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/ai/import-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: text, industry: industrySlug, language: "Spanish" }),
      });
      const data = (await res.json()) as
        | { ok: true; imported: ImportedProfile }
        | { error: string };
      if (!res.ok || "error" in data) {
        const code = "error" in data ? data.error : "server-error";
        setStatus({ kind: "error", message: ERROR_COPY[code] ?? "Algo ha fallado. Reintenta." });
        return;
      }
      const imp = data.imported;
      setHeadline(imp.headline ?? "");
      setBio(imp.bio ?? "");
      setSkillsText((imp.skills ?? []).join(", "));
      setServicesPreview(imp.services);
      setPortfolioPreview(imp.portfolio);
      setSocialPreview(imp.social);
      const parts: string[] = [];
      if (imp.bio) parts.push("bio");
      if (imp.skills?.length) parts.push(`${imp.skills.length} habilidades`);
      if (imp.services?.length) parts.push(`${imp.services.length} servicios`);
      if (imp.portfolio?.length) parts.push(`${imp.portfolio.length} proyectos`);
      setStatus({
        kind: "success",
        summary: parts.length > 0 ? `Extraído: ${parts.join(", ")}. Revísalo abajo.` : "Extraído. Revísalo abajo.",
      });
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Error de red. Inténtalo de nuevo." });
    }
  }

  function save() {
    writeDraft({ imported: composedImported });
  }

  function next() {
    save();
    router.push("/onboarding/publish");
  }

  function skip() {
    router.push("/onboarding/publish");
  }

  if (!industry) return null;

  const sourceTooShort = source.trim().length < 40;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Cuéntanos de ti.</h1>
        <p className="text-ink/70">
          Pega tu bio de LinkedIn, el contenido de tu web personal o tu CV. La IA lo estructura en
          segundos. También puedes rellenar a mano o saltar este paso.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-ink">Importación con IA</h2>
          <span className="text-xs text-ink/50">gpt-4o-mini · ~$0.0003 por intento</span>
        </div>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={`Pega aquí el contenido de tu LinkedIn, web personal o CV.\n\nEjemplo: "${industry.examples.headline} — Trabajo con clientes desde 2019, he colaborado con marcas como X, Y y Z..."`}
          rows={8}
          maxLength={12000}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink/50">
            {source.length} / 12.000 caracteres
          </span>
          <button
            type="button"
            onClick={runAI}
            disabled={sourceTooShort || status.kind === "loading"}
            className="inline-flex items-center gap-2 rounded-md bg-olive-500 px-4 py-2 text-sm font-medium text-paper hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.kind === "loading" ? "Procesando…" : "✨ Importar con IA"}
          </button>
        </div>
        {status.kind === "success" && (
          <p className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
            {status.summary}
          </p>
        )}
        {status.kind === "error" && (
          <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {status.message}
          </p>
        )}
      </section>

      <section className="space-y-6 rounded-lg border border-ink/10 bg-white p-6">
        <h2 className="font-medium text-ink">Revisa y ajusta</h2>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Titular profesional</span>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={industry.examples.headline}
            maxLength={160}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Sobre ti</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="2-4 párrafos sobre quién eres, con qué trabajas y qué te diferencia."
            rows={6}
            maxLength={800}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Habilidades / servicios</span>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder={industry.examples.skills.join(", ")}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
          <span className="text-xs text-ink/50">Sepáralos por comas. Máx. 10.</span>
        </label>

        {servicesPreview && servicesPreview.length > 0 && (
          <ExtractedPreview
            label={`${servicesPreview.length} servicios detectados`}
            items={servicesPreview.map((s) => s.name)}
            onClear={() => setServicesPreview(undefined)}
          />
        )}
        {portfolioPreview && portfolioPreview.length > 0 && (
          <ExtractedPreview
            label={`${portfolioPreview.length} proyectos de portfolio detectados`}
            items={portfolioPreview.map((p) => p.title)}
            onClear={() => setPortfolioPreview(undefined)}
          />
        )}
        {socialPreview && (
          <ExtractedPreview
            label="Redes detectadas"
            items={Object.entries(socialPreview)
              .filter((entry): entry is [string, string] => Boolean(entry[1]))
              .map(([k]) => k)}
            onClear={() => setSocialPreview(undefined)}
          />
        )}
      </section>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding/aesthetic")}
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Atrás
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={skip}
            className="rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
          >
            Saltar paso
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtractedPreview({
  label,
  items,
  onClear,
}: {
  label: string;
  items: string[];
  onClear: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2 rounded-md border border-ink/10 bg-paper/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</span>
        <button
          type="button"
          onClick={onClear}
          className={cn("text-xs text-ink/50 underline-offset-2 hover:text-ink hover:underline")}
        >
          Descartar
        </button>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li key={item} className="rounded bg-white px-2 py-0.5 text-xs text-ink/70">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
