"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  status: "ready" | "soon";
}

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "🏠", status: "ready" },
  { href: "/edit", label: "Mi página", icon: "✏️", status: "ready" },
  { href: "/leads", label: "Leads", icon: "📬", status: "ready" },
  { href: "/bookings", label: "Agenda", icon: "📅", status: "ready" },
  { href: "/analytics", label: "Analytics", icon: "📊", status: "ready" },
  { href: "/settings", label: "Ajustes", icon: "⚙️", status: "ready" },
];

interface Props {
  handle: string | null;
}

export function MobileNav({ handle }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/15 bg-white text-ink"
      >
        <span className="flex flex-col gap-[3px]" aria-hidden="true">
          <span className="block h-[2px] w-[18px] bg-current" />
          <span className="block h-[2px] w-[18px] bg-current" />
          <span className="block h-[2px] w-[18px] bg-current" />
        </span>
      </button>

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        id="mobile-drawer"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-ink/10 bg-paper transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 px-5">
          <Link
            href="/dashboard"
            className="font-display text-lg text-ink"
            onClick={() => setOpen(false)}
          >
            demee<span className="text-mustard">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5 hover:text-ink"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegación">
          {ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const isReady = item.status === "ready";
            const content = (
              <span
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition",
                  isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5",
                  !isReady && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </span>
                {!isReady && (
                  <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/60">
                    Soon
                  </span>
                )}
              </span>
            );
            return isReady ? (
              <Link key={item.href} href={item.href}>
                {content}
              </Link>
            ) : (
              <div key={item.href} aria-disabled>
                {content}
              </div>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-ink/10 p-4 text-xs text-ink/60">
          {handle && (
            <a
              href={`/${handle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-olive-700 hover:underline"
            >
              <span aria-hidden="true">↗</span>
              Ver mi página
            </a>
          )}
          <a
            href="/api/auth/logout"
            className="flex items-center gap-2 text-ink/60 hover:text-ink"
          >
            <span aria-hidden="true">→</span>
            Salir
          </a>
        </div>
      </aside>
    </>
  );
}
