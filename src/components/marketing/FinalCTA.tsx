"use client";

import Link from "next/link";
import { motion } from "motion/react";

/**
 * Closing call to action. Big serif headline, two buttons (primary
 * sign-up + secondary "ver ejemplo"), and a thin "5 minutos · sin
 * tarjeta" sub-line that mirrors the trust signals from the hero so
 * scrollers who land here have one last reassurance before clicking.
 *
 * The whole block sits on a paper background with a subtle radial
 * tint so it visually echoes the hero — bookending the page.
 */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-paper py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive-100/60 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="container max-w-3xl space-y-7 text-center"
      >
        <h2 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
          Tu mini-web, viva
          <br />
          en cinco minutos.
        </h2>
        <p className="mx-auto max-w-xl text-lg text-ink/70">
          Crea tu cuenta gratis, importa tu información y comparte tu URL
          esta misma tarde.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-md bg-ink px-7 py-4 text-base font-medium text-paper transition hover:bg-ink/90"
          >
            Crear mi página gratis
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <a
            href="#estética"
            className="inline-flex items-center rounded-md border border-ink/15 bg-white px-7 py-4 text-base font-medium text-ink transition hover:border-ink/30"
          >
            Ver ejemplo
          </a>
        </div>
        <p className="text-xs text-ink/55">
          Sin tarjeta · cancela cuando quieras · tus datos son tuyos
        </p>
      </motion.div>
    </section>
  );
}
