import "server-only";

import type { Aesthetic, Industry } from "@/types/profile";
import type { ProfileSectionKey } from "@/lib/industries";
import type { EditableProfile } from "@/lib/profile/editable";
import type {
  PortfolioDetail,
  PortfolioVideo,
  PublicGalleryImage,
  PublicPortfolioItem,
  VideoProvider,
} from "@/lib/profile/public";
import { detectVideoProvider } from "@/lib/profile/video-embed";

import { getAdminDb } from "./admin";

export interface LoadedUserProfile {
  uid: string;
  handle: string;
  email: string | null;
  profile: EditableProfile;
}

function coerceImageOwner(raw: unknown): PublicGalleryImage | null {
  if (!raw || typeof raw !== "object") return null;
  const img = raw as Record<string, unknown>;
  return typeof img.url === "string" && typeof img.path === "string"
    ? { url: img.url, path: img.path }
    : null;
}

function coerceVideoOwner(raw: unknown): PortfolioVideo | null {
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

function coerceDetailOwner(raw: unknown): PortfolioDetail | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const images = Array.isArray(d.images)
    ? (d.images as unknown[]).map(coerceImageOwner).filter((x): x is PublicGalleryImage => x !== null)
    : [];
  const videos = Array.isArray(d.videos)
    ? (d.videos as unknown[]).map(coerceVideoOwner).filter((x): x is PortfolioVideo => x !== null)
    : [];
  return {
    longDescription: typeof d.longDescription === "string" ? d.longDescription : "",
    images: images.slice(0, 12),
    videos: videos.slice(0, 6),
  };
}

function coercePortfolioItemOwner(
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
        ? (createdAtRaw as { toDate: () => Date }).toDate().toISOString()
        : null;
  const hasDetailPage = raw.hasDetailPage === true;
  const detail = hasDetailPage ? coerceDetailOwner(raw.detail) : null;
  return {
    id,
    title,
    description: (raw.description as string) ?? "",
    link: (raw.link as string | null) ?? null,
    image: coerceImageOwner(raw.image),
    createdAt,
    hasDetailPage,
    detail,
  };
}

/**
 * Server-side loader for the owner's own editable profile. Use from
 * Server Components under (app)/... — the session is validated by the
 * layout, this just reads the doc.
 */
export async function loadOwnProfile(uid: string): Promise<LoadedUserProfile | null> {
  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) return null;
  const user = userSnap.data()!;
  const handle = user.handle as string | undefined;
  if (!handle) return null;

  const profileSnap = await db.collection("users").doc(uid).collection("profile").doc("main").get();
  if (!profileSnap.exists) return null;

  const p = profileSnap.data()!;
  const rawServices = (p.services as unknown[] | undefined) ?? [];
  const rawPortfolio = (p.portfolio as unknown[] | undefined) ?? [];
  const rawGallery = (p.gallery as unknown[] | undefined) ?? [];
  const rawSocial = (p.contact?.social as Record<string, unknown> | undefined) ?? {};

  const profile: EditableProfile = {
    industry: (p.industry as Industry | undefined) ?? "other",
    aesthetic: (p.aesthetic as Aesthetic | undefined) ?? "minimal",
    defaultSections:
      (p.defaultSections as ProfileSectionKey[] | undefined) ?? [
        "header",
        "about",
        "services",
        "portfolio",
        "contact",
      ],
    header: {
      name: (p.header?.name as string) ?? (user.displayName as string) ?? handle,
      headline: (p.header?.headline as string) ?? "",
      location: (p.header?.location as string | null) ?? null,
      availability:
        (p.header?.availability as "available" | "limited" | "closed" | undefined) ?? "available",
      photoURL: (p.header?.photoURL as string | null) ?? null,
      photoPath: (p.header?.photoPath as string | null) ?? null,
    },
    about: {
      bio: (p.about?.bio as string) ?? "",
      skills: (p.about?.skills as string[]) ?? [],
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
      .map((p, i) => coercePortfolioItemOwner(p, i))
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
      email: (p.contact?.email as string | null) ?? (user.email as string | null) ?? null,
      phone: (p.contact?.phone as string | null) ?? null,
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
    themeColors: (() => {
      const c = p.themeColors as Record<string, unknown> | undefined;
      const hex = (v: unknown) =>
        typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim() : null;
      return {
        bg: hex(c?.bg),
        fg: hex(c?.fg),
        muted: hex(c?.muted),
        accent: hex(c?.accent),
      };
    })(),
    published: p.published !== false,
  };

  return {
    uid,
    handle,
    email: (user.email as string | null) ?? null,
    profile,
  };
}
