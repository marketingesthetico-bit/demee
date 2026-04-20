import type { Aesthetic, Industry } from "@/types/profile";
import type { ProfileSectionKey } from "@/lib/industries";

import type {
  PublicGalleryImage,
  PublicPortfolioItem,
  PublicService,
  PublicSocial,
} from "./public";

/**
 * Full writable profile shape. Mirrors what is persisted at
 * /users/{uid}/profile/main. Uses the wide Industry/Aesthetic unions
 * so loading legacy docs never fails — the UI narrows at pick time.
 */
export interface EditableProfile {
  industry: Industry;
  aesthetic: Aesthetic;
  defaultSections: ProfileSectionKey[];
  header: {
    name: string;
    headline: string;
    location: string | null;
    availability: "available" | "limited" | "closed";
    photoURL: string | null;
    photoPath: string | null;
  };
  about: {
    bio: string;
    skills: string[];
  };
  services: PublicService[];
  portfolio: PublicPortfolioItem[];
  gallery: PublicGalleryImage[];
  contact: {
    email: string | null;
    phone: string | null;
    social: PublicSocial;
  };
  published: boolean;
}

export const EMPTY_EDITABLE_PROFILE: EditableProfile = {
  industry: "other",
  aesthetic: "minimal",
  defaultSections: ["header", "about", "services", "portfolio", "contact"],
  header: {
    name: "",
    headline: "",
    location: null,
    availability: "available",
    photoURL: null,
    photoPath: null,
  },
  about: { bio: "", skills: [] },
  services: [],
  portfolio: [],
  gallery: [],
  contact: {
    email: null,
    phone: null,
    social: {
      linkedin: null,
      twitter: null,
      instagram: null,
      github: null,
      behance: null,
      dribbble: null,
      website: null,
    },
  },
  published: true,
};
