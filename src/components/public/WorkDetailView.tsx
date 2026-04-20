import Image from "next/image";

import type { PublicPortfolioItem, PublicProfile } from "@/lib/profile/public";
import { embedUrlFor } from "@/lib/profile/video-embed";
import { cn } from "@/lib/utils";

/**
 * Per-aesthetic layout tokens for the project detail page. Each theme
 * gets its own feel for hero, chapter separator, image gallery and
 * video frame so the page reads native to the profile it came from.
 */
const STYLES: Record<
  PublicProfile["aesthetic"],
  {
    backLink: string;
    eyebrow: string;
    title: string;
    intro: string;
    meta: string;
    divider: string;
    hero: string;
    longText: string;
    galleryGrid: string;
    galleryItem: string;
    videoFrame: string;
  }
> = {
  minimal: {
    backLink: "text-sm text-aesthetic-muted hover:text-aesthetic-fg",
    eyebrow: "text-xs font-medium uppercase tracking-widest text-aesthetic-muted",
    title: "font-aesthetic-display text-5xl leading-[1.05] text-aesthetic-fg sm:text-6xl",
    intro: "max-w-2xl text-lg leading-relaxed text-aesthetic-fg/80",
    meta: "text-xs uppercase tracking-wider text-aesthetic-muted",
    divider: "h-px w-12 bg-aesthetic-fg/30",
    hero: "relative aspect-[16/9] w-full overflow-hidden rounded-aesthetic-base border border-aesthetic-fg/10",
    longText:
      "max-w-3xl whitespace-pre-line text-base leading-relaxed text-aesthetic-fg/80",
    galleryGrid: "grid gap-3 sm:grid-cols-2",
    galleryItem:
      "relative aspect-[4/3] overflow-hidden rounded-aesthetic-base border border-aesthetic-fg/10",
    videoFrame:
      "relative aspect-video w-full overflow-hidden rounded-aesthetic-base border border-aesthetic-fg/10 bg-black",
  },
  editorial: {
    backLink:
      "text-sm italic text-aesthetic-muted underline-offset-4 hover:text-aesthetic-fg hover:underline",
    eyebrow:
      "font-aesthetic-display text-sm italic tracking-wide text-aesthetic-accent",
    title: "font-aesthetic-display text-5xl leading-[1.02] text-aesthetic-fg sm:text-7xl",
    intro:
      "max-w-2xl border-l-2 border-aesthetic-accent pl-4 text-lg italic leading-relaxed text-aesthetic-fg/85",
    meta: "text-xs italic tracking-wide text-aesthetic-muted",
    divider: "h-[2px] w-20 bg-aesthetic-accent",
    hero: "relative aspect-[21/9] w-full overflow-hidden border-y-2 border-aesthetic-fg/20",
    longText:
      "columns-1 max-w-3xl gap-8 text-base leading-[1.75] text-aesthetic-fg/85 whitespace-pre-line sm:columns-2",
    galleryGrid: "grid gap-4 sm:grid-cols-3 [grid-auto-rows:10rem]",
    galleryItem: "relative overflow-hidden border border-aesthetic-fg/20",
    videoFrame:
      "relative aspect-video w-full overflow-hidden border-2 border-aesthetic-fg/20 bg-black",
  },
  bold: {
    backLink:
      "text-xs font-bold uppercase tracking-[0.25em] text-aesthetic-fg hover:text-aesthetic-accent",
    eyebrow: "text-xs font-bold uppercase tracking-[0.3em] text-aesthetic-accent",
    title:
      "font-aesthetic-display text-6xl uppercase leading-[0.92] text-aesthetic-fg sm:text-8xl",
    intro:
      "max-w-2xl border-l-4 border-aesthetic-accent pl-4 text-lg font-semibold uppercase leading-tight tracking-wide text-aesthetic-fg/90",
    meta: "text-[11px] font-bold uppercase tracking-[0.25em] text-aesthetic-accent",
    divider: "h-1 w-24 bg-aesthetic-accent",
    hero: "relative aspect-[3/2] w-full overflow-hidden border-4 border-aesthetic-fg shadow-[8px_8px_0_0_var(--aesthetic-accent)]",
    longText:
      "max-w-3xl whitespace-pre-line text-base leading-[1.7] text-aesthetic-fg/90",
    galleryGrid: "grid gap-2 sm:grid-cols-2",
    galleryItem:
      "relative aspect-square overflow-hidden border-2 border-aesthetic-fg",
    videoFrame:
      "relative aspect-video w-full overflow-hidden border-[3px] border-aesthetic-fg bg-black shadow-[6px_6px_0_0_var(--aesthetic-accent)]",
  },
  playful: {
    backLink:
      "text-sm text-aesthetic-muted hover:text-aesthetic-fg",
    eyebrow: "text-xs font-medium uppercase tracking-wider text-aesthetic-muted",
    title: "font-aesthetic-display text-5xl leading-tight text-aesthetic-fg sm:text-6xl",
    intro: "max-w-2xl text-lg text-aesthetic-fg/85",
    meta: "text-[11px] text-aesthetic-muted",
    divider: "h-0.5 w-12 rounded-full bg-aesthetic-accent",
    hero: "relative aspect-[16/9] w-full overflow-hidden rounded-3xl",
    longText: "max-w-3xl whitespace-pre-line text-base leading-relaxed text-aesthetic-fg/80",
    galleryGrid: "grid gap-4 sm:grid-cols-2",
    galleryItem: "relative aspect-[4/3] overflow-hidden rounded-2xl",
    videoFrame:
      "relative aspect-video w-full overflow-hidden rounded-3xl bg-black",
  },
  corporate: {
    backLink: "text-sm text-aesthetic-muted hover:text-aesthetic-fg",
    eyebrow: "text-xs font-medium uppercase tracking-wide text-aesthetic-muted",
    title: "font-aesthetic-display text-4xl leading-tight text-aesthetic-fg sm:text-5xl",
    intro: "max-w-2xl text-base leading-relaxed text-aesthetic-fg/85",
    meta: "text-xs text-aesthetic-muted",
    divider: "h-px w-12 bg-aesthetic-accent",
    hero: "relative aspect-[16/9] w-full overflow-hidden rounded-md border border-aesthetic-fg/15",
    longText: "max-w-3xl whitespace-pre-line text-base leading-relaxed text-aesthetic-fg/85",
    galleryGrid: "grid gap-3 sm:grid-cols-3",
    galleryItem: "relative aspect-[4/3] overflow-hidden rounded-md border border-aesthetic-fg/15",
    videoFrame:
      "relative aspect-video w-full overflow-hidden rounded-md border border-aesthetic-fg/15 bg-black",
  },
  artistic: {
    backLink: "text-sm italic text-aesthetic-muted hover:text-aesthetic-fg",
    eyebrow: "text-xs italic tracking-wide text-aesthetic-muted",
    title: "font-aesthetic-display text-6xl leading-[1.02] text-aesthetic-fg sm:text-7xl",
    intro: "max-w-2xl text-lg italic leading-relaxed text-aesthetic-fg/80",
    meta: "text-[11px] italic text-aesthetic-muted",
    divider: "h-px w-16 bg-aesthetic-accent",
    hero: "relative aspect-[3/2] w-full overflow-hidden rounded-[32px_8px_32px_8px]",
    longText:
      "max-w-3xl whitespace-pre-line text-base leading-relaxed text-aesthetic-fg/80 first-letter:font-aesthetic-display first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-none",
    galleryGrid: "grid gap-6 sm:grid-cols-3 [grid-auto-rows:9rem]",
    galleryItem: "relative overflow-hidden rounded-[16px_4px_16px_4px]",
    videoFrame:
      "relative aspect-video w-full overflow-hidden rounded-[20px_6px_20px_6px] bg-black",
  },
};

