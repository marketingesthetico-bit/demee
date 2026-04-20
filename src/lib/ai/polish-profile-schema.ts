import { z } from "zod";

import type { NormalizedImportedProfile } from "./extract-profile-schema";

const nullableString = z.union([z.string(), z.null()]).optional();

export const polishedProfileSchema = z.object({
  header: z
    .object({
      headline: nullableString,
    })
    .default({}),
  about: z
    .object({
      bio: nullableString,
      skills: z.array(z.string()).default([]),
    })
    .default({ skills: [] }),
  services: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().default(""),
      }),
    )
    .default([]),
});

export type PolishedProfile = z.infer<typeof polishedProfileSchema>;

/**
 * If the model hallucinates content for fields that were empty in the
 * input we wipe it. The prompt also forbids invention, belt + braces.
 * Mutates in place for ergonomic chaining with the schema.
 */
export function scrubInventedFields(
  original: NormalizedImportedProfile,
  polished: PolishedProfile,
): void {
  if (!original.headline && polished.header.headline) {
    polished.header.headline = null;
  }
  if (!original.bio && polished.about.bio) {
    polished.about.bio = null;
  }
}

/**
 * Merge the polished text fields back onto the full profile (which has
 * portfolio, social, and other non-text fields the polish pass never
 * sees). Empty or whitespace-only polished values fall back to original.
 */
export function mergePolishedIntoProfile(
  original: NormalizedImportedProfile,
  polished: PolishedProfile,
): NormalizedImportedProfile {
  const polishedHeadline = polished.header.headline?.trim();
  const polishedBio = polished.about.bio?.trim();

  const serviceDescByName = new Map<string, string>();
  for (const s of polished.services) {
    if (s.name?.trim()) {
      serviceDescByName.set(s.name.trim().toLowerCase(), s.description?.trim() ?? "");
    }
  }

  const mergedServices = (original.services ?? []).map((s) => {
    const polishedDesc = serviceDescByName.get(s.name.trim().toLowerCase());
    return polishedDesc && polishedDesc.length > 0 ? { ...s, description: polishedDesc } : s;
  });

  const polishedSkills = polished.about.skills
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 60);
  const mergedSkills = polishedSkills.length > 0 ? polishedSkills.slice(0, 10) : original.skills;

  return {
    ...original,
    headline: polishedHeadline && polishedHeadline.length > 0 ? polishedHeadline : original.headline,
    bio: polishedBio && polishedBio.length > 0 ? polishedBio : original.bio,
    skills: mergedSkills,
    services: mergedServices.length > 0 ? mergedServices : original.services,
  };
}
