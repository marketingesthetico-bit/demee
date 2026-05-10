"use client";

import Link from "next/link";
import { motion } from "motion/react";

/**
 * Above-the-fold hero. Two columns on lg+:
 *   - Left: badge → headline → subhead → dual CTA → social proof line
 *   - Right: animated browser-frame mockup of a Demee profile, with a
 *     soft halo glow that pulses, plus tiny floating chips (Pdte, Web,
 *     Identidad) that drift independently. The whole thing reads as
 *     "the product, alive".
 *
 * Background uses the paper token + a layered radial gradient blob in
 * olive/mustard so the hero feels warmer than the rest of the page.
 * Entry animations stagger in 0.08s steps so users feel the page
 * "settle" rather than slam.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      {/* Two soft colour blobs behind the content. Pure decorative —
          aria-hidden, pointer-events:none, no impact on layout. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-olive-200/50 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-mustard-100/60 blur-3xl" />
      </div>

      <div className="container grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
        {/* LEFT — copy + CTAs */}
        <div className="space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-olive-200 bg-olive-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-olive-700"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-olive-500" />
            Hecho para freelancers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            Una URL.
            <br />
            <span className="text-olive-600">Todo tu freelance</span>
            <br />
            dentro.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.13 }}
            className="max-w-xl text-lg leading-relaxed text-ink/70"
          >
            Portfolio, presupuestos automáticos y agenda con Google Calendar.
            En <span className="font-mono text-ink">demee.app/tunombre</span>{" "}
            desde hoy. Sin Linktree, sin Notion, sin Calendly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.21 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-base font-medium text-paper transition hover:bg-ink/90"
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
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-6 py-3.5 text-base font-medium text-ink transition hover:border-ink/30"
            >
              Cómo funciona
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/60"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check /> Gratis para empezar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check /> Sin tarjeta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check /> Pro a 7 €/mes
            </span>
          </motion.div>
        </div>

        {/* RIGHT — animated browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          {/* Pulsing halo that frames the mockup */}
          <motion.div
            aria-hidden="true"
            animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -z-10 rounded-[28px] bg-olive-200/40 blur-2xl"
          />

          <BrowserMockup />

          {/* Floating chips around the mockup */}
          <FloatingChip
            label="Presupuesto · 1.840 €"
            className="absolute -left-6 top-12 sm:-left-10"
            delay={0.6}
          />
          <FloatingChip
            label="Reunión confirmada"
            tone="mustard"
            className="absolute -right-4 top-32 sm:-right-8"
            delay={1.1}
          />
          <FloatingChip
            label="Lead nuevo"
            tone="olive-strong"
            className="absolute -bottom-2 left-1/3"
            delay={1.6}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="text-olive-600"
    >
      <path
        d="M2 7.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Stylised browser frame containing a miniature Demee profile. All
 * fake content — the point is to give viewers an instant feel of the
 * shape of a real Demee page without us having to embed the actual
 * `[handle]/page.tsx`.
 */
function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_30px_60px_-25px_rgba(58,69,39,0.35)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-ink/10 bg-ink/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-mustard/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-olive-300" />
        <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-ink/50">
          demee.app/julia
        </div>
      </div>

      {/* Profile body */}
      <div className="space-y-5 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-olive-200 font-display text-lg text-olive-700">
            J
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-success">
              · Disponible
            </div>
            <div className="text-xs text-ink/50">demee.app/julia</div>
          </div>
        </div>

        <div className="font-display text-3xl leading-tight text-ink">
          Julia Romero
        </div>
        <div className="text-sm leading-relaxed text-ink/70">
          Diseño de marca para estudios de yoga y bienestar. Madrid · 8 años.
        </div>

        <div className="grid grid-cols-2 gap-2">
          <PortfolioTile label="Marca · Estudio Vana" kind="brand" />
          <PortfolioTile label="Web · Casa Atemporal" kind="web" />
          <PortfolioTile label="Identidad · Forma" kind="identity" />
          <PortfolioTile label="Branding · Halo" kind="halo" />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-olive-200 bg-olive-50 px-4 py-3">
          <div>
            <div className="text-xs text-ink/60">Hablemos</div>
            <div className="text-sm font-medium text-ink">
              Pide presupuesto en 60s
            </div>
          </div>
          <span className="rounded-md bg-olive-600 px-3 py-1.5 text-xs font-medium text-paper">
            Empezar
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Each tile is a tiny "fake project" — a visual that reads as the
 * kind of work a brand designer would put in their portfolio. SVG
 * inline so the hero stays a single HTTP request and there's no
 * external image dependency to ship rights for.
 *
 * The four kinds map to the labels in the mockup:
 *   - brand    → wellness studio mark on sage gradient
 *   - web      → mock browser layout with hero + columns
 *   - identity → big serif monogram on neutral
 *   - halo     → ringed mark + colour swatches
 */
