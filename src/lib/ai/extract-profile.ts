import "server-only";

import { INDUSTRIES, type SupportedIndustry } from "@/lib/industries";

import { AIUnavailableError, getOpenAI } from "./client";
import {
  extractedProfileSchema,
  normalizeExtractedProfile,
  type ExtractedProfile,
  type NormalizedImportedProfile,
} from "./extract-profile-schema";
import {
  EXTRACT_PROFILE_PROMPT_VERSION,
  EXTRACT_PROFILE_SYSTEM,
  buildExtractProfileUser,
} from "./prompts/extract-profile";

export { extractedProfileSchema };
export type { ExtractedProfile, NormalizedImportedProfile };

export const MAX_SOURCE_CHARS = 12_000;

export interface ExtractProfileOptions {
  sourceText: string;
  industry: SupportedIndustry;
  language?: "Spanish" | "English";
}

export interface ExtractProfileResult {
  profile: ExtractedProfile;
  normalized: NormalizedImportedProfile;
  tokensUsed: { prompt: number; completion: number } | null;
  promptVersion: number;
}

export async function extractProfile(
  options: ExtractProfileOptions,
): Promise<ExtractProfileResult> {
  const text = options.sourceText.trim();
  if (text.length < 40) {
    throw new AIUnavailableError("source-too-short");
  }
  if (text.length > MAX_SOURCE_CHARS) {
    throw new AIUnavailableError("source-too-long");
  }

  const industryLabel = INDUSTRIES[options.industry].label;
  const language = options.language ?? "Spanish";
  const openai = getOpenAI();

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 1500,
      messages: [
        { role: "system", content: EXTRACT_PROFILE_SYSTEM },
        {
          role: "user",
          content: buildExtractProfileUser({
            industry: industryLabel,
            language,
            sourceText: text,
          }),
        },
      ],
    });
  } catch (err) {
    console.error("[ai/extract-profile] openai call failed", err);
    throw new AIUnavailableError("provider-error");
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new AIUnavailableError("empty-response");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch (err) {
    console.error("[ai/extract-profile] JSON parse failed", err, raw);
    throw new AIUnavailableError("invalid-json");
  }

  const validated = extractedProfileSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error("[ai/extract-profile] schema validation failed", validated.error.flatten());
    throw new AIUnavailableError("schema-mismatch");
  }

  return {
    profile: validated.data,
    normalized: normalizeExtractedProfile(validated.data),
    tokensUsed: completion.usage
      ? { prompt: completion.usage.prompt_tokens, completion: completion.usage.completion_tokens }
      : null,
    promptVersion: EXTRACT_PROFILE_PROMPT_VERSION,
  };
}
