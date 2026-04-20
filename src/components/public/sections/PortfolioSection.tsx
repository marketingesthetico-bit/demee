import type { PublicProfile } from "@/lib/profile/public";

export function PortfolioSection({ profile }: { profile: PublicProfile }) {
  if (profile.portfolio.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-aesthetic-display text-2xl">Trabajo reciente</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {profile.portfolio.map((item) => {
          const content = (
            <article className="h-full space-y-2 rounded-aesthetic-base border border-aesthetic-fg/15 p-4 transition hover:border-aesthetic-accent">
              <h3 className="font-aesthetic-display text-lg text-aesthetic-fg">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-aesthetic-fg/75">{item.description}</p>
              )}
              {item.link && (
                <span className="inline-block text-xs text-aesthetic-accent">Ver →</span>
              )}
            </article>
          );
          return (
            <li key={`${item.title}-${item.link ?? ""}`}>
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="block h-full">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
