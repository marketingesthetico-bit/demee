import type { Aesthetic } from "@/types/profile";

import type { AestheticConfig, AestheticTokens } from "./types";

const MINIMAL_TOKENS: AestheticTokens = {
  fontDisplay: '"Inter", system-ui, sans-serif',
  fontBody: '"Inter", system-ui, sans-serif',
  colorBg: "#FFFFFF",
  colorFg: "#0A0A0A",
  colorMuted: "#737373",
  colorAccent: "#0A0A0A",
  colorAccentContrast: "#FFFFFF",
  radiusBase: "2px",
  spacingUnit: "1.2rem",
};

const EDITORIAL_TOKENS: AestheticTokens = {
  fontDisplay: '"Fraunces", Georgia, serif',
  fontBody: '"Source Serif 4", Georgia, serif',
  colorBg: "#FBF8F3",
  colorFg: "#1A1A1A",
  colorMuted: "#6B6560",
  colorAccent: "#8B2E2A",
  colorAccentContrast: "#FBF8F3",
  radiusBase: "0px",
  spacingUnit: "1.5rem",
};

const BOLD_TOKENS: AestheticTokens = {
  fontDisplay: '"Archivo Black", "Impact", sans-serif',
  fontBody: '"Archivo", system-ui, sans-serif',
  colorBg: "#0A0A0A",
  colorFg: "#FAFAFA",
  colorMuted: "#A3A3A3",
  colorAccent: "#FAFF00",
  colorAccentContrast: "#0A0A0A",
  radiusBase: "0px",
  spacingUnit: "1.3rem",
};

// Warm cream + coral pink, generous radii. Display + body share Outfit
// so the friendly geometric voice stays consistent at all sizes.
const PLAYFUL_TOKENS: AestheticTokens = {
  fontDisplay: '"Outfit", system-ui, sans-serif',
  fontBody: '"Outfit", system-ui, sans-serif',
  colorBg: "#FFF7EE",
  colorFg: "#2D1F3F",
  colorMuted: "#8B7B95",
  colorAccent: "#E8517A",
  colorAccentContrast: "#FFFFFF",
  radiusBase: "16px",
  spacingUnit: "1.4rem",
};

// Restrained slate + deep blue. Manrope for headlines reads more
// "professional services" than the geometric Inter we use for minimal.
const CORPORATE_TOKENS: AestheticTokens = {
  fontDisplay: '"Manrope", system-ui, sans-serif',
  fontBody: '"Inter", system-ui, sans-serif',
  colorBg: "#FFFFFF",
  colorFg: "#0F172A",
  colorMuted: "#64748B",
  colorAccent: "#1E40AF",
  colorAccentContrast: "#FFFFFF",
  radiusBase: "4px",
  spacingUnit: "1.1rem",
};

// Warm parchment + terracotta. Caprasimo's chunky display serif paired
// with Source Serif 4 leans into hand-crafted, gallery-catalog vibes.
const ARTISTIC_TOKENS: AestheticTokens = {
  fontDisplay: '"Caprasimo", "Fraunces", Georgia, serif',
  fontBody: '"Source Serif 4", Georgia, serif',
  colorBg: "#F4EEE2",
  colorFg: "#231C18",
  colorMuted: "#7A6E62",
  colorAccent: "#D45D2E",
  colorAccentContrast: "#FFFFFF",
  radiusBase: "0px",
  spacingUnit: "1.6rem",
};

export type SupportedAesthetic = Extract<
  Aesthetic,
  "minimal" | "editorial" | "bold" | "playful" | "corporate" | "artistic"
>;

export const AESTHETICS: Record<SupportedAesthetic, AestheticConfig> = {
  minimal: {
    slug: "minimal",
    label: "Minimal",
    tagline: "Blanco, negro, espacios amplios. Para quien deja que el trabajo hable.",
    tokens: MINIMAL_TOKENS,
  },
  editorial: {
    slug: "editorial",
    label: "Editorial",
    tagline: "Ritmo de revista, tipografía con carácter, acento de color.",
    tokens: EDITORIAL_TOKENS,
  },
  bold: {
    slug: "bold",
    label: "Bold",
    tagline: "Contraste máximo, declaraciones grandes. No pasas desapercibido.",
    tokens: BOLD_TOKENS,
  },
  playful: {
    slug: "playful",
    label: "Playful",
    tagline: "Crema cálida, coral y curvas suaves. Cercano sin ser informal.",
    tokens: PLAYFUL_TOKENS,
  },
  corporate: {
    slug: "corporate",
    label: "Corporate",
    tagline: "Pizarra, azul profundo y compostura. Para servicios profesionales.",
    tokens: CORPORATE_TOKENS,
  },
  artistic: {
    slug: "artistic",
    label: "Artistic",
    tagline: "Pergamino, terracota y serifa expresiva. Aire de catálogo de galería.",
    tokens: ARTISTIC_TOKENS,
  },
};

export const AESTHETIC_LIST: AestheticConfig[] = Object.values(AESTHETICS);

export function getAestheticConfig(slug: Aesthetic): AestheticConfig | null {
  return (AESTHETICS as Record<string, AestheticConfig | undefined>)[slug] ?? null;
}

export function tokensToCssVars(tokens: AestheticTokens): Record<string, string> {
  return {
    "--aesthetic-font-display": tokens.fontDisplay,
    "--aesthetic-font-body": tokens.fontBody,
    "--aesthetic-color-bg": tokens.colorBg,
    "--aesthetic-color-fg": tokens.colorFg,
    "--aesthetic-color-muted": tokens.colorMuted,
    "--aesthetic-color-accent": tokens.colorAccent,
    "--aesthetic-color-accent-contrast": tokens.colorAccentContrast,
    "--aesthetic-radius-base": tokens.radiusBase,
    "--aesthetic-spacing-unit": tokens.spacingUnit,
  };
}
