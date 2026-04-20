import "server-only";

import type { SupportedIndustry } from "@/lib/industries";
import { detectScrapeSource } from "@/lib/scraper/detect";
import { fetchAndExtractText, ScrapeError } from "@/lib/scraper/fetch-html";
import { fetchGitHubProfileSummary, fetchGitHubProfile } from "@/lib/scraper/github";
import { extractTextFromPdf } from "@/lib/scraper/pdf";

import { AIUnavailableError } from "./client";
import { extractProfile } from "./extract-profile";
import type { NormalizedImportedProfile } from "./extract-profile-schema";

export const MAX_COMBINED_CHARS = 24_000;
export const MAX_URLS = 3;

export interface SourceReport {
  label: string;
  status: "ok" | "skipped" | "failed";
  chars: number;
  error?: string;
}

export interface CombineInput {
  text?: string;
  urls?: string[];
  pdf?: { buffer: Buffer; filename: string } | null;
  industry: SupportedIndustry;
  language?: "Spanish" | "English";
}

export interface CombineResult {
  imported: NormalizedImportedProfile;
  sources: SourceReport[];
  tokensUsed: { prompt: number; completion: number } | null;
}

/**
 * Merge two NormalizedImportedProfile shapes. Second wins per field, but
 * arrays are unioned (dedup-by-key). Used to overlay the deterministic
 * GitHub mapping on top of the LLM output without losing either.
 */
function mergeNormalized(
  base: NormalizedImportedProfile,
  overlay: NormalizedImportedProfile,
): NormalizedImportedProfile {
  const mergedSkills = unique([...(base.skills ?? []), ...(overlay.skills ?? [])]).slice(0, 10);
  const mergedPortfolio = dedupByKey(
    [...(base.portfolio ?? []), ...(overlay.portfolio ?? [])],
    (p) => `${p.title.toLowerCase()}|${p.link ?? ""}`,
  ).slice(0, 6);
  const mergedServices = dedupByKey(
    [...(base.services ?? []), ...(overlay.services ?? [])],
    (s) => s.name.toLowerCase(),
  ).slice(0, 8);

  return {
    headline: overlay.headline ?? base.headline,
    bio: overlay.bio ?? base.bio,
    skills: mergedSkills.length > 0 ? mergedSkills : undefined,
    services: mergedServices.length > 0 ? mergedServices : undefined,
    portfolio: mergedPortfolio.length > 0 ? mergedPortfolio : undefined,
    social: overlay.social
      ? { ...(base.social ?? {}), ...overlay.social }
      : base.social,
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function dedupByKey<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    const k = key(item);
    if (!seen.has(k)) seen.set(k, item);
  }
  return Array.from(seen.values());
}

/**
 * Orchestrates multi-source profile extraction. Gathers text from each
 * provided input, formats them into a single LLM-friendly blob with
 * labelled sections, and runs extractProfile once. Per-source failures
 * are reported back but don't fail the whole call as long as at least
 * one source succeeds.
 */
export async function combineSourcesAndExtract(
  input: CombineInput,
): Promise<CombineResult> {
  const sources: SourceReport[] = [];
  const blocks: string[] = [];
  let githubOverlay: NormalizedImportedProfile | null = null;

  const userText = (input.text ?? "").trim();
  if (userText.length > 0) {
    const clipped = userText.slice(0, MAX_COMBINED_CHARS);
    blocks.push(`=== Lo que escribe la persona sobre sí misma ===\n${clipped}`);
    sources.push({ label: "Texto", status: "ok", chars: clipped.length });
  }

  const urls = (input.urls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, MAX_URLS);
  for (const url of urls) {
    const detection = detectScrapeSource(url);
    if (detection.kind === "invalid-url") {
      sources.push({ label: url, status: "failed", chars: 0, error: "invalid-url" });
      continue;
    }
    if (detection.kind === "blocked-host") {
      sources.push({ label: url, status: "failed", chars: 0, error: "blocked-host" });
      continue;
    }
    if (detection.kind === "linkedin") {
      sources.push({
        label: url,
        status: "skipped",
        chars: 0,
        error: "linkedin-blocked",
      });
      continue;
    }
    if (detection.kind === "github") {
      try {
        const summary = await fetchGitHubProfileSummary(detection.username);
        const overlay = await fetchGitHubProfile(detection.username);
        githubOverlay = githubOverlay ? mergeNormalized(githubOverlay, overlay) : overlay;
        const lines = [
          `=== Perfil de GitHub (https://github.com/${detection.username}) ===`,
          summary.name ? `Nombre: ${summary.name}` : null,
          summary.location ? `Ubicación: ${summary.location}` : null,
          overlay.bio ? `Bio: ${overlay.bio}` : null,
          overlay.skills?.length ? `Lenguajes: ${overlay.skills.join(", ")}` : null,
          overlay.portfolio?.length
            ? `Proyectos:\n${overlay.portfolio.map((p) => `- ${p.title}: ${p.description}`).join("\n")}`
            : null,
        ].filter(Boolean);
        blocks.push(lines.join("\n"));
        sources.push({
          label: `GitHub · ${detection.username}`,
          status: "ok",
          chars: lines.join("\n").length,
        });
      } catch (err) {
        sources.push({
          label: `GitHub · ${detection.username}`,
          status: "failed",
          chars: 0,
          error: err instanceof ScrapeError ? err.code : "fetch-failed",
        });
      }
      continue;
    }
    try {
      const { text, title, ogDescription, finalUrl } = await fetchAndExtractText(detection.url);
      const header = `=== Web personal (${finalUrl}) ===`;
      const parts = [header, title ? `Título: ${title}` : null, ogDescription ?? null, text]
        .filter(Boolean)
        .join("\n\n");
      blocks.push(parts);
      sources.push({ label: finalUrl, status: "ok", chars: parts.length });
    } catch (err) {
      sources.push({
        label: detection.url,
        status: "failed",
        chars: 0,
        error: err instanceof ScrapeError ? err.code : "fetch-failed",
      });
    }
  }

  if (input.pdf) {
    try {
      const text = await extractTextFromPdf(input.pdf.buffer);
      blocks.push(`=== CV (${input.pdf.filename}) ===\n${text}`);
      sources.push({ label: `PDF · ${input.pdf.filename}`, status: "ok", chars: text.length });
    } catch (err) {
      sources.push({
        label: `PDF · ${input.pdf.filename}`,
        status: "failed",
        chars: 0,
        error: err instanceof ScrapeError ? err.code : "fetch-failed",
      });
    }
  }

  const successful = sources.filter((s) => s.status === "ok");
  if (successful.length === 0) {
    throw new AIUnavailableError("no-sources");
  }

  const combined = truncateFromEnd(blocks.join("\n\n"), MAX_COMBINED_CHARS);
  if (combined.length < 40) {
    throw new AIUnavailableError("source-too-short");
  }

  const { normalized, tokensUsed } = await extractProfile({
    sourceText: combined,
    industry: input.industry,
    language: input.language ?? "Spanish",
  });

  const merged = githubOverlay ? mergeNormalized(normalized, githubOverlay) : normalized;

  return { imported: merged, sources, tokensUsed };
}

/**
 * Truncates from the END (keep the beginning — bio/description is usually
 * in the first sources we append).
 */
function truncateFromEnd(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max);
}