function PortfolioTile({
  label,
  kind,
}: {
  label: string;
  kind: "brand" | "web" | "identity" | "halo";
}) {
  const Visual = TILE_VISUALS[kind];
  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-md">
      <Visual />
      {/* Soft top→bottom darken so the label stays readable over any
          composition. Pointer-events-none so it doesn't catch hover. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent"
      />
      <div className="absolute inset-x-2 bottom-1.5 text-[9px] font-medium tracking-wide text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
        {label}
      </div>
    </div>
  );
}

const TILE_VISUALS = {
  brand: BrandTile,
  web: WebTile,
  identity: IdentityTile,
  halo: HaloTile,
} as const;

/* ---------- Tile 1 — wellness studio brand ---------- */
function BrandTile() {
  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Brand work for Estudio Vana"
    >
      <defs>
        <linearGradient id="vana-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCE5C8" />
          <stop offset="100%" stopColor="#B6C29A" />
        </linearGradient>
      </defs>
      <rect width="100" height="80" fill="url(#vana-bg)" />
      {/* Concentric organic mark suggesting petals / breathing */}
      <circle cx="50" cy="38" r="20" fill="none" stroke="#3A4527" strokeWidth="0.6" opacity="0.55" />
      <circle cx="50" cy="38" r="14" fill="none" stroke="#3A4527" strokeWidth="0.6" opacity="0.7" />
      <circle cx="50" cy="38" r="8" fill="#3A4527" opacity="0.85" />
      {/* Tiny wordmark below the mark */}
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="6"
        fontWeight="600"
        letterSpacing="2"
        fill="#3A4527"
      >
        VANA
      </text>
    </svg>
  );
}

/* ---------- Tile 2 — web layout for Casa Atemporal ---------- */
function WebTile() {
  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Web design for Casa Atemporal"
    >
      <defs>
        <linearGradient id="casa-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBF4E0" />
          <stop offset="100%" stopColor="#E5BC49" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="100" height="80" fill="url(#casa-bg)" />
      {/* Mock browser hero */}
      <rect x="10" y="10" width="80" height="32" rx="2" fill="#FFFFFF" opacity="0.85" />
      <rect x="14" y="14" width="22" height="3" rx="0.5" fill="#2A2A28" opacity="0.85" />
      <rect x="14" y="20" width="40" height="2" rx="0.5" fill="#2A2A28" opacity="0.4" />
      <rect x="14" y="24" width="34" height="2" rx="0.5" fill="#2A2A28" opacity="0.4" />
      <rect x="60" y="14" width="26" height="24" rx="1.5" fill="#B3841F" opacity="0.7" />
      {/* Columns under the hero */}
      <rect x="10" y="46" width="22" height="22" rx="1.5" fill="#FFFFFF" opacity="0.7" />
      <rect x="36" y="46" width="22" height="22" rx="1.5" fill="#FFFFFF" opacity="0.7" />
      <rect x="62" y="46" width="22" height="22" rx="1.5" fill="#FFFFFF" opacity="0.7" />
      {/* Tiny detail bars inside the columns */}
      <rect x="13" y="60" width="14" height="1.4" fill="#2A2A28" opacity="0.5" />
      <rect x="39" y="60" width="14" height="1.4" fill="#2A2A28" opacity="0.5" />
      <rect x="65" y="60" width="14" height="1.4" fill="#2A2A28" opacity="0.5" />
    </svg>
  );
}

/* ---------- Tile 3 — identity / monogram for "Forma" ---------- */
function IdentityTile() {
  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Identity design — Forma monogram"
    >
      <rect width="100" height="80" fill="#1F2514" />
      {/* Subtle warm vignette at the top */}
      <defs>
        <radialGradient id="forma-glow" cx="0.5" cy="0.2" r="0.6">
          <stop offset="0%" stopColor="#D4A02F" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1F2514" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="80" fill="url(#forma-glow)" />
      {/* Big serif F as monogram, with a tight rule */}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="56"
        fontWeight="700"
        fill="#F7F4EC"
      >
        f
      </text>
      <line
        x1="22"
        y1="68"
        x2="78"
        y2="68"
        stroke="#D4A02F"
        strokeWidth="0.6"
      />
      <text
        x="50"
        y="74"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="3.6"
        letterSpacing="2.5"
        fill="#F7F4EC"
        opacity="0.7"
      >
        FORMA · 2024
      </text>
    </svg>
  );
}

/* ---------- Tile 4 — Halo: ringed mark + swatches ---------- */
function HaloTile() {
  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Branding — Halo system"
    >
      <defs>
        <linearGradient id="halo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3F5EC" />
          <stop offset="100%" stopColor="#E0E6CB" />
        </linearGradient>
      </defs>
      <rect width="100" height="80" fill="url(#halo-bg)" />
      {/* Ringed monogram on the left */}
      <circle cx="34" cy="36" r="18" fill="none" stroke="#3A4527" strokeWidth="0.7" />
      <circle cx="34" cy="36" r="12" fill="#3A4527" />
      <text
        x="34"
        y="40"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="11"
        fontWeight="600"
        fill="#F3F5EC"
      >
        H
      </text>
      {/* Tiny "halo" dots circling the mark */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = 22;
        const rad = (deg * Math.PI) / 180;
        const cx = 34 + r * Math.cos(rad);
        const cy = 36 + r * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="1.1" fill="#D4A02F" />;
      })}
      {/* Colour swatches stack on the right */}
      <rect x="62" y="18" width="24" height="11" rx="1.5" fill="#3A4527" />
      <rect x="62" y="32" width="24" height="11" rx="1.5" fill="#D4A02F" />
      <rect x="62" y="46" width="24" height="11" rx="1.5" fill="#F7F4EC" stroke="#3A4527" strokeWidth="0.4" />
    </svg>
  );
}

/**
 * Small pill that floats around the mockup, drifting up-and-down on a
 * loop. Different tones differentiate which "kind of event" it
 * represents (lead, booking, payment).
 */
function FloatingChip({
  label,
  tone = "olive",
  className,
  delay = 0,
}: {
  label: string;
  tone?: "olive" | "olive-strong" | "mustard";
  className?: string;
  delay?: number;
}) {
  const palette = {
    olive: "bg-white text-ink border-ink/10",
    "olive-strong": "bg-olive-600 text-paper border-olive-700",
    mustard: "bg-mustard-50 text-ink border-mustard-200",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_8px_20px_-10px_rgba(0,0,0,0.25)] ${palette}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "olive-strong" ? "bg-paper" : "bg-olive-500"
          }`}
        />
        {label}
      </motion.div>
    </motion.div>
  );
}
