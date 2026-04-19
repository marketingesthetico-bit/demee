import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicHeader } from "@/components/public/sections/PublicHeader";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { getPublicProfileByHandle } from "@/lib/firebase/public-profile";

export const revalidate = 60;

interface Params {
  params: { handle: string };
}

async function loadProfile(rawHandle: string) {
  const handle = rawHandle.toLowerCase();
  if (!validateHandleFormat(handle).valid) return null;
  return getPublicProfileByHandle(handle);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const profile = await loadProfile(params.handle);
  if (!profile) {
    return {
      title: "Página no encontrada",
      description: "Este handle no corresponde a ningún freelancer en Demee.",
    };
  }
  const description = profile.header.headline
    ? profile.header.headline.slice(0, 155)
    : `${profile.header.name} · freelancer en Demee.`;
  return {
    title: `${profile.header.name}`,
    description,
    openGraph: {
      title: `${profile.header.name} · Demee`,
      description,
      url: `/${profile.handle}`,
      type: "profile",
      images: profile.header.photoURL ? [{ url: profile.header.photoURL }] : undefined,
    },
  };
}

export default async function PublicHandlePage({ params }: Params) {
  const profile = await loadProfile(params.handle);
  if (!profile) notFound();

  return (
    <main className="container max-w-3xl py-16 sm:py-24">
      <PublicHeader profile={profile} />

      {profile.about.bio && (
        <section className="mt-12 space-y-3">
          <h2 className="font-display text-2xl text-ink">Sobre mí</h2>
          <p className="whitespace-pre-line text-ink/80">{profile.about.bio}</p>
        </section>
      )}

      {profile.about.skills.length > 0 && (
        <section className="mt-10 space-y-3">
          <h2 className="font-display text-2xl text-ink">Lo que hago</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.about.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-ink/15 bg-white px-3 py-1 text-sm text-ink/80"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">¿Te interesa trabajar juntos?</h2>
          <p className="text-sm text-ink/60">
            Los presupuestos y la agenda llegan en breve. Por ahora, escríbeme al email.
          </p>
        </div>
        {profile.contact.email && (
          <a
            href={`mailto:${profile.contact.email}`}
            className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Escribir por email
          </a>
        )}
      </section>
    </main>
  );
}
