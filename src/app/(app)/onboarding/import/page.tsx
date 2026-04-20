"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getIndustryConfig } from "@/lib/industries";
import type { SupportedIndustry } from "@/lib/industries";
import {
  readDraft,
  writeDraft,
  type ImportedProfile,
} from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

type ImportMode = "text" | "url" | "pdf";

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
  "schema-mismatch": "No pudimos estructurar la información. Rellena a mano o prueba otra fuente.",
  "empty-response": "La IA no encontró nada útil. Añade más detalle.",
  "invalid-body": "El input no es válido.",
  "invalid-url": "La URL no parece válida.",
  "blocked-host": "Esa URL no es accesible desde Demee.",
  "linkedin-blocked":
    "LinkedIn bloquea la extracción automática. Copia el texto de tu perfil y pégalo en la pestaña Texto.",
  timeout: "El sitio tarda demasiado en responder. Prueba con otra fuente.",
  "too-large": "El archivo supera el tamaño permitido.",
  "non-html": "Esa URL no devuelve HTML. Prueba con otra.",
  "not-found": "La URL no existe (404).",
  "bot-blocked": "El sitio bloquea peticiones automáticas. Copia el texto y pégalo en Texto.",
  "fetch-failed": "No pudimos leer la URL. Verifica que está pública.",
  "empty-text": "La página no tiene suficiente texto. Prueba con otra.",
  "not-pdf": "Solo aceptamos archivos PDF.",
  "no-file": "Selecciona un PDF.",
};

function friendly(code: string): string {
  return ERROR_COPY[code] ?? "Algo ha fallado. Inténtalo de nuevo.";
}

export default function ImportStepPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<ReturnType<typeof getIndustryConfig>>(null);
  const [industrySlug, setIndustrySlug] = useState<SupportedIndustry | null>(null);

  const [mode, setMode] = useState<ImportMode>("text");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  function applyImported(imp: ImportedProfile) {
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
      summary:
        parts.length > 0 ? `Extraído: ${parts.join(", ")}. Revísalo abajo.` : "Extraído. Revísalo abajo.",
    });
  }

  async function runText() {
    if (!industrySlug) return;
    const text = source.trim();
    if (text.length < 40) {
      setStatus({ kind: "error", message: friendly("source-too-short") });
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
        setStatus({ kind: "error", message: friendly("error" in data ? data.error : "server-error") });
        return;
      }
      applyImported(data.imported);
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Error de red. Inténtalo de nuevo." });
    }
  }

  async function runUrl() {
    if (!industrySlug) return;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setStatus({ kind: "error", message: friendly("invalid-url") });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/ai/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl, industry: industrySlug, language: "Spanish" }),
      });
      const data = (await res.json()) as
        | { ok: true; imported: ImportedProfile }
        | { error: string };
      if (!res.ok || "error" in data) {
        setStatus({ kind: "error", message: friendly("error" in data ? data.error : "server-error") });
        return;
      }
      applyImported(data.imported);
    } catch (err) {
      console.error(err);
      setStatus({ kind: "error", message: "Error de red. Inténtalo de nuevo." });
    }
  }

  async function runPdf() {
    if (!industrySlug) return;
    if (!selectedFile) {
      setStatus({ kind: "error", message: friendly("no-file") });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("industry", industrySlug);
      form.append("language", "Spanish");
      const res = await fetch("/api/ai/import-pdf", { method: "POST", body: form });
      const data = (await res.json()) as
        | { ok: true; imported: ImportedProfile }
        | { error: string };
      if (!res.ok || "error" in data) {
        setStatus({ kind: "error", message: friendly("error" in data ? data.error : "server-error") });
        return;
      }
      applyImported(data.imported);
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

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Cuéntanos de ti.</h1>
        <p className="text-ink/70">
          Pega tu bio de LinkedIn, importa tu web personal o tu perfil de GitHub, o sube tu CV en
          PDF. La IA lo estructura en segundos. También puedes rellenar a mano o saltar este paso.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-ink">Importar con IA</h2>
          <span className="text-xs text-ink/50">gpt-4o-mini · ~$0.0003 por intento</span>
        </div>

        <div className="flex gap-2 border-b border-ink/10">
          <TabButton active={mode === "text"} onClick={() => setMode("text")}>
            Texto
          </TabButton>
          <TabButton active={mode === "url"} onClick={() => setMode("url")}>
            URL
          </TabButton>
          <TabButton active={mode === "pdf"} onClick={() => setMode("pdf")}>
            PDF
          </TabButton>
        </div>

        {mode === "text" && (
          <div className="space-y-3 pt-2">
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={`Pega aquí el contenido de tu LinkedIn, web personal o CV.\n\nEjemplo: "${industry.examples.headline} — Trabajo con clientes desde 2019, he colaborado con marcas como X, Y y Z..."`}
              rows={8}
              maxLength={12000}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/50">{source.length} / 12.000 caracteres</span>
              <button
                type="button"
                onClick={runText}
                disabled={source.trim().length < 40 || status.kind === "loading"}
                className="inline-flex items-center gap-2 rounded-md bg-olive-500 px-4 py-2 text-sm font-medium text-paper hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status.kind === "loading" ? "Procesando…" : "✨ Importar con IA"}
              </button>
            </div>
          </div>
        )}

        {mode === "url" && (
          <div className="space-y-3 pt-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tuweb.com · https://github.com/tuusuario"
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
            />
            <p className="text-xs text-ink/50">
              ✓ Web personal · ✓ Perfil de GitHub (usa la API). ✗ LinkedIn bloquea la extracción
              automática; copia y pega el texto en la pestaña Texto.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={runUrl}
                disabled={!url.trim() || status.kind === "loading"}
                className="inline-flex items-center gap-2 rounded-md bg-olive-500 px-4 py-2 text-sm font-medium text-paper hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status.kind === "loading" ? "Procesando…" : "✨ Importar de la URL"}
              </button>
            </div>
          </div>
        )}

        {mode === "pdf" && (
          <div className="space-y-3 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink/20 p-8 text-center hover:border-olive-500 hover:bg-olive-50"
            >
              <span className="text-3xl">📄</span>
              <span className="text-sm font-medium text-ink">
                {selectedFile ? selectedFile.name : "Haz clic o arrastra tu CV en PDF"}
              </span>
              <span className="text-xs text-ink/50">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                  : "Máx. 4 MB · se procesan las primeras 20 páginas"}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={runPdf}
                disabled={!selectedFile || status.kind === "loading"}
                className="inline-flex items-center gap-2 rounded-md bg-olive-500 px-4 py-2 text-sm font-medium text-paper hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status.kind === "loading" ? "Procesando…" : "✨ Importar del PDF"}
              </button>
            </div>
          </div>
        )}

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
            label={`${portfolioPreview.length} proyectos detectados`}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
        active ? "border-olive-500 text-ink" : "border-transparent text-ink/50 hover:text-ink",
      )}
    >
      {children}
    </button>
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
