"use client";

import { motion } from "motion/react";

/**
 * Functionality grid. Six cards, each with a small icon, a title and
 * a one-line body. The grid is bento-style on lg+ — the first card
 * spans 2 columns to give the section a visual centre, the rest are
 * 1×1.
 *
 * Cards stagger in on scroll and lift on hover. The hover state is
 * subtle: 4px lift + slight shadow change. Anything more aggressive
 * starts to feel like a casino.
 */
type Feature = {
  icon: React.ReactNode;
  title: string;
  body: string;
  span?: "wide" | "tall";
};

const FEATURES: Feature[] = [
  {
    icon: <IconBrowser />,
    title: "Editor con preview en vivo",
    body:
      "Escribes a la izquierda, tu página cambia a la derecha. Sin guardar ni recargar.",
    span: "wide",
  },
  {
    icon: <IconLayers />,
    title: "6 estéticas con layouts distintos",
    body:
      "No son skins. Cada una redibuja la composición: cards, listas, hero, masonry.",
  },
  {
    icon: <IconCalc />,
    title: "Presupuestador dinámico",
    body:
      "Items + opciones con multiplicadores. El cliente ajusta y ve el total al instante.",
  },
  {
    icon: <IconCalendar />,
    title: "Agenda con Google Calendar",
    body:
      "Reservas online, eventos en tu calendario real, link de Meet automático.",
  },
  {
    icon: <IconAi />,
    title: "Importación con IA",
    body:
      "Pega tu LinkedIn o sube un PDF. Estructura tu portfolio en segundos.",
  },
  {
    icon: <IconDomain />,
    title: "Dominio personalizado",
    body:
      "Pro: conecta tuweb.com sobre Demee. SSL incluido, configuración guiada.",
  },
];

export function Features() {
  return (
    <section
      id="funcionalidades"
      className="bg-white py-24 lg:py-32"
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
            Funcionalidades
          </p>
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            Todo lo que un freelance
            <br />
            necesita en una sola URL.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-xl border border-ink/10 bg-paper p-7 transition hover:border-olive-300 hover:shadow-[0_18px_36px_-22px_rgba(58,69,39,0.35)] ${
                feature.span === "wide"
                  ? "lg:col-span-2"
                  : ""
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-olive-100 text-olive-700">
                {feature.icon}
              </div>
              <h3 className="mt-5 font-display text-xl text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {feature.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Tiny inline icons. SVG instead of an icon library to keep the
 * marketing page bundle small. All 24×24, currentColor stroke. */
function IconBrowser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="6.5" r="0.6" fill="currentColor" />
      <circle cx="8.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l9 5-9 5-9-5 9-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3 13l9 5 9-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCalc() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="8" y="6" width="8" height="3" rx="0.5" fill="currentColor" />
      <circle cx="9" cy="13" r="0.8" fill="currentColor" />
      <circle cx="12" cy="13" r="0.8" fill="currentColor" />
      <circle cx="15" cy="13" r="0.8" fill="currentColor" />
      <circle cx="9" cy="16.5" r="0.8" fill="currentColor" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
      <circle cx="15" cy="16.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 9h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconAi() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconDomain() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
