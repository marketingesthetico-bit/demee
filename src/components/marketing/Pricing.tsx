"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Free vs Pro comparison. Two columns, Pro is the visually highlighted
 * one (a touch larger, mustard ribbon, slightly tilted "Recomendado").
 *
 * Feature checklist mirrors what /settings shows logged-in users —
 * keeping the truth in two places is a tax we pay so the marketing
 * page can render server-side without auth.
 */
const FREE_FEATURES = [
  "Hasta 10 solicitudes de presupuesto/mes",
  "Hasta 10 reuniones agendadas/mes",
  "Editor + portfolio + presupuestador + agenda",
  "Subdominio demee.app/tunombre",
  "Las 6 estéticas",
  "Importación con IA",
];

const PRO_FEATURES = [
  "Solicitudes de presupuesto ilimitadas",
  "Reuniones agendadas ilimitadas",
  "Dominio personalizado (tuweb.com)",
  "Sin marca «Hecho con Demee»",
  "Múltiples tipos de reunión",
  "Soporte prioritario",
];

export function Pricing() {
  return (
    <section
      id="precio"
      className="bg-paper py-24 lg:py-32"
    >
      <div className="container space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl space-y-3 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive-700">
            Precios
          </p>
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Empieza gratis. Sube a Pro
            <br />
            cuando lo necesites.
          </h2>
          <p className="text-base leading-relaxed text-ink/70">
            Sin demos cojeando ni tarjetas para probar. Cuando tu freelance
            crezca, Pro está ahí esperándote.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 rounded-2xl border border-ink/10 bg-white p-8"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium text-ink/60">Free</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-ink">0 €</span>
                <span className="text-sm text-ink/55">/ siempre</span>
              </div>
              <p className="text-sm text-ink/70">
                Para empezar y validar tu presencia. Sin caducidad.
              </p>
            </div>

            <FeatureList features={FREE_FEATURES} />

            <Link
              href="/sign-up"
              className="mt-auto inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-ink/30"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col gap-6 rounded-2xl border-2 border-ink bg-ink p-8 text-paper shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]"
          >
            <span className="absolute -top-3 right-6 inline-flex rounded-full bg-mustard px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
              Recomendado
            </span>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-mustard-300">
                Pro
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-paper">7 €</span>
                <span className="text-sm text-paper/60">/ mes</span>
              </div>
              <p className="text-sm text-paper/75">
                Sin restricciones. Todo lo de Free, sin techos, con tu
                dominio y tu marca.
              </p>
            </div>

            <FeatureList features={PRO_FEATURES} dark />

            <Link
              href="/sign-up?plan=pro"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-mustard px-6 py-3 text-sm font-medium text-ink transition hover:bg-mustard-300"
            >
              Empezar y subir a Pro
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>

        <p className="text-center text-xs text-ink/55">
          Pagos con Stripe · cancela en cualquier momento desde tu panel ·
          IVA incluido
        </p>
      </div>
    </section>
  );
}

function FeatureList({
  features,
  dark = false,
}: {
  features: readonly string[];
  dark?: boolean;
}) {
  return (
    <ul className={cn("space-y-2.5", dark ? "text-paper" : "text-ink/85")}>
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-sm">
          <Check dark={dark} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function Check({ dark }: { dark?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={cn(
        "mt-0.5 shrink-0",
        dark ? "text-mustard-300" : "text-olive-600",
      )}
    >
      <circle
        cx="9"
        cy="9"
        r="8"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 9.5l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
