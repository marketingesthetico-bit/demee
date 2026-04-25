import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

/**
 * Per-aesthetic layout for the About block. Differs not just in colour
 * and type but in *structure*:
 *
 * - minimal   → vertical, generous space, plain pill skills
 * - editorial → drop-cap on the bio, italic chip skills with separators
 * - bold      → tight block, skills as caps tiles in a 3-col grid
 * - playful   → bio inside a coloured callout, skills as bubble pills
 * - corporate → bio + skills side-by-side on lg, skills as compact rows
 * - artistic  → numbered skills with hanging numerals, italic body
 */
type AestheticStyle = {
  /** Outer wrapper. Drives the side-by-side layout for corporate. */
  root: string;
  /** Inner wrapper for the bio block. */
  bio: string;
  /** First-letter / drop-cap treatment, applied to the first <p>. */
  bioFirstChar: string;
  /** Bio paragraph text classes. */
  bioText: string;
  /** Outer wrapper for the skills block (column). */
  skillsBlock: string;
  /** Heading for both bio + skills — kept in sync for visual rhythm. */
  heading: string;
  /** The list of skill chips. */
  skillsList: string;
  /** A single skill chip. */
  skillItem: string;
};

const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    root: "space-y-6",
    bio: "space-y-3",
    bioFirstChar: "",
    bioText: "whitespace-pre-line text-aesthetic-fg/80",
    skillsBlock: "space-y-3",
    heading: "font-aesthetic-display text-2xl",
    skillsList: "flex flex-wrap gap-2",
    skillItem:
      "rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-1 text-sm text-aesthetic-fg/80",
  },
  editorial: {
    root: "space-y-7",
    bio: "space-y-3",
    // Drop-cap pulled with float on the very first paragraph.
    bioFirstChar:
      "first-letter:float-left first-letter:mr-2 first-letter:font-aesthetic-display first-letter:text-6xl first-letter:leading-[0.9] first-letter:text-aesthetic-accent",
    bioText: "whitespace-pre-line text-aesthetic-fg/80",
    skillsBlock: "space-y-3 border-t border-aesthetic-fg/15 pt-5",
    heading: "font-aesthetic-display text-2xl",
    skillsList:
      "flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm italic text-aesthetic-fg/80",
    skillItem: "after:ml-2 after:text-aesthetic-muted after:content-['/'] last:after:hidden",
  },
  bold: {
    root: "space-y-5",
    bio: "space-y-3",
    bioFirstChar: "",
    bioText:
      "whitespace-pre-line text-base font-medium leading-relaxed text-aesthetic-fg",
    skillsBlock: "space-y-4",
    heading:
      "font-aesthetic-display text-2xl uppercase leading-tight tracking-tight",
    // Tight grid of caps tiles — strong rhythm, dense.
    skillsList: "grid grid-cols-2 gap-2 sm:grid-cols-3",
    skillItem:
      "border-2 border-aesthetic-fg bg-aesthetic-bg px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-aesthetic-fg",
  },
  playful: {
    root: "space-y-6",
    bio: "rounded-3xl bg-aesthetic-fg/[0.04] p-6",
    bioFirstChar: "",
    bioText: "whitespace-pre-line text-aesthetic-fg/85",
    skillsBlock: "space-y-3",
    heading: "font-aesthetic-display text-2xl",
    skillsList: "flex flex-wrap gap-2",
    skillItem:
      "rounded-full bg-aesthetic-accent/10 px-4 py-1.5 text-sm font-medium text-aesthetic-accent",
  },
  corporate: {
    // Side-by-side on lg: bio takes ⅔ of the row, skills the right ⅓.
    root: "grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-10",
    bio: "space-y-3",
    bioFirstChar: "",
    bioText: "whitespace-pre-line leading-relaxed text-aesthetic-fg/80",
    skillsBlock: "space-y-3 lg:border-l lg:border-aesthetic-fg/10 lg:pl-8",
    heading: "font-aesthetic-display text-xl",
    // One per row — reads as a tidy capability list, not a tag cloud.
    skillsList: "flex flex-col gap-1.5 text-sm",
    skillItem:
      "flex items-center gap-2 text-aesthetic-fg/85 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-aesthetic-accent before:content-['']",
  },
  artistic: {
    root: "space-y-7",
    bio: "space-y-3",
    bioFirstChar: "",
    bioText:
      "whitespace-pre-line text-lg italic leading-[1.7] text-aesthetic-fg/85",
    skillsBlock: "space-y-3",
    heading: "font-aesthetic-display text-2xl",
    // Numbered list — counter feels like a gallery catalog.
    skillsList:
      "grid gap-x-6 gap-y-2 sm:grid-cols-2 [counter-reset:skills]",
    skillItem:
      "flex items-baseline gap-3 text-sm text-aesthetic-fg/85 before:font-aesthetic-display before:text-aesthetic-accent before:[counter-increment:skills] before:[content:counter(skills,decimal-leading-zero)]",
  },
};

export function AboutSection({ profile }: { profile: PublicProfile }) {
  if (!profile.about.bio && profile.about.skills.length === 0) return null;
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  return (
    <section className={style.root}>
      {profile.about.bio && (
        <div className={style.bio}>
          <h2 className={style.heading}>Sobre mí</h2>
          <p className={cn(style.bioText, style.bioFirstChar)}>
            {profile.about.bio}
          </p>
        </div>
      )}

      {profile.about.skills.length > 0 && (
        <div className={style.skillsBlock}>
          <h2 className={style.heading}>Lo que hago</h2>
          <ul className={style.skillsList}>
            {profile.about.skills.map((skill) => (
              <li key={skill} className={style.skillItem}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
