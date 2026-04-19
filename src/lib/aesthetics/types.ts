import type { Aesthetic } from "@/types/profile";

export interface AestheticTokens {
  fontDisplay: string;
  fontBody: string;
  colorBg: string;
  colorFg: string;
  colorMuted: string;
  colorAccent: string;
  colorAccentContrast: string;
  radiusBase: string;
  spacingUnit: string;
}

export interface AestheticConfig {
  slug: Aesthetic;
  label: string;
  tagline: string;
  tokens: AestheticTokens;
}
