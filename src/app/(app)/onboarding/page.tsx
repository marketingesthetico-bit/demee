"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { INDUSTRY_LIST } from "@/lib/industries";
import type { SupportedIndustry } from "@/lib/industries";
import { readDraft, writeDraft } from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

export default function IndustryStepPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<SupportedIndustry | null>(null);

  useEffect(() => {
    const draft = readDraft();
    if (draft.industry) setSelected(draft.industry);
  }, []);

  function choose(slug: SupportedIndustry) {
    setSelected(slug);
    writeDraft({ industry: slug });
  }

  function next() {
    if (!selected) return;
    router.push("/onboarding/aesthetic");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">¿A qué te dedicas?</h1>
        <p className="text-ink/70">
          Preparamos las secciones, ejemplos y textos pensando en tu industria. Podrás cambiarla
          después.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRY_LIST.map((industry) => (
          <button
            key={industry.slug}
            type="button"
            onClick={() => choose(industry.slug as SupportedIndustry)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border bg-white p-4 text-left transition",
              "hover:border-olive-500 hover:shadow-sm",
              selected === industry.slug
                ? "border-olive-500 ring-2 ring-olive-500/30"
                : "border-ink/10",
            )}
          >
            <span className="text-2xl" aria-hidden="true">
              {industry.emoji}
            </span>
            <span className="font-medium text-ink">{industry.label}</span>
            <span className="text-sm text-ink/60">{industry.tagline}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
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
