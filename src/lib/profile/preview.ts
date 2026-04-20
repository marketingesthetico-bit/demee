import { getIndustryConfig, type SupportedIndustry } from "@/lib/industries";
import type { SupportedAesthetic } from "@/lib/aesthetics";
import type { OnboardingDraft } from "@/lib/onboarding/draft";

import { EMPTY_PUBLIC_SOCIAL, type PublicGalleryImage, type PublicProfile } from "./public";

interface BuildPreviewParams {
  draft: OnboardingDraft;
  name: string;
  handle: string;
  email: string | null;
  photoURL: string | null;
}

export function buildPreviewProfile(params: BuildPreviewParams): PublicProfile | null {
  const { draft } = params;
  if (!draft.industry || !draft.aesthetic) return null;

  const industryConfig = getIndustryConfig(draft.industry);
  if (!industryConfig) return null;

  const imported = draft.imported ?? {};

  const headline =
    imported.headline?.trim() && imported.headline.trim().length > 0
      ? imported.headline.trim()
      : industryConfig.examples.headline;

  const skills = imported.skills && imported.skills.length > 0 ? imported.skills : [];

  const social = { ...EMPTY_PUBLIC_SOCIAL };
  if (imported.social) {
    for (const key of Object.keys(social) as (keyof typeof social)[]) {
      const value = imported.social[key];
      if (value) social[key] = value;
    }
  }

  const gallery: PublicGalleryImage[] = (imported.gallery ?? []).map((g) => ({
    url: g.url,
    path: g.path,
  }));

  return {
    uid: "preview",
    handle: params.handle || "tunombre",
    hasBudget: false,
    hasBooking: false,
    bookingTeaser: null,
    industry: draft.industry as SupportedIndustry,
    aesthetic: draft.aesthetic as SupportedAesthetic,
    defaultSections: industryConfig.defaultSections,
    header: {
      name: params.name || "Tu nombre",
      headline,
      location: null,
      availability: "available",
      photoURL: imported.avatar?.url ?? params.photoURL,
    },
    about: {
      bio: imported.bio ?? "",
      skills,
    },
    services: (imported.services ?? []).map((s) => ({
      name: s.name,
      description: s.description,
      priceFrom: null,
      unit: null,
    })),
    portfolio: (imported.portfolio ?? []).map((p) => ({
      title: p.title,
      description: p.description,
      link: p.link ?? null,
      image: p.image ?? null,
    })),
    gallery,
    contact: {
      email: params.email,
      social,
    },
    themeColors: { bg: null, fg: null, muted: null, accent: null },
  };
}
