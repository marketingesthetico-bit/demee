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

type SourceReport = {
  label: string;
  status: "ok" | "skipped" | "failed";
  chars: number;
  error?: string;
};

type ImportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; summary: string; sources: SourceReport[] }
  | { kind: "error"; message: string; sources?: SourceReport[] };

const ERROR_COPY: Record<string, string> = {
  "source-too-short": "Los contenidos juntos no llegan a 40 caracteres útiles.",
  "source-too-long": "Los contenidos son demasiado largos. Recórtalos.",
  "no-sources": "Añade al menos una fuente: texto, URL o PDF.",
  "provider-error": "La IA no responde ahora mismo. Intenta de nuevo en un minuto.",
  "invalid-json": "La IA devolvió algo raro. Prueba con otros contenidos.",
  "schema-mismatch": "No pudimos estructurar la información. Ajusta a mano.",
  "empty-response": "La IA no encontró nada útil. Añade más detalle.",
  "invalid-form": "Formato de envío inválido.",
  "invalid-industry": "Industria no válida.",
  "not-pdf": "Solo aceptamos archivos PDF.",
  "too-large": "El PDF supera los 4 MB.",
  "server-error": "Algo ha fallado en el servidor. Inténtalo de nuevo.",
};

const SOURCE_ERROR_COPY: Record<string, string> = {
  "linkedin-blocked": "LinkedIn bloquea la extracción. Copia el texto y pégalo en el campo de texto.",
  "invalid-url": "URL no válida.",
  "blocked-host": "URL no accesible.",
  timeout: "Tardó demasiado en responder.",
  "too-large": "Demasiado grande.",
  "non-html": "No es una página HTML.",
  "not-found": "404.",
  "bot-blocked": "El sitio bloquea peticiones automáticas.",
  "fetch-failed": "No se pudo leer.",
  "empty-text": "No hay suficiente texto.",
};

function friendly(code: string): string {
  return ERROR_COPY[code] ?? "Algo ha fallado. Inténtalo de nuevo.";
}

function friendlySource(code: string | undefined): string {
  if (!code) return "";
  return SOURCE_ERROR_COPY[code] ?? code;
}

