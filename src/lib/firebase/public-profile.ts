import "server-only";

import type { Aesthetic, Industry } from "@/types/profile";
import type { ProfileSectionKey } from "@/lib/industries";
import type { PublicProfile } from "@/lib/profile/public";

import { getAdminDb } from "./admin";

export type {
  PublicProfile,
  PublicService,
  PublicPortfolioItem,
  PublicSocial,
  PublicGalleryImage,
} from "@/lib/profile/public";

const FALLBACK_SECTIONS: ProfileSectionKey[] = [
  "header",
  "about",
  "services",
  "portfolio",
  "contact",
];

export async function getPublicProfileByHandle(handle: string): Promise<PublicProfile | null> {
  const db = getAdminDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) return null;

  const uid = handleSnap.data()?.uid as string | undefined;
  if (!uid) return null;

  const profileSnap = await db.collection("users").doc(uid).collection("profile").doc("main").get();
  if (!profileSnap.exists) return null;

  const data = profileSnap.data();
  if (!data || data.published !== true) return null;

  const rawServices = (data.services as unknown[] | undefined) ?? [];
  const rawPortfolio = (data.portfolio as unknown[] | undefined) ?? [];
  const rawGallery = (data.gallery as unknown[] | undefined) ?? [];
  const rawSocial = (data.contact?.social as Record<string, unknown> | undefined) ?? {};

  const [budgetSnap, bookingSnap] = await Promise.all([
    db.collection("users").doc(uid).collection("budget").doc("main").get(),
    db.collection("users").doc(uid).collection("booking").doc("main").get(),
  ]);
  const budgetData = budgetSnap.exists ? budgetSnap.data() : undefined;
  const hasBudget = Boolean(
    budgetData?.enabled === true &&
      Array.isArray(budgetData?.items) &&
      (budgetData.items as unknown[]).length > 0,
  );
  const bookingData = bookingSnap.exists ? bookingSnap.data() : undefined;
  const hasBooking = Boolean(bookingData?.enabled === true);

  return {
    uid,
    handle,
    hasBudget,
    hasBooking,
    industry: (data.industry as Industry | undefined) ?? "other",
    aesthetic: (data.aesthetic as Aesthetic | undefined) ?? "minimal",
    defaultSections:
      (data.defaultSections as ProfileSectionKey[] | undefined) ?? FALLBACK_SECTIONS,
    header: {
      name: (data.header?.name as string) ?? handle,
      headline: (data.header?.headline as string) ?? "",
      location: (data.header?.location as string | null) ?? null,
      availability:
        (data.header?.availability as "available" | "limited" | "closed" | undefined) ?? "available",
      photoURL: (data.header?.photoURL as string | null) ?? null,
    },
    about: {
      bio: (data.about?.bio as string) ?? "",
      skills: (data.about?.skills as string[]) ?? [],
    },
    services: rawServices
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map((s) => ({
        name: (s.name as string) ?? "",
        description: (s.description as string) ?? "",
        priceFrom: typeof s.priceFrom === "number" ? s.priceFrom : null,
        unit: (s.unit as "project" | "hour" | "month" | null | undefined) ?? null,
      }))
      .filter((s) => s.name.length > 0),
    portfolio: rawPortfolio
      .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
      .map((p) => ({
        title: (p.title as string) ?? "",
        description: (p.description as string) ?? "",
        link: (p.link as string | null) ?? null,
      }))
      .filter((p) => p.title.length > 0),
    gallery: rawGallery
      .filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null)
      .map((g) => ({
        url: (g.url as string) ?? "",
        path: (g.path as string) ?? "",
      }))
      .filter((g) => g.url.length > 0)
      .slice(0, 8),
    contact: {
      email: (data.contact?.email as string | null) ?? null,
      social: {
        linkedin: (rawSocial.linkedin as string | null) ?? null,
        twitter: (rawSocial.twitter as string | null) ?? null,
        instagram: (rawSocial.instagram as string | null) ?? null,
        github: (rawSocial.github as string | null) ?? null,
        behance: (rawSocial.behance as string | null) ?? null,
        dribbble: (rawSocial.dribbble as string | null) ?? null,
        website: (rawSocial.website as string | null) ?? null,
      },
    },
  };
}
