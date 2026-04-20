import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const UNIT_LABEL: Record<NonNullable<PublicProfile["services"][number]["unit"]>, string> = {
  project: "proyecto",
  hour: "hora",
  month: "mes",
};

const STYLES: Record<
  PublicProfile["aesthetic"],
  {
    grid: string;
    card: string;
    name: string;
    price: string;
    description: string;
  }
> = {
  minimal: {
    grid: "grid gap-3 sm:grid-cols-2",
    card: "space-y-2 rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg p-4",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm text-aesthetic-muted",
    description: "text-sm text-aesthetic-fg/80",
  },
  editorial: {
    grid: "divide-y divide-aesthetic-fg/20 border-y border-aesthetic-fg/20",
    card: "flex flex-col gap-1.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
    name: "font-aesthetic-display text-2xl text-aesthetic-fg",
    price: "shrink-0 font-aesthetic-display text-base italic text-aesthetic-accent",
    description: "max-w-prose text-sm text-aesthetic-fg/75",
  },
  bold: {
    grid: "grid gap-2 sm:grid-cols-2",
    card: "flex flex-col gap-2 border-2 border-aesthetic-fg bg-aesthetic-bg p-4 shadow-[4px_4px_0_0_var(--aesthetic-color-fg)]",
    name: "font-aesthetic-display text-xl uppercase leading-tight text-aesthetic-fg",
    price:
      "w-fit bg-aesthetic-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-aesthetic-accent-contrast",
    description: "text-sm text-aesthetic-fg/80",
  },
  playful: {
    grid: "grid gap-4 sm:grid-cols-2",
    card: "space-y-2 rounded-2xl bg-aesthetic-fg/[0.04] p-4 transition hover:bg-aesthetic-fg/[0.06]",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm text-aesthetic-accent",
    description: "text-sm text-aesthetic-fg/75",
  },
  corporate: {
    grid: "grid gap-3 sm:grid-cols-2",
    card: "space-y-2 rounded-md border border-aesthetic-fg/15 bg-aesthetic-bg p-4 shadow-sm",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm text-aesthetic-muted",
    description: "text-sm text-aesthetic-fg/80",
  },
  artistic: {
    grid: "grid gap-4 sm:grid-cols-2",
    card: "space-y-2 rounded-[16px_4px_16px_4px] border border-aesthetic-fg/15 bg-aesthetic-bg p-4",
    name: "font-aesthetic-display text-lg text-aesthetic-fg",
    price: "text-sm italic text-aesthetic-accent",
    description: "text-sm text-aesthetic-fg/80",
  },
};

export function ServicesSection({ profile }: { profile: PublicProfile }) {
  if (profile.services.length === 0) return null;
  const style = STYLES[profile.aesthetic] ?? STYLES.minimal;

  return (
    <section className="space-y-5">
      <h2 className="font-aesthetic-display text-2xl">Servicios</h2>
      <ul className={cn(style.grid)}>
        {profile.services.map((service) => (
          <li key={service.name} className={style.card}>
            <div
              className={cn(
                "flex flex-wrap items-baseline justify-between gap-2",
                profile.aesthetic === "editorial" && "sm:contents",
              )}
            >
              <span className={style.name}>{service.name}</span>
              {service.priceFrom !== null && (
                <span className={style.price}>
                  desde {service.priceFrom}€
                  {service.unit ? ` / ${UNIT_LABEL[service.unit]}` : ""}
                </span>
              )}
            </div>
            {service.description && <p className={style.description}>{service.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
