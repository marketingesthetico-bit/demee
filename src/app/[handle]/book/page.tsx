import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingRequestForm } from "@/components/public/BookingRequestForm";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { loadPublicBookingConfig } from "@/lib/firebase/booking-loader";
import { getPublicProfileByHandle } from "@/lib/firebase/public-profile";

export const revalidate = 60;

interface Params {
  params: { handle: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const handle = params.handle.toLowerCase();
  if (!validateHandleFormat(handle).valid) return { title: "Agendar" };
  const profile = await getPublicProfileByHandle(handle);
  return {
    title: profile ? `Agenda con ${profile.header.name}` : "Agendar",
    description: profile?.header.headline ?? undefined,
    robots: { index: false, follow: true },
  };
}

export default async function PublicBookPage({ params }: Params) {
  const handle = params.handle.toLowerCase();
  if (!validateHandleFormat(handle).valid) notFound();

  const [bundle, profile] = await Promise.all([
    loadPublicBookingConfig(handle),
    getPublicProfileByHandle(handle),
  ]);
  if (!bundle || !profile) notFound();

  return (
    <ThemeProvider
      aesthetic={profile.aesthetic}
      className="min-h-screen bg-aesthetic-bg font-aesthetic-body text-aesthetic-fg"
    >
      <main className="container max-w-2xl py-12 sm:py-16">
        <header className="space-y-3">
          <a
            href={`/${handle}`}
            className="inline-flex items-center gap-1 text-sm text-aesthetic-muted hover:text-aesthetic-fg"
          >
            ← Volver al perfil
          </a>
          <h1 className="font-aesthetic-display text-4xl leading-tight sm:text-5xl">
            Agenda con {profile.header.name}
          </h1>
          <p className="max-w-xl text-aesthetic-fg/80">
            <strong>{bundle.config.name}</strong> · {bundle.config.durationMinutes} min
            {" · "}
            {bundle.config.locationType === "online"
              ? "online"
              : bundle.config.locationType === "phone"
                ? "teléfono"
                : "presencial"}
          </p>
          {bundle.config.description && (
            <p className="max-w-xl text-sm text-aesthetic-fg/70">
              {bundle.config.description}
            </p>
          )}
          {bundle.config.introText && (
            <p className="max-w-xl text-sm text-aesthetic-fg/70">{bundle.config.introText}</p>
          )}
        </header>

        <div className="mt-10">
          <BookingRequestForm handle={handle} config={bundle.config} />
        </div>
      </main>
    </ThemeProvider>
  );
}
