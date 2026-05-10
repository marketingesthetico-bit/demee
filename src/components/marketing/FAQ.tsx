"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "¿Necesito saber programar para usar Demee?",
    a: "No. El editor tiene preview en vivo y autosave. Pegas tu LinkedIn (o subes un PDF) y la IA estructura tu información. Cualquier ajuste se hace por formularios.",
  },
  {
    q: "¿Puedo conectar mi propio dominio (tuweb.com)?",
    a: "Sí, en el plan Pro. Te guiamos paso a paso para apuntar el dominio, Vercel emite el SSL automáticamente y tu página vive en demee.app/tunombre o en tu dominio sin cambiar nada.",
  },
  {
    q: "¿Qué pasa si supero los 10 leads o reuniones del plan Free?",
    a: "El formulario público se cierra hasta el primer del mes siguiente con un mensaje educado para tus visitantes. En cuanto pasas a Pro, los límites desaparecen al instante.",
  },
  {
    q: "¿Cómo se calculan los presupuestos automáticos?",
    a: "Defines servicios con precio base y, si quieres, opciones con multiplicadores (Básico ×1, Pro ×1.5, Premium ×2). El cliente elige y ve el total recalculándose en su pantalla. Cada solicitud te llega por email con el detalle.",
  },
  {
    q: "¿La agenda se sincroniza con mi Google Calendar?",
    a: "Sí, de forma nativa. Al conectar tu cuenta, las reservas crean eventos reales en tu calendario, generan link de Google Meet automáticamente y respetan los huecos que ya tienes ocupados.",
  },
  {
    q: "¿Puedo cambiar de estética sin perder mi contenido?",
    a: "Sí. Las estéticas son tokens visuales (tipografía, colores, layout) que se aplican sobre tu contenido. Pasas de Minimal a Bold con un click y todo tu portfolio sigue ahí.",
  },
  {
    q: "¿Cómo cancelo Pro si no me convence?",
    a: "Desde tu panel en /settings → «Gestionar suscripción» abres el portal de Stripe y cancelas con un click. Mantienes el acceso hasta el final del periodo facturado y luego pasas a Free sin perder tu página.",
  },
  {
    q: "¿Mis datos están a salvo?",
    a: "Sí. Auth y base de datos en Firebase (Google Cloud), pagos con Stripe, emails con Resend. Nada de tu información se vende ni se usa para entrenar IA. Puedes solicitar el borrado total cuando quieras.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 lg:py-32">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="space-y-3 lg:sticky lg:top-24 lg:h-fit"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive-700">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Lo que la gente
            <br />
            suele preguntarnos.
          </h2>
          <p className="text-sm text-ink/65">
            ¿No ves la tuya? Escríbenos a{" "}
            <a
              href="mailto:hola@demee.app"
              className="font-medium text-olive-700 underline-offset-2 hover:underline"
            >
              hola@demee.app
            </a>{" "}
            y respondemos el mismo día.
          </p>
        </motion.div>

        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-olive-700"
                >
                  <span className="font-display text-lg text-ink">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition",
                      isOpen && "rotate-45 border-olive-500 text-olive-600",
                    )}
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1.5v11M1.5 7h11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-12 text-sm leading-relaxed text-ink/75">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
