"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import {
  AESTHETIC_LIST,
  type AestheticConfig,
  type SupportedAesthetic,
} from "@/lib/aesthetics";
import { cn } from "@/lib/utils";

/**
 * Killer feature demo. The headline of this section is "cada estilo
 * es una arquitectura distinta", and the proof is that you click a
 * tab and the mockup *redraws* with that aesthetic's tokens — fonts,
 * radii, palette, and even per-aesthetic micro-layout choices.
 *
 * Auto-cycles every 3.5s if the user hasn't interacted yet so the
 * page demonstrates itself for someone scrolling past. The first
 * manual click stops the auto-rotation permanently — feels less like
 * a demo trying to flex on you.
 */
export function AestheticsShowcase() {
  const [active, setActive] = useState<SupportedAesthetic>("minimal");
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const idx = AESTHETIC_LIST.findIndex((a) => a.slug === prev);
        const next = AESTHETIC_LIST[(idx + 1) % AESTHETIC_LIST.length]!;
        return next.slug as SupportedAesthetic;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [autoplay]);

  function selectAesthetic(slug: SupportedAesthetic) {
    setAutoplay(false);
    setActive(slug);
  }

  const config = AESTHETIC_LIST.find((a) => a.slug === active) ?? AESTHETIC_LIST[0]!;

  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="container space-y-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive-700">
              Estéticas
            </p>
            <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              Cada estilo es una
              <br />
              arquitectura distinta.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-ink/70">
              No cambia solo la paleta — cambia la tipografía, el ritmo
              vertical, la forma de las tarjetas y la composición de cada
              sección. Toca cualquiera para verlo.
            </p>
          </motion.div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Selector de estética"
            className="flex flex-wrap gap-2"
          >
            {AESTHETIC_LIST.map((aesthetic) => {
              const isActive = aesthetic.slug === active;
              return (
                <button
                  key={aesthetic.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() =>
                    selectAesthetic(aesthetic.slug as SupportedAesthetic)
                  }
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-white text-ink/70 hover:border-ink/30 hover:text-ink",
                  )}
                >
                  {aesthetic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* The morphing mockup */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
          className="relative mx-auto w-full max-w-3xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={config.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <AestheticMock config={config} />
            </motion.div>
          </AnimatePresence>

          {autoplay && (
            <p className="mt-4 text-center text-xs text-ink/40">
              Rotando automáticamente · toca cualquier estilo para fijarlo
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Renders a tiny "profile card" using the selected aesthetic's
 * tokens. Inline styles + per-aesthetic structural tweaks so each
 * variant reads visually different — not just recolored.
 */
function AestheticMock({ config }: { config: AestheticConfig }) {
  const t = config.tokens;
  const slug = config.slug;

  // Per-aesthetic structural tweaks that mirror the real
  // PortfolioSection / ServicesSection variants in lib/components/public.
  const tilesShape =
    slug === "playful"
      ? "rounded-2xl"
      : slug === "artistic"
        ? "rounded-[18px_4px_18px_4px]"
        : slug === "corporate"
          ? "rounded-md"
          : slug === "bold"
            ? "rounded-none border-2"
            : slug === "editorial"
              ? "rounded-none"
              : "rounded-md";

  const ctaShape =
    slug === "playful"
      ? "rounded-full"
      : slug === "artistic"
        ? "rounded-[14px_4px_14px_4px]"
        : slug === "bold"
          ? "rounded-none border-2 uppercase tracking-wider"
          : "rounded-md";

  return (
    <div
      className="overflow-hidden rounded-2xl border border-ink/10 shadow-[0_30px_60px_-25px_rgba(58,69,39,0.25)]"
      style={{
        backgroundColor: t.colorBg,
        color: t.colorFg,
        fontFamily: t.fontBody,
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-ink/10 bg-white/40 px-4 py-2.5 backdrop-blur-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
        <div
          className="ml-3 flex-1 truncate rounded-md px-3 py-1 text-[11px]"
          style={{ backgroundColor: t.colorBg, color: t.colorMuted }}
        >
          demee.app/julia
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
          style={{ color: t.colorMuted }}
        >
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 px-7 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Left: header */}
        <div className="space-y-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center text-lg",
              tilesShape,
            )}
            style={{
              backgroundColor: t.colorAccent,
              color: t.colorAccentContrast,
              fontFamily: t.fontDisplay,
            }}
          >
            J
          </div>
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: t.colorMuted }}
          >
            Disponible
          </div>
          <h3
            className="text-3xl leading-[1.05] sm:text-4xl"
            style={{ fontFamily: t.fontDisplay }}
          >
            Julia Romero
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: t.colorFg, opacity: 0.8 }}
          >
            Diseño de marca para estudios de bienestar.
          </p>
        </div>

        {/* Right: services */}
        <div className="space-y-3">
          <div
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: t.colorMuted, fontFamily: t.fontDisplay }}
          >
            Servicios
          </div>

          <ul className="space-y-2">
            {[
              { name: "Identidad de marca", price: "1.200 €" },
              { name: "Web one-pager", price: "650 €" },
              { name: "Pack redes", price: "350 €" },
            ].map((service) => (
              <li
                key={service.name}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-2.5 text-sm",
                  tilesShape,
                )}
                style={{
                  borderColor:
                    slug === "bold"
                      ? t.colorFg
                      : `color-mix(in srgb, ${t.colorFg} 12%, transparent)`,
                  borderWidth: slug === "bold" ? 2 : 1,
                  borderStyle: "solid",
                  fontFamily: t.fontBody,
                }}
              >
                <span style={{ fontFamily: t.fontDisplay }}>{service.name}</span>
                <span style={{ color: t.colorAccent, fontWeight: 500 }}>
                  {service.price}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={cn(
              "mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium",
              ctaShape,
            )}
            style={{
              backgroundColor: t.colorAccent,
              color: t.colorAccentContrast,
              fontFamily: t.fontDisplay,
            }}
            tabIndex={-1}
          >
            Pide presupuesto →
          </button>
        </div>
      </div>
    </div>
  );
}
