import { z } from "zod";

const nullableString = z.union([z.string(), z.null()]).optional();

export const extractedProfileSchema = z.object({
  header: z
    .object({
      name: nullableString,
      headline: nullableString,
      location: nullableString,
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
        name: z.string(),
        description: z.string().default(""),
      }),
    )
    .default([]),
  portfolio: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().default(""),
        link: nullableString,
        year: nullableString,
      }),
    )
    .default([]),
  social: z
    .object({
      linkedin: nullableString,
      twitter: nullableString,
      instagram: nullableString,
      github: nullableString,
      behance: nullableString,
      dribbble: nullableString,
      website: nullableString,
    })
    .default({}),
});

export type ExtractedProfile = z.infer<typeof extractedProfileSchema>;

/**
 * Normalized shape used by the onboarding draft and /api/users.
 * Nullish values become undefined and arrays are truncated per MVP limits.
 */
export interface NormalizedImportedProfile {
  headline?: string;
  bio?: string;
  skills?: string[];
  services?: { name: string; description: string }[];
  portfolio?: { title: string; description: string; link?: string }[];
  social?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    behance?: string;
    dribbble?: string;
    website?: string;
  };
}

function truncate(input: string | null | undefined, max: number): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function dropNullish(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeExtractedProfile(
  profile: ExtractedProfile,
): NormalizedImportedProfile {
  const skills = (profile.about.skills ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 60)
    .slice(0, 10);

  const services = (profile.services ?? [])
    .filter((s) => s.name.trim().length > 0)
    .slice(0, 8)
    .map((s) => ({
      name: s.name.trim().slice(0, 80),
      description: truncate(s.description, 280) ?? "",
    }));

  const portfolio = (profile.portfolio ?? [])
    .filter((p) => p.title.trim().length > 0)
    .slice(0, 6)
    .map((p) => ({
      title: p.title.trim().slice(0, 120),
      description: truncate(p.description, 280) ?? "",
      link: dropNullish(p.link),
    }));

  const social = {
    linkedin: dropNullish(profile.social.linkedin),
    twitter: dropNullish(profile.social.twitter),
    instagram: dropNullish(profile.social.instagram),
    github: dropNullish(profile.social.github),
    behance: dropNullish(profile.social.behance),
    dribbble: dropNullish(profile.social.dribbble),
    website: dropNullish(profile.social.website),
  };
  const hasAnySocial = Object.values(social).some((v) => v);

  return {
    headline: truncate(profile.header.headline, 160),
    bio: truncate(profile.about.bio, 800),
    skills: skills.length > 0 ? skills : undefined,
    services: services.length > 0 ? services : undefined,
    portfolio: portfolio.length > 0 ? portfolio : undefined,
    social: hasAnySocial ? social : undefined,
  };
}