const EDITORIAL_SPANS = ["row-span-3", "row-span-2", "row-span-3", "row-span-2", "row-span-3"];

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function WorkDetailView({
  profile,
  item,
}: {
  profile: PublicProfile;
  item: PublicPortfolioItem;
}) {
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;
  const detail = item.detail;
  const dateLabel = formatDate(item.createdAt);
  const isSpanLayout =
    profile.aesthetic === "editorial" || profile.aesthetic === "artistic";

  return (
    <article className="space-y-14 sm:space-y-20">
      <header className="space-y-5">
        <a href={`/${profile.handle}`} className={cn("inline-flex items-center gap-1", style.backLink)}>
          ← Volver al perfil
        </a>
        <div className="space-y-3">
          <span className={style.eyebrow}>Proyecto</span>
          <h1 className={style.title}>{item.title}</h1>
          <span className={style.divider} aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-baseline gap-4">
          {dateLabel && <span className={style.meta}>{dateLabel}</span>}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-aesthetic-accent hover:opacity-90"
            >
              Ver enlace externo ↗
            </a>
          )}
        </div>
        {item.description && <p className={style.intro}>{item.description}</p>}
      </header>

      {item.image && (
        <div className={style.hero}>
          <Image
            src={item.image.url}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {detail?.longDescription && (
        <section>
          <p className={style.longText}>{detail.longDescription}</p>
        </section>
      )}

      {detail && detail.videos.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-aesthetic-display text-2xl">Vídeos</h2>
          <div className="space-y-6">
            {detail.videos.map((v, i) => (
              <VideoFrame key={`${v.url}-${i}`} video={v} className={style.videoFrame} />
            ))}
          </div>
        </section>
      )}

      {detail && detail.images.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-aesthetic-display text-2xl">Galería</h2>
          <div className={style.galleryGrid}>
            {detail.images.map((img, i) => (
              <div
                key={img.path}
                className={cn(
                  style.galleryItem,
                  isSpanLayout ? EDITORIAL_SPANS[i % EDITORIAL_SPANS.length] : "",
                )}
              >
                <Image
                  src={img.url}
                  alt={`${item.title} — ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function VideoFrame({
  video,
  className,
}: {
  video: PublicPortfolioItem["detail"] extends infer T
    ? T extends { videos: (infer V)[] }
      ? V
      : never
    : never;
  className: string;
}) {
  if (video.provider === "direct") {
    return (
      <div className={className}>
        <video
          src={video.url}
          controls
          playsInline
          className="h-full w-full object-contain"
        />
      </div>
    );
  }
  const embed = embedUrlFor(video.url, video.provider);
  if (!embed) return null;
  return (
    <div className={className}>
      <iframe
        src={embed}
        title="Vídeo del proyecto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="h-full w-full"
      />
    </div>
  );
}
