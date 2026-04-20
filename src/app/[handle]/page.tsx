import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageBody } from "@/components/public/PublicPageBody";
import { StickyContactBar } from "@/components/public/StickyContactBar";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { getPublicProfileByHandle } from "@/lib/firebase/public-profile";
import { cn } from "@/lib/utils";

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
      {/*
        Layout breakpoints:
        - Mobile / tablet: centered, readable column (max-w-3xl).
        - lg+ (≥1024): left-aligned with a clamped left margin that grows with
          the viewport (1.5rem → 6vw → 6rem), and a right reserve of 300px for
          the vertical sticky bar. Content is capped at max-w-5xl so very wide
          monitors don't turn lines into essays.
      */}
      <main
        className={cn(
          "mx-auto max-w-3xl px-6 py-16 pb-32 sm:px-8 sm:py-24",
          "lg:mx-0 lg:ml-[clamp(1.5rem,6vw,6rem)] lg:mr-[300px] lg:max-w-5xl lg:pb-24",
        )}
      >
        <PublicPageBody profile={profile} />
      </main>
      <StickyContactBar profile={profile} />
    </ThemeProvider>
  );
}
