import Image from "next/image";

import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

/**
 * Per-aesthetic treatment for the portfolio cards. Two axes of
 * variation: the *grid* (1-col vs 2-col vs hero+grid) and the *card*
 * (vertical stack vs horizontal split). Combined, the six aesthetics
 * read as genuinely different page structures, not the same template
 * recoloured.
 *
 *   minimal   → 2-col, vertical cards
 *   editorial → first card hero (col-span-2, wider aspect), then 2-col
 *   bold      → 1-col, vertical, full-width poster cards
 *   playful   → 2-col, vertical, generous gap, soft shadow
 *   corporate → 1-col, *horizontal* cards (image left, text right)
 *   artistic  → first card hero (col-span-2, wider aspect), then 2-col
 */
type CardLayout = "vertical" | "horizontal";

type AestheticStyle = {
  grid: string;
  cardLayout: CardLayout;
  /** Whether the first card spans both columns and gets a wider image. */
  heroFirst: boolean;
  card: string;
  /** Aspect ratio + width classes for the image wrapper, vertical card. */
  imageWrapVertical: string;
  /** Aspect ratio override when the card is the hero (col-span-2). */
  imageWrapVerticalHero: string;
  /** Aspect ratio + width classes for horizontal cards. */
  imageWrapHorizontal: string;
  imageClass: string;
  body: string;
  title: string;
  description: string;
  meta: string;
  link: string;
};

const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    grid: "grid gap-4 sm:grid-cols-2",
    cardLayout: "vertical",
    heroFirst: false,
    card: "group h-full overflow-hidden rounded-aesthetic-base border border-aesthetic-fg/10 bg-aesthetic-bg transition hover:border-aesthetic-accent",
    imageWrapVertical:
      "relative aspect-[4/3] w-full overflow-hidden border-b border-aesthetic-fg/10",
    imageWrapVerticalHero: "",
    imageWrapHorizontal: "",
    imageClass: "object-cover transition duration-500 group-hover:scale-[1.02]",
    body: "flex flex-1 flex-col gap-2 p-4",
    title: "font-aesthetic-display text-lg text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/75",
    meta: "text-[11px] uppercase tracking-wide text-aesthetic-muted",
    link: "inline-block text-xs text-aesthetic-accent",
  },
  editorial: {
    grid: "grid gap-6 sm:grid-cols-2",
    cardLayout: "vertical",
    heroFirst: true,
    card: "group h-full border border-aesthetic-fg/20 bg-aesthetic-bg transition",
    imageWrapVertical: "relative aspect-[4/5] w-full overflow-hidden",
    imageWrapVerticalHero: "relative aspect-[16/9] w-full overflow-hidden",
    imageWrapHorizontal: "",
    imageClass: "object-cover transition duration-700 group-hover:scale-[1.03]",
    body: "flex flex-1 flex-col gap-2 p-5",
    title: "font-aesthetic-display text-xl leading-tight",
    description: "italic text-sm text-aesthetic-fg/75",
    meta: "text-[11px] italic text-aesthetic-muted",
    link: "text-xs uppercase tracking-wider text-aesthetic-accent",
  },
  bold: {
    // Single column only — every piece becomes a poster.
    grid: "grid gap-6",
    cardLayout: "vertical",
    heroFirst: false,
    card: "group h-full overflow-hidden border-2 border-aesthetic-fg bg-aesthetic-bg shadow-[6px_6px_0_0_var(--aesthetic-color-fg)] transition",
    imageWrapVertical:
      "relative aspect-[16/10] w-full overflow-hidden border-b-2 border-aesthetic-fg",
    imageWrapVerticalHero: "",
    imageWrapHorizontal: "",
    imageClass:
      "object-cover contrast-125 grayscale transition duration-500 group-hover:grayscale-0 group-hover:contrast-100",
    body: "flex flex-1 flex-col gap-3 p-6",
    title: "font-aesthetic-display text-3xl uppercase leading-[0.95] text-aesthetic-fg",
    description: "max-w-prose text-sm text-aesthetic-fg/80",
    meta: "text-[10px] font-bold uppercase tracking-[0.22em] text-aesthetic-accent",
    link: "self-start border-2 border-aesthetic-fg bg-aesthetic-fg px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-aesthetic-bg",
  },
  playful: {
    grid: "grid gap-5 sm:grid-cols-2",
    cardLayout: "vertical",
    heroFirst: false,
    card: "group h-full overflow-hidden rounded-3xl border border-aesthetic-fg/10 bg-aesthetic-bg shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5",
    imageWrapVertical: "relative aspect-[4/3] w-full overflow-hidden",
    imageWrapVerticalHero: "",
    imageWrapHorizontal: "",
    imageClass: "object-cover transition duration-500 group-hover:scale-105",
    body: "flex flex-1 flex-col gap-2 p-5",
    title: "font-aesthetic-display text-lg text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/75",
    meta: "text-[11px] text-aesthetic-muted",
    link: "text-xs text-aesthetic-accent",
  },
  corporate: {
    // Horizontal cards: image left, text right. Dense and scannable.
    grid: "grid gap-3",
    cardLayout: "horizontal",
    heroFirst: false,
    card: "group h-full overflow-hidden rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg shadow-sm transition hover:shadow-md",
    imageWrapVertical: "",
    imageWrapVerticalHero: "",
    imageWrapHorizontal:
      "relative aspect-[4/3] w-32 shrink-0 overflow-hidden sm:w-44 lg:w-56",
    imageClass: "object-cover transition duration-300 group-hover:scale-[1.02]",
    body: "flex flex-1 flex-col gap-1.5 p-4",
    title: "font-aesthetic-display text-base text-aesthetic-fg sm:text-lg",
    description: "line-clamp-2 text-sm text-aesthetic-fg/75",
    meta: "text-[11px] uppercase tracking-wide text-aesthetic-muted",
    link: "self-start text-xs font-medium text-aesthetic-accent",
  },
  artistic: {
    grid: "grid gap-6 sm:grid-cols-2",
    cardLayout: "vertical",
    heroFirst: true,
    card: "group h-full overflow-hidden rounded-[20px_4px_20px_4px] border border-aesthetic-fg/15 bg-aesthetic-bg transition",
    imageWrapVertical: "relative aspect-[5/6] w-full overflow-hidden",
    imageWrapVerticalHero: "relative aspect-[16/8] w-full overflow-hidden",
    imageWrapHorizontal: "",
    imageClass:
      "object-cover contrast-110 saturate-110 transition duration-700 group-hover:scale-[1.04]",
    body: "flex flex-1 flex-col gap-2 p-5",
    title: "font-aesthetic-display text-xl text-aesthetic-fg",
    description: "text-sm italic text-aesthetic-fg/75",
    meta: "text-[11px] italic text-aesthetic-muted",
    link: "text-xs text-aesthetic-accent",
  },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
  }).format(d);
}

