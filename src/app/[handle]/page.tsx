import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageBody } from "@/components/public/PublicPageBody";
import { StickyContactBar } from "@/components/public/StickyContactBar";
import { ThemeProvider } from "@/components/public/ThemeProvider";
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
    <ThemeProvider
      aesthetic={profile.aesthetic}
      overrides={profile.themeColors}
      className="min-h-screen bg-aesthetic-bg font-aesthetic-body text-aesthetic-fg"
    >
      <main className="container max-w-3xl py-16 pb-32 sm:py-24 sm:pb-40">
        <PublicPageBody profile={profile} />
      </main>
      <StickyContactBar profile={profile} />
    </ThemeProvider>
  );
}
