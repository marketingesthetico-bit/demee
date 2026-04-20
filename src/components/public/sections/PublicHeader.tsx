import Image from "next/image";

import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const AVAILABILITY_COPY: Record<
  PublicProfile["header"]["availability"],
  { label: string; dot: string }
> = {
  available: { label: "Disponible", dot: "bg-success" },
  limited: { label: "Plazas limitadas", dot: "bg-mustard" },
  closed: { label: "Cerrado por ahora", dot: "bg-aesthetic-muted" },
};

/**
 * Per-aesthetic layout tokens for the header. Each theme gets a
 * distinct visual signature — not just different colors. Minimal is
 * the fallback for the 3 aesthetics that aren't offered in onboarding
 * yet (playful/corporate/artistic).
 */
const STYLES: Record<
  PublicProfile["aesthetic"],
  {
    root: string;
    avatarWrap: string;
    avatarPlaceholder: string;
    meta: string;
    name: string;
    headline: string;
    location: string;
  }
> = {
  minimal: {
    root: "space-y-6",
    avatarWrap: "flex flex-wrap items-center gap-4",
    avatarPlaceholder:
      "flex h-16 w-16 items-center justify-center rounded-full bg-aesthetic-fg/10 font-aesthetic-display text-xl text-aesthetic-fg",
    meta: "flex flex-col",
    name: "font-aesthetic-display text-5xl leading-tight text-aesthetic-fg sm:text-6xl",
    headline: "max-w-2xl text-xl leading-relaxed text-aesthetic-fg/80",
    location: "text-sm text-aesthetic-muted",
  },
  editorial: {
    root: "space-y-6 border-b border-aesthetic-fg/20 pb-8",
    avatarWrap: "flex flex-wrap items-center gap-5",
    avatarPlaceholder:
      "flex h-20 w-20 items-center justify-center border border-aesthetic-fg/30 font-aesthetic-display text-2xl text-aesthetic-fg",
    meta: "flex flex-col gap-1",
    name: "font-aesthetic-display text-5xl leading-[1.05] text-aesthetic-fg sm:text-7xl",
    headline:
      "max-w-2xl border-l-2 border-aesthetic-accent pl-4 text-xl italic leading-relaxed text-aesthetic-fg/80",
    location: "text-xs uppercase tracking-[0.2em] text-aesthetic-muted",
  },
  bold: {
    root: "space-y-5",
    avatarWrap: "flex flex-wrap items-center gap-4",
    avatarPlaceholder:
      "flex h-20 w-20 items-center justify-center border-2 border-aesthetic-fg bg-aesthetic-accent font-aesthetic-display text-2xl text-aesthetic-accent-contrast",
    meta: "flex flex-col gap-1",
    name: "font-aesthetic-display text-6xl uppercase leading-[0.9] text-aesthetic-fg sm:text-8xl",
    headline:
      "max-w-2xl border-l-4 border-aesthetic-accent pl-4 text-xl font-semibold uppercase leading-tight tracking-wide text-aesthetic-fg/90",
    location:
      "text-[11px] font-bold uppercase tracking-[0.25em] text-aesthetic-accent",
  },
  playful: {
    root: "space-y-6",
    avatarWrap: "flex flex-wrap items-center gap-4",
    avatarPlaceholder:
      "flex h-20 w-20 items-center justify-center rounded-full bg-aesthetic-accent font-aesthetic-display text-2xl text-aesthetic-accent-contrast",
    meta: "flex flex-col gap-1",
    name: "font-aesthetic-display text-5xl leading-tight text-aesthetic-fg sm:text-6xl",
    headline: "max-w-2xl text-xl text-aesthetic-fg/80",
    location: "text-sm text-aesthetic-muted",
  },
  corporate: {
    root: "space-y-5",
    avatarWrap: "flex flex-wrap items-center gap-4",
    avatarPlaceholder:
      "flex h-16 w-16 items-center justify-center rounded-md bg-aesthetic-fg/10 font-aesthetic-display text-xl text-aesthetic-fg",
    meta: "flex flex-col",
    name: "font-aesthetic-display text-4xl leading-tight text-aesthetic-fg sm:text-5xl",
    headline: "max-w-2xl text-lg leading-relaxed text-aesthetic-fg/80",
    location: "text-sm text-aesthetic-muted",
  },
  artistic: {
    root: "space-y-7",
    avatarWrap: "flex flex-wrap items-center gap-5",
    avatarPlaceholder:
      "flex h-20 w-20 items-center justify-center rounded-[20px_4px_20px_4px] bg-aesthetic-accent font-aesthetic-display text-2xl text-aesthetic-accent-contrast",
    meta: "flex flex-col gap-1",
    name: "font-aesthetic-display text-6xl leading-[1.02] text-aesthetic-fg sm:text-7xl",
    headline: "max-w-2xl text-xl italic leading-relaxed text-aesthetic-fg/80",
    location: "text-sm text-aesthetic-muted",
  },
};

export function PublicHeader({ profile }: { profile: PublicProfile }) {
  const availability = AVAILABILITY_COPY[profile.header.availability];
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  return (
    <header className={style.root}>
      <div className={style.avatarWrap}>
        {profile.header.photoURL ? (
          <Image
            src={profile.header.photoURL}
            alt={profile.header.name}
            width={80}
            height={80}
            className={cn(
              "object-cover",
              profile.aesthetic === "editorial" || profile.aesthetic === "bold"
                ? "h-20 w-20 rounded-none"
                : profile.aesthetic === "artistic"
                  ? "h-20 w-20 rounded-[20px_4px_20px_4px]"
                  : profile.aesthetic === "corporate"
                    ? "h-16 w-16 rounded-md"
                    : "h-16 w-16 rounded-full sm:h-20 sm:w-20",
            )}
          />
        ) : (
          <div className={style.avatarPlaceholder}>
            {profile.header.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={style.meta}>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-aesthetic-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${availability.dot}`} />
            {availability.label}
          </span>
          <span className="text-sm text-aesthetic-muted">demee.app/{profile.handle}</span>
        </div>
      </div>

      <h1 className={style.name}>{profile.header.name}</h1>

      {profile.header.headline && (
        <p className={style.headline}>{profile.header.headline}</p>
      )}

      {profile.header.location && (
        <p className={style.location}>📍 {profile.header.location}</p>
      )}
    </header>
  );
}
