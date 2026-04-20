import Image from "next/image";

import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

/**
 * Per-aesthetic treatment for the portfolio cards. Cover images, date
 * chip and destination (detail page vs. external link vs. text-only)
 * are computed once per item.
 */
const STYLES: Record<
  PublicProfile["aesthetic"],
  {
    grid: string;
    card: string;
    imageWrap: string;
    imageClass: string;
    title: string;
    description: string;
    meta: string;
    link: string;
  }
> = {
  minimal: {
    grid: "grid gap-4 sm:grid-cols-2",
    card: "group h-full overflow-hidden rounded-aesthetic-base border border-aesthetic-fg/10 bg-aesthetic-bg transition hover:border-aesthetic-accent",
    imageWrap: "relative aspect-[4/3] w-full overflow-hidden border-b border-aesthetic-fg/10",
    imageClass: "object-cover transition duration-500 group-hover:scale-[1.02]",
    title: "font-aesthetic-display text-lg text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/75",
    meta: "text-[11px] uppercase tracking-wide text-aesthetic-muted",
    link: "inline-block text-xs text-aesthetic-accent",
  },
  editorial: {
    grid: "grid gap-6 sm:grid-cols-2",
    card: "group h-full border border-aesthetic-fg/20 bg-aesthetic-bg transition",
    imageWrap: "relative aspect-[4/5] w-full overflow-hidden",
    imageClass: "object-cover transition duration-700 group-hover:scale-[1.03]",
    title: "font-aesthetic-display text-xl leading-tight",
    description: "italic text-sm text-aesthetic-fg/75",
    meta: "text-[11px] italic text-aesthetic-muted",
    link: "text-xs uppercase tracking-wider text-aesthetic-accent",
  },
  bold: {
    grid: "grid gap-4 sm:grid-cols-2",
    card: "group h-full overflow-hidden border-2 border-aesthetic-fg bg-aesthetic-bg shadow-[4px_4px_0_0_var(--aesthetic-color-fg)] transition",
    imageWrap: "relative aspect-square w-full overflow-hidden border-b-2 border-aesthetic-fg",
    imageClass:
      "object-cover contrast-125 grayscale transition duration-500 group-hover:grayscale-0 group-hover:contrast-100",
    title: "font-aesthetic-display text-xl uppercase leading-[0.95] text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/80",
    meta: "text-[10px] font-bold uppercase tracking-[0.2em] text-aesthetic-accent",
    link: "text-[11px] font-bold uppercase tracking-widest text-aesthetic-accent",
  },
  playful: {
    grid: "grid gap-5 sm:grid-cols-2",
    card: "group h-full overflow-hidden rounded-3xl border border-aesthetic-fg/10 bg-aesthetic-bg shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5",
    imageWrap: "relative aspect-[4/3] w-full overflow-hidden",
    imageClass: "object-cover transition duration-500 group-hover:scale-105",
    title: "font-aesthetic-display text-lg text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/75",
    meta: "text-[11px] text-aesthetic-muted",
    link: "text-xs text-aesthetic-accent",
  },
  corporate: {
    grid: "grid gap-4 sm:grid-cols-2",
    card: "group h-full overflow-hidden rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg shadow-sm transition hover:shadow-md",
    imageWrap: "relative aspect-[4/3] w-full overflow-hidden",
    imageClass: "object-cover transition duration-300 group-hover:scale-[1.01]",
    title: "font-aesthetic-display text-lg text-aesthetic-fg",
    description: "text-sm text-aesthetic-fg/75",
    meta: "text-[11px] uppercase tracking-wide text-aesthetic-muted",
    link: "text-xs text-aesthetic-accent",
  },
  artistic: {
    grid: "grid gap-6 sm:grid-cols-2",
    card: "group h-full overflow-hidden rounded-[20px_4px_20px_4px] border border-aesthetic-fg/15 bg-aesthetic-bg transition",
    imageWrap: "relative aspect-[5/6] w-full overflow-hidden",
    imageClass: "object-cover contrast-110 saturate-110 transition duration-700 group-hover:scale-[1.04]",
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
        {sorted.map((item) => (
          <li key={item.id}>
            <PortfolioCard item={item} style={style} handle={profile.handle} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PortfolioCard({
  item,
  style,
  handle,
}: {
  item: PublicProfile["portfolio"][number];
  style: (typeof STYLES)[PublicProfile["aesthetic"]];
  handle: string;
}) {
  const dateLabel = formatDate(item.createdAt);
  const linkTarget = item.hasDetailPage
    ? { href: `/${handle}/work/${item.id}`, external: false, label: "Ver proyecto →" }
    : item.link
      ? { href: item.link, external: true, label: "Ver externo ↗" }
      : null;

  const body = (
    <article className={cn(style.card, "flex flex-col")}>
      {item.image && (
        <div className={style.imageWrap}>
          <Image
            src={item.image.url}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className={style.imageClass}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
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