export default function ImportStepPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<ReturnType<typeof getIndustryConfig>>(null);
  const [industrySlug, setIndustrySlug] = useState<SupportedIndustry | null>(null);

  const [description, setDescription] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function applyImported(imp: ImportedProfile, sources: SourceReport[]) {
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

    const okCount = sources.filter((s) => s.status === "ok").length;
    const summary =
      okCount > 0
        ? `Analizadas ${okCount} fuentes → ${parts.length > 0 ? parts.join(", ") : "(perfil inicial)"}. Revísalo abajo.`
        : "Extraído. Revísalo abajo.";
    setStatus({ kind: "success", summary, sources });
  }

  function setUrlAt(index: number, value: string) {
    setUrls((curr) => curr.map((u, i) => (i === index ? value : u)));
  }

  function addUrl() {
    setUrls((curr) => (curr.length >= 3 ? curr : [...curr, ""]));
  }

  function removeUrl(index: number) {
    setUrls((curr) => {
      const next = curr.filter((_, i) => i !== index);
      return next.length === 0 ? [""] : next;
    });
  }

  const activeUrls = urls.map((u) => u.trim()).filter(Boolean);
  const hasAnySource = description.trim().length > 0 || activeUrls.length > 0 || selectedFile !== null;

  async function runCombined() {
    if (!industrySlug) return;
    if (!hasAnySource) {
      setStatus({ kind: "error", message: friendly("no-sources") });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const form = new FormData();
      form.append("industry", industrySlug);
      form.append("language", "Spanish");
      if (description.trim()) form.append("text", description.trim());
      for (const u of activeUrls) form.append("urls", u);
      if (selectedFile) form.append("file", selectedFile);

      const res = await fetch("/api/ai/import", { method: "POST", body: form });
      const data = (await res.json()) as
        | { ok: true; imported: ImportedProfile; sources: SourceReport[] }
        | { error: string; sources?: SourceReport[] };

      if (!res.ok || "error" in data) {
        setStatus({
          kind: "error",
          message: friendly("error" in data ? data.error : "server-error"),
          sources: "sources" in data ? data.sources : undefined,
        });
        return;
      }
      applyImported(data.imported, data.sources);
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
          Mezcla lo que quieras — una descripción tuya, enlaces a tu web/GitHub y tu CV. La IA
          analiza todo en conjunto y monta tu perfil inicial. Revisa y ajusta antes de publicar.
        </p>
      </header>

      <section className="space-y-6 rounded-lg border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-ink">Importar con IA</h2>
          <span className="text-xs text-ink/50">gpt-4o-mini · combina todas las fuentes</span>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Describe tu perfil{" "}
            <span className="font-normal text-ink/50">(opcional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Ej: "${industry.examples.headline} Trabajo con marcas pequeñas desde 2019. Me apasiona X y soy fuerte en Y..."`}
            rows={5}
            maxLength={4000}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
          <span className="text-xs text-ink/50">{description.length} / 4.000 caracteres</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">
            Enlaces <span className="font-normal text-ink/50">(opcional · máx. 3)</span>
          </label>
          <div className="space-y-2">
            {urls.map((url, idx) => (
              <div key={idx} className="flex items-stretch gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrlAt(idx, e.target.value)}
                  placeholder="https://tuweb.com · https://github.com/tuusuario"
                  className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrl(idx)}
                    className="rounded-md border border-ink/15 px-3 text-sm text-ink/60 hover:bg-ink/5"
                    aria-label="Quitar enlace"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-ink/50">
            <span>
              ✓ Web personal · ✓ GitHub (vía API). ✗ LinkedIn bloquea scrapers; copia el texto en la
              descripción.
            </span>
            {urls.length < 3 && (
              <button
                type="button"
                onClick={addUrl}
                className="text-olive-600 hover:underline"
              >
                + añadir otro
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-ink">
            CV en PDF <span className="font-normal text-ink/50">(opcional)</span>
          </span>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-ink/20 p-6 text-center hover:border-olive-500 hover:bg-olive-50"
          >
            <span className="text-2xl">📄</span>
            <span className="text-sm font-medium text-ink">
              {selectedFile ? selectedFile.name : "Arrastra tu CV o haz clic para seleccionar"}
            </span>
            <span className="text-xs text-ink/50">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                : "Máx. 4 MB · 20 páginas"}
            </span>
            {selectedFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-1 text-xs text-ink/50 underline-offset-2 hover:text-ink hover:underline"
              >
                Quitar
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs text-ink/50">
            {hasAnySource
              ? "Lo analizamos todo junto en una única extracción."
              : "Añade al menos una fuente para continuar con IA."}
          </span>
          <button
            type="button"
            onClick={runCombined}
            disabled={!hasAnySource || status.kind === "loading"}
            className="inline-flex items-center gap-2 rounded-md bg-olive-500 px-4 py-2 text-sm font-medium text-paper hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.kind === "loading" ? "Analizando…" : "✨ Analizar todo con IA"}
          </button>
        </div>

        {status.kind === "success" && (
          <div className="space-y-2 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm">
            <p className="text-success">{status.summary}</p>
            <SourceList sources={status.sources} />
          </div>
        )}
        {status.kind === "error" && (
          <div className="space-y-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm">
            <p className="text-danger">{status.message}</p>
            {status.sources && <SourceList sources={status.sources} />}
          </div>
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

function SourceList({ sources }: { sources: SourceReport[] }) {
  if (sources.length === 0) return null;
  return (
    <ul className="space-y-1 text-xs">
      {sources.map((s, i) => (
        <li key={`${s.label}-${i}`} className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 inline-block h-2 w-2 rounded-full",
              s.status === "ok" && "bg-success",
              s.status === "skipped" && "bg-mustard",
              s.status === "failed" && "bg-danger",
            )}
          />
          <span className="flex-1 text-ink/70">
            <span className="font-medium">{s.label}</span>
            {s.status === "ok" && s.chars > 0 && (
              <span className="ml-1 text-ink/40">· {s.chars.toLocaleString()} chars</span>
            )}
            {s.error && (
              <span className="ml-1 text-ink/50">· {friendlySource(s.error)}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
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
