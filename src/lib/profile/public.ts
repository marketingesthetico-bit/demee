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
  contact: { email: string | null; social: PublicSocial };
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
