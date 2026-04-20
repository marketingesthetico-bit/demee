"use client";

import { useEffect, useState } from "react";

import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

type CTA = {
  label: string;
  href: string;
  primary?: boolean;
};

type AestheticStyle = {
  wrapper: string;
  container: string;
  label: string;
  ctaBase: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

/**
 * Per-aesthetic treatment — a different feel without needing separate
 * components per theme. Everything is expressed via Tailwind + the
 * aesthetic CSS vars we already have.
 */
const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-2 rounded-full border border-aesthetic-fg/15 bg-aesthetic-bg/95 px-3 py-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur",
    label: "hidden text-xs font-medium text-aesthetic-muted sm:inline",
    ctaBase: "rounded-full px-3 py-1.5 text-xs font-medium transition",
    ctaPrimary:
      "bg-aesthetic-fg text-aesthetic-bg hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/20 text-aesthetic-fg/80 hover:border-aesthetic-fg/40",
  },
  editorial: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-3 border border-aesthetic-fg/20 bg-aesthetic-bg/95 px-4 py-2.5 shadow-[0_12px_32px_-16px_rgba(139,46,42,0.35)] backdrop-blur",
    label:
      "hidden font-aesthetic-display text-sm italic text-aesthetic-muted sm:inline",
    ctaBase: "px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition",
    ctaPrimary:
      "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/30 text-aesthetic-fg/80 hover:border-aesthetic-fg",
  },
  bold: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-2 border-2 border-aesthetic-fg bg-aesthetic-bg px-3 py-2 shadow-[4px_4px_0_0_var(--aesthetic-color-fg)]",
    label:
      "hidden text-[11px] font-bold uppercase tracking-widest text-aesthetic-fg sm:inline",
    ctaBase:
      "px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition",
    ctaPrimary:
      "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border-2 border-aesthetic-fg text-aesthetic-fg hover:bg-aesthetic-fg hover:text-aesthetic-bg",
  },
  playful: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-2 rounded-3xl border border-aesthetic-fg/10 bg-aesthetic-bg/95 px-4 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur",
    label: "hidden text-xs text-aesthetic-muted sm:inline",
    ctaBase: "rounded-full px-3 py-1.5 text-xs font-medium transition",
    ctaPrimary:
      "bg-aesthetic-accent text-aesthetic-accent-contrast hover:scale-105",
    ctaSecondary:
      "bg-aesthetic-fg/5 text-aesthetic-fg/80 hover:bg-aesthetic-fg/10",
  },
  corporate: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-2 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg/95 px-3 py-2 shadow-md backdrop-blur",
    label: "hidden text-xs text-aesthetic-muted sm:inline",
    ctaBase: "rounded-md px-3 py-1.5 text-xs font-medium transition",
    ctaPrimary:
      "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/20 text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent",
  },
  artistic: {
    wrapper: "sm:right-6 sm:bottom-6 sm:left-auto",
    container:
      "flex items-center gap-2 rounded-[20px_4px_20px_4px] border border-aesthetic-fg/15 bg-aesthetic-bg/95 px-4 py-2.5 shadow-[0_14px_36px_-18px_rgba(0,0,0,0.3)] backdrop-blur",
    label: "hidden text-xs italic text-aesthetic-muted sm:inline",
    ctaBase:
      "rounded-[12px_2px_12px_2px] px-3 py-1.5 text-xs font-medium transition",
    ctaPrimary:
      "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/20 text-aesthetic-fg/80 hover:border-aesthetic-fg",
  },
};

export function StickyContactBar({ profile }: { profile: PublicProfile }) {
  const [mounted, setMounted] = useState(false);
  // Avoid hydration mismatch with transitions — render after first paint.
  useEffect(() => setMounted(true), []);

  const ctas: CTA[] = [];
  if (profile.hasBudget) {
    ctas.push({ label: "Presupuesto", href: `/${profile.handle}/budget`, primary: true });
  }
  if (profile.hasBooking) {
    ctas.push({
      label: "Agendar",
      href: `/${profile.handle}/book`,
      primary: !profile.hasBudget,
    });
  }
  if (profile.contact.email) {
    ctas.push({ label: "Email", href: `mailto:${profile.contact.email}` });
  }

  if (ctas.length === 0) return null;

  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  return (
    <div
      aria-hidden={!mounted}
      className={cn(
        "pointer-events-none fixed bottom-4 left-4 right-4 z-30 flex justify-center transition-opacity duration-300 sm:left-auto",
        style.wrapper,
        mounted ? "opacity-100" : "opacity-0",
      )}
    >
      <div className={cn("pointer-events-auto", style.container)}>
        <span className={style.label}>Hablemos</span>
        {ctas.map((cta) => (
          <a
            key={cta.href}
            href={cta.href}
            target={cta.href.startsWith("mailto:") ? undefined : "_self"}
            className={cn(
              style.ctaBase,
              cta.primary ? style.ctaPrimary : style.ctaSecondary,
            )}
          >
            {cta.label}
          </a>
        ))}
      </div>
    </div>
  );
}
