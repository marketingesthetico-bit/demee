import type { PublicProfile } from "@/lib/profile/public";

const SOCIAL_LABELS: Record<keyof PublicProfile["contact"]["social"], string> = {
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  instagram: "Instagram",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Web",
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

  return (
    <section className="flex flex-col gap-4 rounded-aesthetic-base border border-aesthetic-fg/15 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h2 className="font-aesthetic-display text-xl">Hablemos</h2>
        <p className="text-sm text-aesthetic-muted">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {socialEntries.map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-aesthetic-base border border-aesthetic-fg/15 px-3 py-1.5 text-sm text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent"
          >
            {SOCIAL_LABELS[key]}
          </a>
        ))}
        {profile.contact.email && (
          <a
            href={`mailto:${profile.contact.email}`}
            className="rounded-aesthetic-base border border-aesthetic-fg/15 px-3 py-1.5 text-sm text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent"
          >
            Email
          </a>
        )}
        {profile.hasBooking && (
          <a
            href={`/${profile.handle}/book`}
            className="rounded-aesthetic-base border border-aesthetic-fg/15 px-3 py-1.5 text-sm text-aesthetic-fg/80 hover:border-aesthetic-accent hover:text-aesthetic-accent"
          >
            Agendar
          </a>
        )}
        {profile.hasBudget && (
          <a
            href={`/${profile.handle}/budget`}
            className="inline-flex items-center justify-center rounded-aesthetic-base bg-aesthetic-accent px-4 py-2 text-sm font-medium text-aesthetic-accent-contrast hover:opacity-90"
          >
            Pedir presupuesto
          </a>
        )}
      </div>
    </section>
  );
}
