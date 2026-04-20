import type { CSSProperties } from "react";

import type { Aesthetic } from "@/types/profile";
import { getAestheticConfig, tokensToCssVars } from "@/lib/aesthetics";
import type { ThemeColorOverrides } from "@/lib/profile/public";

interface Props {
  aesthetic: Aesthetic;
  overrides?: ThemeColorOverrides | null;
  children: React.ReactNode;
  className?: string;
}

/**
 * Derives a sensible contrast color (white vs. near-black) for a given
 * hex so user-picked accent colors always have readable text on them.
 */
function contrastFor(hex: string): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.62 ? "#111111" : "#FFFFFF";
}

export function ThemeProvider({ aesthetic, overrides, children, className }: Props) {
  const config = getAestheticConfig(aesthetic) ?? getAestheticConfig("minimal")!;
  const baseVars = tokensToCssVars(config.tokens);

  const finalVars: Record<string, string> = { ...baseVars };
  if (overrides?.bg) finalVars["--aesthetic-color-bg"] = overrides.bg;
  if (overrides?.fg) finalVars["--aesthetic-color-fg"] = overrides.fg;
  if (overrides?.muted) finalVars["--aesthetic-color-muted"] = overrides.muted;
  if (overrides?.accent) {
    finalVars["--aesthetic-color-accent"] = overrides.accent;
    finalVars["--aesthetic-color-accent-contrast"] = contrastFor(overrides.accent);
  }

  return (
    <div
      data-aesthetic={config.slug}
      style={finalVars as CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
