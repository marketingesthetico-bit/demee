import type { Metadata } from "next";

import { AestheticsShowcase } from "@/components/marketing/AestheticsShowcase";
import { FAQ } from "@/components/marketing/FAQ";
import { Features } from "@/components/marketing/Features";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Innovation } from "@/components/marketing/Innovation";
import { Nav } from "@/components/marketing/Nav";
import { Pricing } from "@/components/marketing/Pricing";
import { TrustBand } from "@/components/marketing/TrustBand";

export const metadata: Metadata = {
  title: "Demee · Tu mini-web de freelance lista en 5 minutos",
  description:
    "Portfolio, presupuestos automáticos y agenda con Google Calendar en una sola URL personal. Empieza gratis, Pro a 7 €/mes.",
  openGraph: {
    title: "Demee · Tu mini-web de freelance lista en 5 minutos",
    description:
      "Portfolio, presupuestos y agenda en una sola URL. Sin Linktree, sin Notion, sin Calendly.",
    url: "/",
    type: "website",
  },
  alternates: { canonical: "/" },
};

/**
 * Public landing. Server Component shell that sequences the marketing
 * sections in conversion order:
 *
 *   Hero          → catch attention
 *   TrustBand     → quick credibility
 *   HowItWorks    → "is this for me?"
 *   Features      → what's inside
 *   Showcase      → the killer differentiator (interactive)
 *   Innovation    → why us vs the stack you have today
 *   Pricing       → make the upgrade obvious + risk-free
 *   FAQ           → address the lingering doubts
 *   FinalCTA      → close
 *
 * Each section is a Client Component because of motion/react —
 * orchestrating animations server-side isn't possible. The shell
 * itself stays server-rendered so SEO + initial paint stay snappy.
 */
export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustBand />
        <HowItWorks />
        <Features />
        <AestheticsShowcase />
        <Innovation />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
