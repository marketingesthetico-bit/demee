import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

import { PlayfulSparkle } from "../aesthetics/PlayfulDecorations";

const SOCIAL_LABELS: Record<keyof PublicProfile["contact"]["social"], string> = {
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  instagram: "Instagram",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Web",
};

/**
 * Per-aesthetic structural layout for the contact block. Beyond colour
 * and chip styling, the *composition* differs: minimal/corporate use a
 * one-row horizontal arrangement, editorial stacks with a rule between
 * intro and CTAs, bold becomes a full-width banner, playful centers
 * everything, artistic goes vertical with asymmetric CTA placement.
 */
type AestheticStyle = {
  /** Section container — drives the overall composition. */
  root: string;
  /** Wrapper around heading + subtitle. */
  intro: string;
  heading: string;
  subtitle: string;
  /** Wrapper around all CTAs. */
  ctas: string;
  /** Default chip (email, social, secondary actions). */
  chip: string;
  /** Primary CTA (typically "Pedir presupuesto"). */
  primary: string;
};

const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    root: "flex flex-col gap-4 rounded-aesthetic-base border border-aesthetic-fg/15 p-6 sm:flex-row sm:items-center sm:justify-between",
    intro: "space-y-1",
    heading: "font-aesthetic-display text-xl",
    subtitle: "text-sm text-aesthetic-muted",
    ctas: "flex flex-wrap items-center gap-2",
    chip: "rounded-aesthetic-base border border-aesthetic-fg/15 px-3 py-1.5 text-sm text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent",
    primary:
      "inline-flex items-center justify-center rounded-aesthetic-base bg-aesthetic-accent px-4 py-2 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90",
  },
  editorial: {
    // Stacked: intro sits above a hairline rule, CTAs flow under it.
    root: "space-y-5 border-y border-aesthetic-fg/20 py-7",
    intro: "space-y-1",
    heading: "font-aesthetic-display text-3xl italic",
    subtitle: "max-w-prose text-sm italic text-aesthetic-fg/75",
    ctas: "flex flex-wrap items-center gap-x-5 gap-y-2",
    chip: "text-sm text-aesthetic-fg/80 underline-offset-4 hover:text-aesthetic-accent hover:underline",
    primary:
      "inline-flex items-center gap-2 border-b-2 border-aesthetic-accent pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-aesthetic-accent hover:opacity-80",
  },
  bold: {
    // Full-width banner. Buttons are flat squares stacked horizontally.
    root: "border-2 border-aesthetic-fg bg-aesthetic-fg p-6 text-aesthetic-bg shadow-[6px_6px_0_0_var(--aesthetic-color-accent)] sm:p-8",
    intro: "space-y-1",
    heading: "font-aesthetic-display text-3xl uppercase leading-none",
    subtitle: "text-sm uppercase tracking-[0.16em] text-aesthetic-bg/70",
    ctas: "mt-5 flex flex-wrap gap-2",
    chip: "border-2 border-aesthetic-bg px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-aesthetic-bg hover:bg-aesthetic-bg hover:text-aesthetic-fg",
    primary:
      "bg-aesthetic-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-aesthetic-accent-contrast hover:opacity-90",
  },
  playful: {
    // Centered card, primary CTA gets the spotlight at the bottom.
    root: "flex flex-col items-center gap-5 rounded-3xl bg-aesthetic-accent/10 p-8 text-center",
    intro: "space-y-1",
    heading: "font-aesthetic-display text-2xl text-aesthetic-fg",
    subtitle: "max-w-sm text-sm text-aesthetic-fg/70",
    ctas: "flex flex-wrap justify-center gap-2",
    chip: "rounded-full bg-aesthetic-bg px-4 py-1.5 text-sm font-medium text-aesthetic-fg hover:scale-[1.04]",
    primary:
      "inline-flex items-center justify-center rounded-full bg-aesthetic-accent px-6 py-2.5 text-sm font-semibold text-aesthetic-accent-contrast shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] hover:scale-[1.04]",
  },
  corporate: {
    // Two-column structure: intro left, CTAs right (no border, denser).
    root: "grid gap-6 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8",
    intro: "space-y-1",
    heading: "font-aesthetic-display text-xl",
    subtitle: "text-sm text-aesthetic-muted",
    ctas: "flex flex-wrap items-center gap-2",
    chip: "rounded-md border border-aesthetic-fg/20 px-3 py-1.5 text-sm text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent",
    primary:
      "inline-flex items-center justify-center rounded-md bg-aesthetic-accent px-4 py-2 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90",
  },
  artistic: {
    // Vertical, asymmetric: CTAs hang below the intro, no surrounding
    // border — the negative space does the framing.
    root: "space-y-5 py-4",
    intro: "max-w-xl space-y-2",
    heading: "font-aesthetic-display text-3xl",
    subtitle: "text-base italic text-aesthetic-fg/75",
    ctas: "flex flex-wrap items-center gap-3 pt-2",
    chip: "rounded-[12px_3px_12px_3px] border border-aesthetic-fg/20 px-4 py-2 text-sm text-aesthetic-fg/80 hover:border-aesthetic-fg",
    primary:
      "inline-flex items-center justify-center rounded-[12px_3px_12px_3px] bg-aesthetic-accent px-5 py-2.5 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90",
  },
};

export function ContactSection({ profile }: { profile: PublicProfile }) {
  const socialEntries = Object.entries(profile.contact.social).filter(
    (entry): entry is [keyof PublicProfile["contact"]["social"], string] =>
      typeof entry[1] === "string" && entry[1].length > 0,
  );

  const hasAnyContact =
    Boolean(profile.contact.email) ||
    socialEntries.length > 0 ||
    profile.hasBudget ||
    profile.hasBooking;
  if (!hasAnyContact) return null;

  const subtitle = profile.hasBudget
    ? "Pide presupuesto y te respondo con una estimación al momento."
    : profile.hasBooking
      ? "Agenda una llamada rápida y lo vemos."
      : "Escríbeme y te respondo pronto.";

  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  const isPlayful = profile.aesthetic === "playful";

  return (
    <section className={style.root}>
      <div className={cn(style.intro, isPlayful && "relative")}>
        {isPlayful && (
          // Frame the centred heading with a pair of twinkling stars —
          // anchored to the .intro wrapper so they sit symmetrically
          // around the H2's text.
          <>
            <PlayfulSparkle
              size={14}
              className="absolute -left-7 top-1 hidden sm:block"
            />
            <PlayfulSparkle
              size={18}
              className="absolute -right-6 -top-2 hidden sm:block"
            />
          </>
        )}
        <h2 className={style.heading}>Hablemos</h2>
        <p className={style.subtitle}>{subtitle}</p>
      </div>
      <div className={style.ctas}>
        {socialEntries.map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={cn(style.chip)}
          >
            {SOCIAL_LABELS[key]}
          </a>
        ))}
        {profile.contact.email && (
          <a href={`mailto:${profile.contact.email}`} className={cn(style.chip)}>
            Email
          </a>
        )}
        {profile.hasBooking && (
          <a href={`/${profile.handle}/book`} className={cn(style.chip)}>
            Agendar
          </a>
        )}
        {profile.hasBudget && (
          <a href={`/${profile.handle}/budget`} className={cn(style.primary)}>
            Pedir presupuesto
          </a>
        )}
      </div>
    </section>
  );
}
