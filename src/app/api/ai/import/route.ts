import { NextResponse } from "next/server";

import { AIUnavailableError } from "@/lib/ai/client";
import {
  MAX_URLS,
  combineSourcesAndExtract,
} from "@/lib/ai/combine-sources";
import type { SupportedIndustry } from "@/lib/industries";
import { getServerSession } from "@/lib/firebase/session";
import { MAX_PDF_BYTES } from "@/lib/scraper/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

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

  const industryRaw = formData.get("industry");
  const industry = typeof industryRaw === "string" ? industryRaw : "";
  if (!VALID_INDUSTRIES.includes(industry as SupportedIndustry)) {
    return NextResponse.json({ error: "invalid-industry" }, { status: 400 });
  }

  const languageRaw = formData.get("language");
  const language = languageRaw === "English" ? "English" : "Spanish";

  const text = typeof formData.get("text") === "string" ? (formData.get("text") as string) : "";

  const urls = formData
    .getAll("urls")
    .filter((v): v is string => typeof v === "string")
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, MAX_URLS);

  const file = formData.get("file");
  let pdf: { buffer: Buffer; filename: string } | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "not-pdf" }, { status: 415 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "too-large" }, { status: 413 });
    }
    pdf = { buffer: Buffer.from(await file.arrayBuffer()), filename: file.name };
  }

  const hasAnySource = text.trim().length > 0 || urls.length > 0 || pdf !== null;
  if (!hasAnySource) {
    return NextResponse.json({ error: "no-sources" }, { status: 400 });
  }

  try {
    const { imported, sources, tokensUsed } = await combineSourcesAndExtract({
      text,
      urls,
      pdf,
      industry: industry as SupportedIndustry,
      language,
    });

    return NextResponse.json({ ok: true, imported, sources, meta: { tokensUsed } });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      const status =
        err.message === "source-too-short" ||
        err.message === "source-too-long" ||
        err.message === "no-sources"
          ? 400
          : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/ai/import] unexpected error", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
