import "server-only";

import type { Aesthetic, Industry } from "@/types/profile";
import type { ProfileSectionKey } from "@/lib/industries";
import type {
  PortfolioDetail,
  PortfolioVideo,
  PublicGalleryImage,
  PublicPortfolioItem,
  PublicProfile,
  VideoProvider,
} from "@/lib/profile/public";
import { detectVideoProvider } from "@/lib/profile/video-embed";

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

function coerceHex(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const hex = raw.trim();
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : null;
}

function coerceImage(raw: unknown): PublicGalleryImage | null {
  if (!raw || typeof raw !== "object") return null;
  const img = raw as Record<string, unknown>;
  return typeof img.url === "string" && typeof img.path === "string"
    ? { url: img.url, path: img.path }
    : null;
}

function coerceVideo(raw: unknown): PortfolioVideo | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const url = typeof v.url === "string" ? v.url : "";
  if (!url) return null;
  const provider =
    v.provider === "youtube" || v.provider === "vimeo" || v.provider === "direct"
      ? (v.provider as VideoProvider)
      : detectVideoProvider(url);
  if (!provider) return null;
  return { url, provider };
}

function coerceDetail(raw: unknown): PortfolioDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const images = Array.isArray(d.images)
    ? (d.images as unknown[]).map(coerceImage).filter((x): x is PublicGalleryImage => x !== null)
    : [];
  const videos = Array.isArray(d.videos)
    ? (d.videos as unknown[]).map(coerceVideo).filter((x): x is PortfolioVideo => x !== null)
    : [];
  return {
    longDescription: typeof d.longDescription === "string" ? d.longDescription : "",
    images: images.slice(0, 12),
    videos: videos.slice(0, 6),
  };
}

/**
 * Portfolio item coercion with legacy-friendly defaults:
 * - Missing id → deterministic fallback from title + index so existing items
 *   keep stable URLs the first time a user saves again.
 * - Missing createdAt → null (display hides the date for legacy rows).
 * - hasDetailPage defaults to false; detail is null unless present and the
 *   flag is on.
 */
function coercePortfolioItem(
  raw: Record<string, unknown>,
  index: number,
): PublicPortfolioItem {
  const title = (raw.title as string) ?? "";
  const id =
    typeof raw.id === "string" && raw.id
      ? raw.id
      : `legacy-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
  const createdAtRaw = raw.createdAt;
  const createdAt =
    typeof createdAtRaw === "string"
      ? createdAtRaw
      : createdAtRaw && typeof createdAtRaw === "object" &&
          typeof (createdAtRaw as { toDate?: () => Date }).toDate === "function"
        ? ((createdAtRaw as { toDate: () => Date }).toDate().toISOString())
        : null;
  const hasDetailPage = raw.hasDetailPage === true;
  const detail = hasDetailPage ? coerceDetail(raw.detail) : null;
  return {
    id,
    title,
    description: (raw.description as string) ?? "",
    link: (raw.link as string | null) ?? null,
    image: coerceImage(raw.image),
    createdAt,
    hasDetailPage,
    detail,
  };
}

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
  const bookingTeaser = hasBooking && bookingData
    ? {
        name: (bookingData.name as string) ?? "Llamada",
        description: (bookingData.description as string) ?? "",
        durationMinutes: (bookingData.durationMinutes as number) ?? 30,
        locationType:
          (bookingData.locationType as "online" | "phone" | "in-person" | undefined) ??
          "online",
      }
    : null;

  const rawColors = data.themeColors as Record<string, unknown> | undefined;
  const themeColors = {
    bg: coerceHex(rawColors?.bg),
    fg: coerceHex(rawColors?.fg),
    muted: coerceHex(rawColors?.muted),
    accent: coerceHex(rawColors?.accent),
  };

  return {
    uid,
    handle,
    hasBudget,
    hasBooking,
    bookingTeaser,
    themeColors,
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
      .map((p, i) => coercePortfolioItem(p, i))
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
