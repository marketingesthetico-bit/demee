"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AESTHETIC_LIST } from "@/lib/aesthetics";
import type { AestheticConfig, SupportedAesthetic } from "@/lib/aesthetics";
import { readDraft, writeDraft } from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

export default function AestheticStepPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<SupportedAesthetic | null>(null);

  useEffect(() => {
    const draft = readDraft();
    if (!draft.industry) {
      router.replace("/onboarding");
      return;
    }
    if (draft.aesthetic) setSelected(draft.aesthetic);
  }, [router]);

  function choose(slug: SupportedAesthetic) {
    setSelected(slug);
    writeDraft({ aesthetic: slug });
  }

  function next() {
    if (!selected) return;
    router.push("/onboarding/import");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Elige un estilo visual.</h1>
        <p className="text-ink/70">
          El estilo controla tipografía, colores y espaciado de tu página pública. Podrás cambiarlo
          cuando quieras.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AESTHETIC_LIST.map((aesthetic) => {
          const isSelected = selected === aesthetic.slug;
          return (
            <button
              key={aesthetic.slug}
              type="button"
              onClick={() => choose(aesthetic.slug as SupportedAesthetic)}
              className={cn(
                "flex flex-col overflow-hidden rounded-lg border text-left transition",
                "hover:shadow-md",
                isSelected ? "border-olive-500 ring-2 ring-olive-500/30" : "border-ink/10",
              )}
            >
              <AestheticPreview aesthetic={aesthetic} />
              <div className="space-y-1 bg-white p-4">
                <span className="font-medium text-ink">{aesthetic.label}</span>
                <p className="text-sm text-ink/60">{aesthetic.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!selected}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function AestheticPreview({ aesthetic }: { aesthetic: AestheticConfig }) {
  const { tokens } = aesthetic;
  return (
    <div
      className="flex h-40 flex-col justify-between p-5"
      style={{
        backgroundColor: tokens.colorBg,
        color: tokens.colorFg,
        fontFamily: tokens.fontBody,
      }}
    >
      <span
        className="text-2xl leading-tight"
        style={{ fontFamily: tokens.fontDisplay }}
      >
        Julia Romero
      </span>
      <span className="text-xs" style={{ color: tokens.colorMuted }}>
        demee.app/julia
      </span>
      <span
        className="inline-flex w-fit px-2 py-0.5 text-xs"
        style={{
          backgroundColor: tokens.colorAccent,
          color: tokens.colorAccentContrast,
          borderRadius: tokens.radiusBase,
        }}
      >
        Disponible
      </span>
    </div>
  );
}
