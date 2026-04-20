import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const LOCATION_LABEL: Record<"online" | "phone" | "in-person", string> = {
  online: "Online",
  phone: "Por teléfono",
  "in-person": "Presencial",
};

// Each aesthetic gets a visually distinct card. The goal is that the
// agenda CTA feels native to the theme rather than looking like a generic
// bootstrap button.
const STYLES: Record<
  PublicProfile["aesthetic"],
  {
    wrapper: string;
    eyebrow: string;
    title: string;
    body: string;
    chipRow: string;
    chip: string;
    cta: string;
    divider: string;
  }
> = {
  minimal: {
    wrapper:
      "flex flex-col gap-5 rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg p-6",
    eyebrow: "text-xs font-medium uppercase tracking-widest text-aesthetic-muted",
    title: "font-aesthetic-display text-3xl leading-tight",
    body: "text-aesthetic-fg/70",
    chipRow: "flex flex-wrap gap-2",
    chip: "rounded-full border border-aesthetic-fg/15 px-3 py-1 text-xs text-aesthetic-fg/70",
    cta: "inline-flex w-fit items-center gap-2 rounded-full bg-aesthetic-fg px-5 py-3 text-sm font-medium text-aesthetic-bg transition hover:opacity-90",
    divider: "h-px w-12 bg-aesthetic-fg/20",
  },
  editorial: {
    wrapper:
      "relative flex flex-col gap-6 border-y-2 border-aesthetic-fg/20 bg-aesthetic-bg py-8",
    eyebrow:
      "font-aesthetic-display text-xs italic tracking-wide text-aesthetic-accent",
    title: "font-aesthetic-display text-4xl leading-[1.05]",
    body: "max-w-xl text-base leading-relaxed text-aesthetic-fg/75",
    chipRow: "flex flex-wrap gap-3 text-sm italic text-aesthetic-muted",
    chip: "before:mr-2 before:content-['·'] first:before:hidden",
    cta: "inline-flex w-fit items-center gap-2 bg-aesthetic-accent px-5 py-3 text-sm uppercase tracking-wider text-aesthetic-accent-contrast transition hover:opacity-90",
    divider: "h-px w-20 bg-aesthetic-accent",
  },
  bold: {
    wrapper:
      "relative flex flex-col gap-5 border-4 border-aesthetic-fg bg-aesthetic-bg p-6 shadow-[8px_8px_0_0_var(--aesthetic-color-fg)]",
    eyebrow: "text-[11px] font-bold uppercase tracking-[0.25em] text-aesthetic-fg",
    title: "font-aesthetic-display text-4xl uppercase leading-[0.95]",
    body: "text-aesthetic-fg/80",
    chipRow: "flex flex-wrap gap-2",
    chip: "border-2 border-aesthetic-fg px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest",
    cta: "inline-flex w-fit items-center gap-2 bg-aesthetic-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-aesthetic-accent-contrast transition hover:opacity-90",
    divider: "h-1 w-16 bg-aesthetic-accent",
  },
  playful: {
    wrapper:
      "flex flex-col gap-5 rounded-3xl border border-aesthetic-fg/10 bg-aesthetic-bg p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)]",
    eyebrow: "text-xs font-medium uppercase tracking-wider text-aesthetic-muted",
    title: "font-aesthetic-display text-3xl leading-tight",
    body: "text-aesthetic-fg/75",
    chipRow: "flex flex-wrap gap-2",
    chip: "rounded-full bg-aesthetic-fg/5 px-3 py-1 text-xs text-aesthetic-fg/70",
    cta: "inline-flex w-fit items-center gap-2 rounded-full bg-aesthetic-accent px-5 py-3 text-sm font-medium text-aesthetic-accent-contrast transition hover:scale-[1.03]",
    divider: "h-0.5 w-12 rounded-full bg-aesthetic-accent",
  },
  corporate: {
    wrapper:
      "flex flex-col gap-5 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg p-6 shadow-sm",
    eyebrow: "text-xs font-medium uppercase tracking-wide text-aesthetic-muted",
    title: "font-aesthetic-display text-3xl leading-tight",
    body: "text-aesthetic-fg/75",
    chipRow: "flex flex-wrap gap-2",
    chip: "rounded-md border border-aesthetic-fg/15 px-2.5 py-1 text-xs text-aesthetic-fg/70",
    cta: "inline-flex w-fit items-center gap-2 rounded-md bg-aesthetic-accent px-5 py-3 text-sm font-medium text-aesthetic-accent-contrast transition hover:opacity-90",
    divider: "h-px w-12 bg-aesthetic-accent",
  },
  artistic: {
    wrapper:
      "flex flex-col gap-5 rounded-[24px_4px_24px_4px] border border-aesthetic-fg/15 bg-aesthetic-bg p-6",
    eyebrow: "text-xs italic tracking-wide text-aesthetic-muted",
    title: "font-aesthetic-display text-4xl leading-tight",
    body: "text-aesthetic-fg/75",
    chipRow: "flex flex-wrap gap-2",
    chip:
      "rounded-[12px_2px_12px_2px] border border-aesthetic-fg/15 px-3 py-1 text-xs text-aesthetic-fg/70",
    cta: "inline-flex w-fit items-center gap-2 rounded-[16px_4px_16px_4px] bg-aesthetic-accent px-5 py-3 text-sm font-medium text-aesthetic-accent-contrast transition hover:opacity-90",
    divider: "h-px w-16 bg-aesthetic-accent",
  },
};

export function BookingTeaserSection({ profile }: { profile: PublicProfile }) {
  if (!profile.bookingTeaser) return null;
  const teaser = profile.bookingTeaser;
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  return (
    <section className={style.wrapper}>
      <div className="space-y-3">
        <span className={style.eyebrow}>Agenda una llamada</span>
        <h2 className={style.title}>{teaser.name}</h2>
        <span className={style.divider} aria-hidden="true" />
      </div>

      {teaser.description && <p className={style.body}>{teaser.description}</p>}

      <div className={style.chipRow}>
        <span className={style.chip}>{teaser.durationMinutes} min</span>
        <span className={style.chip}>{LOCATION_LABEL[teaser.locationType]}</span>
      </div>

      <a href={`/${profile.handle}/book`} className={cn(style.cta)}>
        Ver horarios disponibles
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
