import type { PublicProfile } from "@/lib/profile/public";

export function AboutSection({ profile }: { profile: PublicProfile }) {
  if (!profile.about.bio && profile.about.skills.length === 0) return null;

  return (
    <section className="space-y-6">
      {profile.about.bio && (
        <div className="space-y-3">
          <h2 className="font-aesthetic-display text-2xl">Sobre mí</h2>
          <p className="whitespace-pre-line text-aesthetic-fg/80">{profile.about.bio}</p>
        </div>
      )}

      {profile.about.skills.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-aesthetic-display text-2xl">Lo que hago</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.about.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg px-3 py-1 text-sm text-aesthetic-fg/80"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
