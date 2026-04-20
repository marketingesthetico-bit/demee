"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getIndustryConfig } from "@/lib/industries";
import { readDraft, writeDraft } from "@/lib/onboarding/draft";

export default function ImportStepPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState<ReturnType<typeof getIndustryConfig>>(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    const draft = readDraft();
    if (!draft.industry || !draft.aesthetic) {
      router.replace("/onboarding");
      return;
    }
    setIndustry(getIndustryConfig(draft.industry));
    setHeadline(draft.imported?.headline ?? "");
    setBio(draft.imported?.bio ?? "");
    setSkillsText(draft.imported?.skills?.join(", ") ?? "");
  }, [router]);

  const skills = useMemo(
    () =>
      skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
    [skillsText],
  );

  function save() {
    writeDraft({
      imported: {
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
      },
    });
  }

  function next() {
    save();
    router.push("/onboarding/publish");
  }

  function skip() {
    router.push("/onboarding/publish");
  }

  if (!industry) return null;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Cuéntanos de ti.</h1>
        <p className="text-ink/70">
          Rellena lo básico a mano por ahora. Mañana activamos la importación automática desde
          LinkedIn, web personal o CV.
        </p>
      </header>

      <div className="space-y-6 rounded-lg border border-ink/10 bg-white p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Titular profesional</span>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={industry.examples.headline}
            maxLength={160}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
          <span className="text-xs text-ink/50">
            Una frase que te describa. Ejemplo: {industry.examples.headline}
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Sobre ti</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="2-4 párrafos sobre quién eres, con qué trabajas y qué te diferencia."
            rows={6}
            maxLength={800}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Habilidades / servicios</span>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder={industry.examples.skills.join(", ")}
            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
          />
          <span className="text-xs text-ink/50">Sepáralos por comas. Máx. 10.</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding/aesthetic")}
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Atrás
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={skip}
            className="rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
          >
            Saltar paso
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
