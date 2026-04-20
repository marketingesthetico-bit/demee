import { NextResponse } from "next/server";
import { z } from "zod";

import { AIUnavailableError } from "@/lib/ai/client";
import { extractProfile } from "@/lib/ai/extract-profile";
import { getServerSession } from "@/lib/firebase/session";
import { detectScrapeSource } from "@/lib/scraper/detect";
import { fetchAndExtractText, ScrapeError } from "@/lib/scraper/fetch-html";
import { fetchGitHubProfile } from "@/lib/scraper/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  url: z.string().url(),
  industry: z.enum([
    "graphic-designer",
    "developer",
    "ux-designer",
    "photographer",
    "copywriter",
    "coach",
    "marketing-consultant",
    "architect",
  ]),
  language: z.enum(["Spanish", "English"]).optional(),
});

const SCRAPE_ERROR_STATUS: Record<ScrapeError["code"], number> = {
  timeout: 504,
  "too-large": 413,
  "non-html": 415,
  "not-found": 404,
  "bot-blocked": 451,
  "fetch-failed": 502,
  "empty-text": 422,
};

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const detection = detectScrapeSource(parsed.data.url);

  if (detection.kind === "invalid-url") {
    return NextResponse.json({ error: "invalid-url" }, { status: 400 });
  }
  if (detection.kind === "blocked-host") {
    return NextResponse.json(
      { error: "blocked-host", reason: detection.reason },
      { status: 400 },
    );
  }
  if (detection.kind === "linkedin") {
    return NextResponse.json(
      { error: "linkedin-blocked" },
      { status: 422 },
    );
  }

  try {
    if (detection.kind === "github") {
      const imported = await fetchGitHubProfile(detection.username);
      return NextResponse.json({
        ok: true,
        imported,
        meta: { source: "github", username: detection.username },
      });
    }

    // Generic web scrape → extract text → run LLM
    const { text, title, ogDescription } = await fetchAndExtractText(detection.url);
    const sourceText = [title, ogDescription, text].filter(Boolean).join("\n\n");

    const { normalized, tokensUsed, promptVersion } = await extractProfile({
      sourceText,
      industry: parsed.data.industry,
      language: parsed.data.language ?? "Spanish",
    });

    return NextResponse.json({
      ok: true,
      imported: normalized,
      meta: { source: "web", tokensUsed, promptVersion },
    });
  } catch (err) {
    if (err instanceof ScrapeError) {
      return NextResponse.json(
        { error: err.code },
        { status: SCRAPE_ERROR_STATUS[err.code] },
      );
    }
    if (err instanceof AIUnavailableError) {
      const status =
        err.message === "source-too-short" || err.message === "source-too-long" ? 400 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/ai/import-url] unexpected error", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
