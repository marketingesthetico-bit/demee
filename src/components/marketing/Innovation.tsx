"use client";

import { motion } from "motion/react";

/**
 * Differentiation section. The narrative is: today the freelancer
 * stitches together 3-4 tools and pays each separately. Demee is the
 * single canvas. We show that visually with a "before/after" split:
 *
 *   Before  →  Linktree + Notion + Calendly + email  (logos as fake)
 *   After   →  demee.app/tunombre
 *
 * The arrow between them animates on scroll (path drawing). This is
 * the most important conversion section after the hero — the moment
 * where the visitor goes from "interesting tool" to "ah, I see why".
 */
export function Innovation() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-olive-700/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-mustard/15 blur-3xl" />
      </div>

      <div className="container space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-3"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mustard-300">
            Por qué Demee
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Tu cliente no quiere
            <br />
            navegar por cuatro pestañas.
          </h2>
          <p className="text-base leading-relaxed text-paper/70">
            Hoy te encuentran en un sitio, ven tu trabajo en otro, te piden
            precio en un tercero y agendan en un cuarto. En cada salto pierdes
            atención y dinero. Demee colapsa todo en una sola URL.
          </p>
        </motion.div>

        {/* Before / After comparison */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55 }}
            className="space-y-4 rounded-2xl border border-paper/10 bg-paper/[0.04] p-7"
          >
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-paper/50">
              Antes
            </div>
            <div className="space-y-2">
              <ToolRow name="Linktree" sub="Para enlazar todo, sin tu marca" />
              <ToolRow name="Notion · Carrd" sub="Para el portfolio" />
              <ToolRow name="Calendly" sub="Para reservar llamadas" />
              <ToolRow name="Email + Excel" sub="Para presupuestos" />
            </div>
            <div className="border-t border-paper/10 pt-3 text-xs text-paper/60">
              ≈ 4 pestañas · 3 suscripciones · 0 marca propia
            </div>
          </motion.div>

          {/* ARROW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mustard text-ink lg:h-16 lg:w-16">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="rotate-90 lg:rotate-0"
              >
                <path
                  d="M4 12h16m0 0l-6-6m6 6l-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="space-y-4 rounded-2xl border-2 border-olive-400/40 bg-olive-700/30 p-7"
          >
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-mustard-300">
              Con Demee
            </div>
            <div className="font-display text-3xl text-paper">
              demee.app/julia
            </div>
            <ul className="space-y-2 text-sm text-paper/85">
              <li className="flex items-center gap-2">
                <Dot /> Portfolio con 6 layouts a elegir
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Presupuestador que calcula solo
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Agenda con Google Calendar nativo
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Importación con IA en 30 segundos
              </li>
            </ul>
            <div className="border-t border-paper/10 pt-3 text-xs text-paper/60">
              1 URL · 1 suscripción · tu marca
            </div>
          </motion.div>
        </div>

        {/* Three innovation pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Pill
            title="6 estéticas con layouts propios"
            body="No es una skin. Cada estética redibuja la composición entera."
          />
          <Pill
            title="Presupuestos en vivo"
            body="El cliente toca, el total se actualiza en su pantalla. Cero email innecesario."
          />
          <Pill
            title="IA que importa por ti"
            body="Pega tu LinkedIn o sube un PDF. Sale un perfil estructurado."
          />
        </motion.div>
      </div>
    </section>
  );
}

function ToolRow({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="rounded-md bg-paper/[0.05] px-4 py-2.5">
      <div className="font-medium text-paper">{name}</div>
      <div className="text-xs text-paper/55">{sub}</div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mustard" />;
}

function Pill({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-paper/10 bg-paper/[0.04] p-5">
      <div className="font-display text-lg text-paper">{title}</div>
      <div className="mt-1.5 text-sm text-paper/65">{body}</div>
    </div>
  );
}
