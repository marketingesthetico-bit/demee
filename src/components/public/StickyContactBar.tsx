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
  /** Positioning: mobile bottom-wide, desktop right-vertical-center. */
  wrapper: string;
  /** Container flips from flex-row (mobile) to flex-col (desktop). */
  container: string;
  /** Label always visible on desktop; hidden on tiny mobile. */
  label: string;
  /** Optional divider between label and CTAs on desktop. */
  divider: string;
  ctaBase: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

/**
 * Per-aesthetic treatment. Mobile = horizontal bottom bar. Desktop =
 * vertical column fixed to the right edge at vertical center, using the
 * empty space next to the /[handle] content (max-w-3xl content leaves
 * ~300px+ of breathing room on the right).
 */
const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-3 rounded-full border-2 border-aesthetic-fg bg-aesthetic-bg px-4 py-2 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.45)] lg:w-56 lg:flex-col lg:items-stretch lg:gap-2 lg:rounded-3xl lg:p-4",
    label:
      "hidden text-sm font-semibold text-aesthetic-fg sm:inline lg:block lg:text-center lg:text-xs lg:uppercase lg:tracking-[0.18em] lg:text-aesthetic-muted",
    divider: "hidden lg:block lg:h-px lg:w-full lg:bg-aesthetic-fg/10",
    ctaBase: "rounded-full px-4 py-2 text-sm font-medium transition lg:text-center",
    ctaPrimary: "bg-aesthetic-fg text-aesthetic-bg hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/30 text-aesthetic-fg hover:border-aesthetic-fg",
  },
  editorial: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-4 border-2 border-aesthetic-accent bg-aesthetic-bg px-5 py-3 shadow-[0_18px_42px_-18px_rgba(139,46,42,0.55)] lg:w-60 lg:flex-col lg:items-stretch lg:gap-3 lg:border-l-[6px] lg:border-y-2 lg:border-r-2 lg:p-5",
    label:
      "hidden font-aesthetic-display text-base italic text-aesthetic-accent sm:inline lg:block lg:text-center lg:text-lg",
    divider: "hidden lg:block lg:h-px lg:w-full lg:bg-aesthetic-fg/15",
    ctaBase:
      "px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition lg:text-center lg:py-2.5",
    ctaPrimary: "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "text-aesthetic-fg underline-offset-4 hover:underline lg:border lg:border-aesthetic-fg/20 lg:no-underline hover:lg:border-aesthetic-fg",
  },
  bold: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-7 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-3 border-[3px] border-aesthetic-fg bg-aesthetic-accent px-4 py-3 shadow-[6px_6px_0_0_var(--aesthetic-color-fg)] lg:w-60 lg:flex-col lg:items-stretch lg:gap-3 lg:p-5",
    label:
      "hidden text-xs font-bold uppercase tracking-[0.3em] text-aesthetic-accent-contrast sm:inline lg:block lg:text-center lg:text-sm",
    divider: "hidden lg:block lg:h-[3px] lg:w-full lg:bg-aesthetic-fg",
    ctaBase:
      "px-4 py-2 text-xs font-bold uppercase tracking-widest transition lg:text-center lg:py-3",
    ctaPrimary: "bg-aesthetic-fg text-aesthetic-bg hover:opacity-90",
    ctaSecondary:
      "border-2 border-aesthetic-accent-contrast text-aesthetic-accent-contrast hover:bg-aesthetic-accent-contrast hover:text-aesthetic-accent",
  },
  playful: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-3 rounded-3xl bg-aesthetic-accent px-5 py-3 shadow-[0_18px_45px_-16px_rgba(0,0,0,0.35)] lg:w-56 lg:flex-col lg:items-stretch lg:gap-2.5 lg:p-5",
    label:
      "hidden text-sm font-medium text-aesthetic-accent-contrast sm:inline lg:block lg:text-center",
    divider: "hidden lg:block lg:h-px lg:w-full lg:bg-aesthetic-accent-contrast/20",
    ctaBase: "rounded-full px-4 py-2 text-sm font-medium transition lg:text-center",
    ctaPrimary: "bg-aesthetic-bg text-aesthetic-fg hover:scale-[1.04]",
    ctaSecondary:
      "border border-aesthetic-accent-contrast/40 text-aesthetic-accent-contrast hover:bg-aesthetic-accent-contrast/10",
  },
  corporate: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-3 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg px-4 py-3 shadow-[0_14px_32px_-14px_rgba(0,0,0,0.3)] lg:w-56 lg:flex-col lg:items-stretch lg:gap-2 lg:p-4",
    label:
      "hidden text-sm font-medium text-aesthetic-fg sm:inline lg:block lg:text-center lg:text-xs lg:uppercase lg:tracking-wide lg:text-aesthetic-muted",
    divider: "hidden lg:block lg:h-px lg:w-full lg:bg-aesthetic-fg/10",
    ctaBase: "rounded-md px-4 py-2 text-sm font-medium transition lg:text-center",
    ctaPrimary: "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/20 text-aesthetic-fg hover:border-aesthetic-accent hover:text-aesthetic-accent",
  },
  artistic: {
    wrapper:
      "fixed bottom-4 left-4 right-4 z-30 flex justify-center lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:justify-end",
    container:
      "flex items-center gap-3 rounded-[24px_6px_24px_6px] border border-aesthetic-fg/15 bg-aesthetic-bg px-5 py-3 shadow-[0_18px_46px_-20px_rgba(0,0,0,0.35)] lg:w-56 lg:flex-col lg:items-stretch lg:gap-2.5 lg:p-5",
    label:
      "hidden text-sm italic text-aesthetic-fg sm:inline lg:block lg:text-center",
    divider: "hidden lg:block lg:h-px lg:w-full lg:bg-aesthetic-fg/10",
    ctaBase:
      "rounded-[14px_4px_14px_4px] px-4 py-2 text-sm font-medium transition lg:text-center",
    ctaPrimary: "bg-aesthetic-accent text-aesthetic-accent-contrast hover:opacity-90",
    ctaSecondary:
      "border border-aesthetic-fg/20 text-aesthetic-fg/80 hover:border-aesthetic-fg",
  },
};

export function StickyContactBar({ profile }: { profile: PublicProfile }) {
  const [mounted, setMounted] = useState(false);
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
        "pointer-events-none transition-opacity duration-300",
        style.wrapper,
        mounted ? "opacity-100" : "opacity-0",
      )}
    >
      <div className={cn("pointer-events-auto", style.container)}>
        <span className={style.label}>Hablemos</span>
        <span className={style.divider} aria-hidden="true" />
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
