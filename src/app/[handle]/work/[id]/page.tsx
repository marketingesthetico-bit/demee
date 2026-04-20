import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkDetailView } from "@/components/public/WorkDetailView";
import { StickyContactBar } from "@/components/public/StickyContactBar";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { getPublicProfileByHandle } from "@/lib/firebase/public-profile";
import { cn } from "@/lib/utils";

export const revalidate = 60;

interface Params {
  params: { handle: string; id: string };
}

async function loadProfileAndItem(rawHandle: string, itemId: string) {
  const handle = rawHandle.toLowerCase();
  if (!validateHandleFormat(handle).valid) return null;
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) return null;
  const item = profile.portfolio.find(
    (p) => p.id === itemId && p.hasDetailPage,
  );
  if (!item) return null;
  return { profile, item };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const loaded = await loadProfileAndItem(params.handle, params.id);
  if (!loaded) return { title: "Proyecto" };
  const { profile, item } = loaded;
  const description =
    item.description ||
    item.detail?.longDescription.slice(0, 155) ||
    `Proyecto de ${profile.header.name}.`;
  return {
    title: `${item.title} · ${profile.header.name}`,
    description,
    openGraph: {
      title: `${item.title} · ${profile.header.name}`,
      description,
      type: "article",
      url: `/${profile.handle}/work/${item.id}`,
      images: item.image ? [{ url: item.image.url }] : undefined,
    },
  };
}

export default async function WorkDetailPage({ params }: Params) {
  const loaded = await loadProfileAndItem(params.handle, params.id);
  if (!loaded) notFound();
  const { profile, item } = loaded;

  return (
    <ThemeProvider
      aesthetic={profile.aesthetic}
      overrides={profile.themeColors}
      className="min-h-screen bg-aesthetic-bg font-aesthetic-body text-aesthetic-fg"
    >
      <main
        className={cn(
          "mx-auto max-w-3xl px-6 py-16 pb-32 sm:px-8 sm:py-24",
          "lg:mx-0 lg:ml-[clamp(1.5rem,6vw,6rem)] lg:mr-[300px] lg:max-w-5xl lg:pb-24",
        )}
      >
        <WorkDetailView profile={profile} item={item} />
      </main>
      <StickyContactBar profile={profile} />
    </ThemeProvider>
  );
}
