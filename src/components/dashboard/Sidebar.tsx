"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
  status: "ready" | "soon";
}

const ITEMS: SidebarItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "🏠", status: "ready" },
  { href: "/edit", label: "Mi página", icon: "✏️", status: "ready" },
  { href: "/leads", label: "Leads", icon: "📬", status: "ready" },
  { href: "/bookings", label: "Agenda", icon: "📅", status: "ready" },
  { href: "/analytics", label: "Analytics", icon: "📊", status: "soon" },
  { href: "/settings", label: "Ajustes", icon: "⚙️", status: "soon" },
];

interface Props {
  handle: string | null;
}

export function Sidebar({ handle }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-white/60 lg:flex">
      <div className="flex h-14 items-center border-b border-ink/10 px-5">
        <Link href="/dashboard" className="font-display text-lg text-ink">
          demee<span className="text-mustard">.</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navegación">
        {ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const isReady = item.status === "ready";

          const inner = (
            <span
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition",
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
              {inner}
            </Link>
          ) : (
            <div key={item.href} aria-disabled>
              {inner}
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
  );
}
