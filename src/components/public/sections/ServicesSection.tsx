import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const UNIT_LABEL: Record<NonNullable<PublicProfile["services"][number]["unit"]>, string> = {
  project: "proyecto",
  hour: "hora",
  month: "mes",
};

/**
 * Per-aesthetic structural layout for the services list. Three families
 * of layout are in play, mapped to fit each aesthetic's character:
 *
 *   minimal   → 2-col grid of card boxes
 *   editorial → divide-y list with hanging italic price
 *   bold      → 1-col full-width stripe bars (poster menu)
 *   playful   → 2-col grid of soft rounded cards
 *   corporate → 3-col grid (denser, shows breadth at a glance)
 *   artistic  → 1-col numbered list with hanging numerals
 */
type Layout = "grid-2" | "grid-3" | "divider-list" | "stripe-bars" | "numbered-list";

type AestheticStyle = {
  layout: Layout;
  /** Container classes (ul). */
  list: string;
  /** Card / row classes (li). */
  item: string;
  /** Inner row that holds name + price. */
  head: string;
  name: string;
  price: string;
  description: string;
};

const STYLES: Record<PublicProfile["aesthetic"], AestheticStyle> = {
  minimal: {
    layout: "grid-2",
    list: "grid gap-3 sm:grid-cols-2",
    item: "space-y-2 rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg p-4",
    head: "flex flex-wrap items-baseline justify-between gap-2",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm text-aesthetic-muted",
    description: "text-sm text-aesthetic-fg/80",
  },
  editorial: {
    layout: "divider-list",
    list: "divide-y divide-aesthetic-fg/20 border-y border-aesthetic-fg/20",
    item: "py-4",
    head: "flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
    name: "font-aesthetic-display text-2xl text-aesthetic-fg",
    price:
      "shrink-0 font-aesthetic-display text-base italic text-aesthetic-accent",
    description: "mt-2 max-w-prose text-sm text-aesthetic-fg/75",
  },
  bold: {
    layout: "stripe-bars",
    // Single column of full-width stripe bars — reads like a poster menu.
    list: "flex flex-col gap-3",
    item: "border-2 border-aesthetic-fg bg-aesthetic-bg p-5 shadow-[5px_5px_0_0_var(--aesthetic-color-fg)]",
    head: "flex flex-wrap items-baseline justify-between gap-3",
    name: "font-aesthetic-display text-2xl uppercase leading-tight text-aesthetic-fg",
    price:
      "shrink-0 bg-aesthetic-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-aesthetic-accent-contrast",
    description: "mt-3 text-sm text-aesthetic-fg/80",
  },
  playful: {
    layout: "grid-2",
    list: "grid gap-4 sm:grid-cols-2",
    item: "space-y-2 rounded-2xl bg-aesthetic-fg/[0.04] p-5 transition hover:bg-aesthetic-fg/[0.06]",
    head: "flex flex-wrap items-baseline justify-between gap-2",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm font-medium text-aesthetic-accent",
    description: "text-sm text-aesthetic-fg/75",
  },
  corporate: {
    layout: "grid-3",
    // 3-col on lg signals breadth and efficiency. 2-col fallback on sm.
    list: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
    item: "flex flex-col gap-2 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg p-4 shadow-sm",
    head: "flex flex-wrap items-baseline justify-between gap-2",
    name: "font-aesthetic-display text-base text-aesthetic-fg",
    price:
      "shrink-0 text-xs font-semibold uppercase tracking-wide text-aesthetic-accent",
    description: "text-sm text-aesthetic-fg/80",
  },
  artistic: {
    layout: "numbered-list",
    // CSS counter for elegant 01, 02, 03 prefixes — hangs in a left margin.
    list: "flex flex-col gap-5 [counter-reset:services]",
    item: "grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-aesthetic-fg/15 pb-5 last:border-b-0 before:font-aesthetic-display before:text-2xl before:text-aesthetic-accent before:[counter-increment:services] before:[content:counter(services,decimal-leading-zero)]",
    head: "flex flex-wrap items-baseline justify-between gap-2",
    name: "font-aesthetic-display text-xl text-aesthetic-fg",
    price: "shrink-0 text-sm italic text-aesthetic-accent",
    description: "mt-2 text-sm text-aesthetic-fg/80",
  },
};

export function ServicesSection({ profile }: { profile: PublicProfile }) {
  if (profile.services.length === 0) return null;
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;
  // The numbered layout puts the counter pseudo-element in the FIRST
  // grid track, so the actual content has to live in a single right-track
  // wrapper — otherwise siblings end up in their own pseudo cells.
  const wrapsContent = style.layout === "numbered-list";

  return (
    <section className="space-y-5">
      <h2 className="font-aesthetic-display text-2xl">Servicios</h2>
      <ul className={cn(style.list)}>
        {profile.services.map((service) => {
          const inner = (
            <>
              <div className={style.head}>
                <span className={style.name}>{service.name}</span>
                {service.priceFrom !== null && (
                  <span className={style.price}>
                    desde {service.priceFrom}€
                    {service.unit ? ` / ${UNIT_LABEL[service.unit]}` : ""}
                  </span>
                )}
              </div>
              {service.description && (
                <p className={style.description}>{service.description}</p>
              )}
            </>
          );

          return (
            <li key={service.name} className={style.item}>
              {wrapsContent ? <div className="space-y-0">{inner}</div> : inner}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
