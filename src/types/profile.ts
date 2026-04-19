export type Industry =
  | "graphic-designer"
  | "developer"
  | "ux-designer"
  | "photographer"
  | "videographer"
  | "copywriter"
  | "marketing-consultant"
  | "business-consultant"
  | "coach"
  | "architect"
  | "illustrator"
  | "therapist"
  | "nutritionist"
  | "personal-trainer"
  | "translator"
  | "lawyer"
  | "accountant"
  | "community-manager"
  | "social-media-manager"
  | "music-producer"
  | "teacher"
  | "virtual-assistant"
  | "data-analyst"
  | "other";

export type Aesthetic = "minimal" | "editorial" | "bold" | "playful" | "corporate" | "artistic";

export type Availability = "available" | "limited" | "closed";

export interface ProfileHeader {
  name: string;
  headline: string;
  location: string | null;
  availability: Availability;
  photoURL: string | null;
}

export interface ProfileAbout {
  bio: string;
  skills: string[];
}

export interface ServiceItem {
  name: string;
  description: string;
  priceFrom: number | null;
  unit: "project" | "hour" | "month" | null;
}

export interface PortfolioItem {
  title: string;
  description: string;
  imageURL: string | null;
  link: string | null;
  category: string | null;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string | null;
  company: string | null;
  photoURL: string | null;
}

export interface SocialLinks {
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  github: string | null;
  behance: string | null;
  dribbble: string | null;
  website: string | null;
}

export interface ProfileContact {
  email: string | null;
  phone: string | null;
  social: SocialLinks;
}

export interface Profile {
  industry: Industry;
  aesthetic: Aesthetic;
  header: ProfileHeader;
  about: ProfileAbout;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
  faq: { q: string; a: string }[];
  contact: ProfileContact;
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
}
