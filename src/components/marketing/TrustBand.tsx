"use client";

import { motion } from "motion/react";

/**
 * Slim band beneath the hero with quick "yes, you can trust this"
 * proof points. Each cell pops in sequentially as the user reaches
 * the band — small motion, big "this is real" effect.
 */
const POINTS: { label: string; sub: string }[] = [
  { label: "5 minutos", sub: "del registro a tu URL en vivo" },
  { label: "Sin código", sub: "todo desde un editor con preview" },
  { label: "IA importa", sub: "tu LinkedIn, web o PDF" },
  { label: "Pagos integrados", sub: "Stripe, sin terceros" },
];

export function TrustBand() {
  return (
    <section className="border-y border-ink/10 bg-white">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-6 py-10 sm:grid-cols-4">
        {POINTS.map((point, i) => (
          <motion.div
            key={point.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="space-y-1 text-center sm:text-left"
          >
            <div className="font-display text-2xl text-ink">{point.label}</div>
            <div className="text-xs text-ink/55">{point.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
