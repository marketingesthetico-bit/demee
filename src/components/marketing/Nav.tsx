"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Sticky marketing nav. Two states driven by scroll position:
 *   - At top of page: transparent (lets the hero gradient through)
 *   - Scrolled past 24px: paper bg + subtle bottom rule + backdrop blur
 *
 * Auth pages use their own (auth)/layout.tsx so this never renders
 * over /sign-in, /sign-up or /callback.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          demee<span className="text-mustard">.</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <a
            href="#funcionalidades"
            className="hidden rounded-md px-3 py-2 text-sm text-ink/70 transition hover:text-ink md:block"
          >
            Funcionalidades
          </a>
          <a
            href="#precio"
            className="hidden rounded-md px-3 py-2 text-sm text-ink/70 transition hover:text-ink md:block"
          >
            Precios
          </a>
          <a
            href="#faq"
            className="hidden rounded-md px-3 py-2 text-sm text-ink/70 transition hover:text-ink md:block"
          >
            FAQ
          </a>
          <Link
            href="/sign-in"
            className="rounded-md px-3 py-2 text-sm font-medium text-ink/80 transition hover:text-ink"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            Crear cuenta gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