export function PortfolioSection({ profile }: { profile: PublicProfile }) {
  if (profile.portfolio.length === 0) return null;
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  // Newest first. Items without createdAt land at the bottom.
  const sorted = [...profile.portfolio].sort((a, b) => {
    const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bd - ad;
  });

  return (
    <section className="space-y-5">
      <h2 className="font-aesthetic-display text-2xl">Trabajo reciente</h2>
      <ul className={style.grid}>
        {sorted.map((item, idx) => {
          const isHero = style.heroFirst && idx === 0;
          return (
            <li key={item.id} className={isHero ? "sm:col-span-2" : undefined}>
              <PortfolioCard
                item={item}
                style={style}
                handle={profile.handle}
                isHero={isHero}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PortfolioCard({
  item,
  style,
  handle,
  isHero,
}: {
  item: PublicProfile["portfolio"][number];
  style: AestheticStyle;
  handle: string;
  isHero: boolean;
}) {
  const dateLabel = formatDate(item.createdAt);
  const linkTarget = item.hasDetailPage
    ? { href: `/${handle}/work/${item.id}`, external: false, label: "Ver proyecto →" }
    : item.link
      ? { href: item.link, external: true, label: "Ver externo ↗" }
      : null;

  const horizontal = style.cardLayout === "horizontal";
  const imageWrap = horizontal
    ? style.imageWrapHorizontal
    : isHero && style.imageWrapVerticalHero
      ? style.imageWrapVerticalHero
      : style.imageWrapVertical;

  const body = (
    <article
      className={cn(
        style.card,
        "flex",
        horizontal ? "flex-row" : "flex-col",
      )}
    >
      {item.image && (
        <div className={imageWrap}>
          <Image
            src={item.image.url}
            alt={item.title}
            fill
            sizes={
              horizontal
                ? "(min-width: 1024px) 14rem, (min-width: 640px) 11rem, 8rem"
                : isHero
                  ? "(min-width: 640px) 100vw, 100vw"
                  : "(min-width: 640px) 50vw, 100vw"
            }
            className={style.imageClass}
          />
        </div>
      )}
      <div className={style.body}>
        {dateLabel && <span className={style.meta}>{dateLabel}</span>}
        <h3 className={style.title}>{item.title}</h3>
        {item.description && <p className={style.description}>{item.description}</p>}
        {linkTarget && <span className={style.link}>{linkTarget.label}</span>}
      </div>
    </article>
  );

  if (!linkTarget) return body;

  return linkTarget.external ? (
    <a
      href={linkTarget.href}
      target="_blank"
      rel="noreferrer"
      className="block h-full"
    >
      {body}
    </a>
  ) : (
    <a href={linkTarget.href} className="block h-full">
      {body}
    </a>
  );
}
