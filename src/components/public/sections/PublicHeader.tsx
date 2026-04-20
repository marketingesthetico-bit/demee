import Image from "next/image";

import type { PublicProfile } from "@/lib/profile/public";

const AVAILABILITY_COPY: Record<
  PublicProfile["header"]["availability"],
  { label: string; dot: string }
> = {
  available: { label: "Disponible", dot: "bg-success" },
  limited: { label: "Plazas limitadas", dot: "bg-mustard" },
  closed: { label: "Cerrado por ahora", dot: "bg-aesthetic-muted" },
};

export function PublicHeader({ profile }: { profile: PublicProfile }) {
  const availability = AVAILABILITY_COPY[profile.header.availability];

  return (
    <header className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {profile.header.photoURL ? (
          <Image
            src={profile.header.photoURL}
            alt={profile.header.name}
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-aesthetic-fg/10 font-aesthetic-display text-xl text-aesthetic-fg">
            {profile.header.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-aesthetic-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${availability.dot}`} />
            {availability.label}
          </span>
          <span className="text-sm text-aesthetic-muted">demee.app/{profile.handle}</span>
        </div>
      </div>

      <h1 className="font-aesthetic-display text-5xl leading-tight text-aesthetic-fg sm:text-6xl">
        {profile.header.name}
      </h1>

      {profile.header.headline && (
        <p className="max-w-2xl text-xl leading-relaxed text-aesthetic-fg/80">
          {profile.header.headline}
        </p>
      )}

      {profile.header.location && (
        <p className="text-sm text-aesthetic-muted">📍 {profile.header.location}</p>
      )}
    </header>
  );
}
