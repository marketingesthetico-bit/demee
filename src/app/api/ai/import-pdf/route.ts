import { NextResponse } from "next/server";

import { AIUnavailableError } from "@/lib/ai/client";
import { extractProfile } from "@/lib/ai/extract-profile";
import type { SupportedIndustry } from "@/lib/industries";
import { getServerSession } from "@/lib/firebase/session";
import { MAX_PDF_BYTES, extractTextFromPdf } from "@/lib/scraper/pdf";
import { ScrapeError } from "@/lib/scraper/fetch-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VALID_INDUSTRIES: readonly SupportedIndustry[] = [
  "graphic-designer",
  "developer",
  "ux-designer",
  "photographer",
  "copywriter",
  "coach",
  "marketing-consultant",
  "architect",
] as const;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid-form" }, { status: 400 });
  }

  const file = formData.get("file");
  const industryRaw = formData.get("industry");
  const languageRaw = formData.get("language");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no-file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "not-pdf" }, { status: 415 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  const industry = typeof industryRaw === "string" ? industryRaw : "";
  if (!VALID_INDUSTRIES.includes(industry as SupportedIndustry)) {
    return NextResponse.json({ error: "invalid-industry" }, { status: 400 });
  }
  const language =
    languageRaw === "English" ? "English" : "Spanish";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    const { normalized, tokensUsed, promptVersion } = await extractProfile({
      sourceText: text,
      industry: industry as SupportedIndustry,
      language,
    });

    return NextResponse.json({
      ok: true,
      imported: normalized,
      meta: { source: "pdf", tokensUsed, promptVersion },
    });
  } catch (err) {
    if (err instanceof ScrapeError) {
      const status =
        err.code === "too-large" ? 413 : err.code === "empty-text" ? 422 : 502;
      return NextResponse.json({ error: err.code }, { status });
    }
    if (err instanceof AIUnavailableError) {
      const status =
        err.message === "source-too-short" || err.message === "source-too-long" ? 400 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/ai/import-pdf] unexpected error", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
