import type { Aesthetic, Industry } from "@/types/profile";
import type { ProfileSectionKey } from "@/lib/industries";

export interface PublicService {
  name: string;
  description: string;
  priceFrom: number | null;
  unit: "project" | "hour" | "month" | null;
}

export interface PublicPortfolioItem {
  title: string;
  description: string;
  link: string | null;
  image: PublicGalleryImage | null;
}

export interface PublicGalleryImage {
  url: string;
  path: string;
}

export interface PublicSocial {
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  github: string | null;
  behance: string | null;
  dribbble: string | null;
  website: string | null;
}

export interface PublicProfile {
  uid: string;
  handle: string;
  industry: Industry;
  aesthetic: Aesthetic;
  defaultSections: ProfileSectionKey[];
  header: {
    name: string;
    headline: string;
    location: string | null;
    availability: "available" | "limited" | "closed";
    photoURL: string | null;
  };
  about: { bio: string; skills: string[] };
  services: PublicService[];
  portfolio: PublicPortfolioItem[];
  gallery: PublicGalleryImage[];
  contact: { email: string | null; social: PublicSocial };
  hasBudget: boolean;
  hasBooking: boolean;
  /**
   * Minimal booking snapshot for rendering the agenda teaser on /[handle]
   * without re-querying. Null when hasBooking is false.
   */
  bookingTeaser: PublicBookingTeaser | null;
  /**
   * Optional color overrides layered on top of the aesthetic tokens.
   * Each field is a hex string "#rrggbb" or null. ThemeProvider merges
   * these into the CSS variables at render time.
   */
  themeColors: ThemeColorOverrides;
}

export interface ThemeColorOverrides {
  bg: string | null;
  fg: string | null;
  muted: string | null;
  accent: string | null;
}

export const EMPTY_THEME_COLORS: ThemeColorOverrides = {
  bg: null,
  fg: null,
  muted: null,
  accent: null,
};

export interface PublicBookingTeaser {
  name: string;
  description: string;
  durationMinutes: number;
  locationType: "online" | "phone" | "in-person";
}

export const EMPTY_PUBLIC_SOCIAL: PublicSocial = {
  linkedin: null,
  twitter: null,
  instagram: null,
  github: null,
  behance: null,
  dribbble: null,
  website: null,
};
