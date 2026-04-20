import "server-only";

import { AESTHETICS, type SupportedAesthetic } from "@/lib/aesthetics";
import { INDUSTRIES, type SupportedIndustry } from "@/lib/industries";

import { getOpenAI } from "./client";
import type { NormalizedImportedProfile } from "./extract-profile-schema";
import {
  mergePolishedIntoProfile,
  polishedProfileSchema,
  scrubInventedFields,
} from "./polish-profile-schema";

export { mergePolishedIntoProfile } from "./polish-profile-schema";
import {
  POLISH_PROFILE_PROMPT_VERSION,
  POLISH_PROFILE_SYSTEM,
  buildPolishProfileUser,
} from "./prompts/polish-profile";

export interface PolishProfileOptions {
  profile: NormalizedImportedProfile;
  industry: SupportedIndustry;
  aesthetic: SupportedAesthetic;
  language?: "Spanish" | "English";
}

export interface PolishProfileResult {
  profile: NormalizedImportedProfile;
  tokensUsed: { prompt: number; completion: number } | null;
  promptVersion: number;
}

/**
 * Rewrites headline / bio / service descriptions with the copywriter
 * system prompt. Returns a NormalizedImportedProfile where the text
 * fields are polished and non-text fields (portfolio, social, skills
 * beyond dedup) are preserved from the input.
 *
 * Fail-safe: if the model errors or the response is invalid, we return
 * the original profile unchanged so onboarding never breaks because of
 * a stylistic pass.
 */
export async function polishProfile(
  options: PolishProfileOptions,
): Promise<PolishProfileResult> {
  const { profile } = options;
  const hasAnyText =
    Boolean(profile.headline) ||
    Boolean(profile.bio) ||
    (profile.services?.some((s) => s.description?.length > 0) ?? false);

  if (!hasAnyText) {
    // Nothing to polish — skip the LLM round-trip.
    return { profile, tokensUsed: null, promptVersion: POLISH_PROFILE_PROMPT_VERSION };
  }

  const industryLabel = INDUSTRIES[options.industry].label;
  const aestheticLabel = AESTHETICS[options.aesthetic].label;
  const language = options.language ?? "Spanish";

  // We only send the polishable shape, not the full profile — the LLM
  // doesn't need to see portfolio links or social URLs to rewrite the bio.
  const inputForLLM = {
    header: { headline: profile.headline ?? null },
    about: {
      bio: profile.bio ?? null,
      skills: profile.skills ?? [],
    },
    services: (profile.services ?? []).map((s) => ({
      name: s.name,
      description: s.description,
    })),
  };

  let completion;
  try {
    completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      max_tokens: 1200,
      messages: [
        { role: "system", content: POLISH_PROFILE_SYSTEM },
        {
          role: "user",
          content: buildPolishProfileUser({
            industry: industryLabel,
            aesthetic: aestheticLabel,
            language,
            profile: inputForLLM,
          }),
        },
      ],
    });
  } catch (err) {
    console.error("[ai/polish-profile] openai call failed", err);
    return { profile, tokensUsed: null, promptVersion: POLISH_PROFILE_PROMPT_VERSION };
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return { profile, tokensUsed: null, promptVersion: POLISH_PROFILE_PROMPT_VERSION };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch (err) {
    console.error("[ai/polish-profile] JSON parse failed", err, raw);
    return { profile, tokensUsed: null, promptVersion: POLISH_PROFILE_PROMPT_VERSION };
  }

  const validated = polishedProfileSchema.safeParse(parsedJson);
  if (!validated.success) {
    console.error(
      "[ai/polish-profile] schema validation failed",
      validated.error.flatten(),
    );
    return { profile, tokensUsed: null, promptVersion: POLISH_PROFILE_PROMPT_VERSION };
  }

  scrubInventedFields(profile, validated.data);
  const mergedProfile = mergePolishedIntoProfile(profile, validated.data);

  return {
    profile: mergedProfile,
    tokensUsed: completion.usage
      ? {
          prompt: completion.usage.prompt_tokens,
          completion: completion.usage.completion_tokens,
        }
      : null,
    promptVersion: POLISH_PROFILE_PROMPT_VERSION,
  };
}
