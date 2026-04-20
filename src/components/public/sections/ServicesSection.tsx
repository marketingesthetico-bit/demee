import type { PublicProfile } from "@/lib/profile/public";

const UNIT_LABEL: Record<NonNullable<PublicProfile["services"][number]["unit"]>, string> = {
  project: "proyecto",
  hour: "hora",
  month: "mes",
};

export function ServicesSection({ profile }: { profile: PublicProfile }) {
  if (profile.services.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-aesthetic-display text-2xl">Servicios</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {profile.services.map((service) => (
          <li
            key={service.name}
            className="space-y-2 rounded-aesthetic-base border border-aesthetic-fg/15 p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-aesthetic-display text-lg text-aesthetic-fg">
                {service.name}
              </span>
              {service.priceFrom !== null && (
                <span className="text-sm text-aesthetic-muted">
                  desde {service.priceFrom}€
                  {service.unit ? ` / ${UNIT_LABEL[service.unit]}` : ""}
                </span>
              )}
            </div>
            {service.description && (
              <p className="text-sm text-aesthetic-fg/80">{service.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
