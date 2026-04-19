import type { CSSProperties } from "react";

import type { Aesthetic } from "@/types/profile";
import { getAestheticConfig, tokensToCssVars } from "@/lib/aesthetics";

interface Props {
  aesthetic: Aesthetic;
  children: React.ReactNode;
  className?: string;
}

export function ThemeProvider({ aesthetic, children, className }: Props) {
  const config = getAestheticConfig(aesthetic) ?? getAestheticConfig("minimal")!;
  const style = tokensToCssVars(config.tokens) as CSSProperties;

  return (
    <div
      data-aesthetic={config.slug}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
