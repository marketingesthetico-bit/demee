"use client";

import { z } from "zod";

const DRAFT_KEY = "demee:onboarding-draft";

export const galleryImageSchema = z.object({
  url: z.string().url(),
  path: z.string(),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const importedProfileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  services: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  portfolio: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string().optional(),
      }),
    )
    .optional(),
  social: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      github: z.string().optional(),
      behance: z.string().optional(),
      dribbble: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  avatar: galleryImageSchema.optional(),
  gallery: z.array(galleryImageSchema).max(8).optional(),
});

export type ImportedProfile = z.infer<typeof importedProfileSchema>;

const industrySchema = z.enum([
  "graphic-designer",
  "developer",
  "ux-designer",
  "photographer",
  "copywriter",
  "coach",
  "marketing-consultant",
  "architect",
]);

const aestheticSchema = z.enum(["minimal", "editorial", "bold"]);

export const onboardingDraftSchema = z.object({
  industry: industrySchema.optional(),
  aesthetic: aestheticSchema.optional(),
  imported: importedProfileSchema.optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export function readDraft(): OnboardingDraft {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return onboardingDraftSchema.parse(parsed);
  } catch {
    return {};
  }
}

export function writeDraft(update: Partial<OnboardingDraft>): OnboardingDraft {
  const current = readDraft();
  const next = { ...current, ...update };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}
