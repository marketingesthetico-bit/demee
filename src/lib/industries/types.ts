import type { Industry } from "@/types/profile";

export type ProfileSectionKey =
  | "header"
  | "about"
  | "services"
  | "portfolio"
  | "testimonials"
  | "faq"
  | "contact";

export interface IndustryConfig {
  slug: Industry;
  label: string;
  emoji: string;
  tagline: string;
  defaultSections: ProfileSectionKey[];
  examples: {
    headline: string;
    skills: string[];
    services: { name: string; description: string }[];
  };
}
