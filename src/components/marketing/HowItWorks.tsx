"use client";

import { motion } from "motion/react";

/**
 * 3-step "how does it work" section. Each step is a card with a big
 * number, a 1-line headline and 2-line body. Cards stagger in as the
 * section enters the viewport, and the connecting horizontal line
 * grows from left to right behind them on lg+ — gives the feeling of
 * a real flow, not a static list.
 */
const STEPS = [
  {
    n: "01",
    title: "Elige tu estilo",
    body:
      "Seis estéticas con tipografía, paleta y layout propios. Cámbialo cuando quieras sin perder el contenido.",
  },
  {
    n: "02",
    title: "Pega lo que ya tienes",
    body:
      "URL de LinkedIn, web personal o PDF de tu portfolio. La IA estructura todo en segundos.",
  },
  {
    n: "03",
    title: "Comparte tu URL",
    body:
      "demee.app/tunombre. Una página viva con portfolio, presupuestos y agenda. Lista para enviar.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-paper py-24 lg:py-32"
    >
      <div className="container space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl space-y-3"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive-700">
            Cómo funciona
          </p>
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            De cero a página viva
            <br />
            en tres pasos.
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Connector line — visible only on lg+, draws across all 3 cards */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
            className="absolute left-0 right-0 top-12 hidden h-px origin-left bg-gradient-to-r from-olive-300 via-mustard-300 to-olive-300 lg:block"
          />

          {STEPS.map((step, i) => (
            <motion.article
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              className="relative space-y-3 rounded-xl border border-ink/10 bg-white p-7 shadow-[0_2px_0_rgba(58,69,39,0.05)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-50 font-display text-sm font-semibold text-olive-700">
                {step.n}
              </div>
              <h3 className="font-display text-xl text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink/70">{step.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
