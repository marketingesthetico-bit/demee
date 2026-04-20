import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AIUnavailableError,
} from "@/lib/ai/client";
import { extractProfile, MAX_SOURCE_CHARS } from "@/lib/ai/extract-profile";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  source: z
    .string()
    .min(40, "source-too-short")
    .max(MAX_SOURCE_CHARS, "source-too-long"),
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

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid-body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { normalized, tokensUsed, promptVersion } = await extractProfile({
      sourceText: parsed.data.source,
      industry: parsed.data.industry,
      language: parsed.data.language ?? "Spanish",
    });

    return NextResponse.json({
      ok: true,
      imported: normalized,
      meta: { tokensUsed, promptVersion },
    });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      const status = err.message === "source-too-short" || err.message === "source-too-long" ? 400 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/ai/import-profile] unexpected error", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
