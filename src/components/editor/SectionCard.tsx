"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink/[0.02]"
        aria-expanded={open}
      >
        <div className="space-y-0.5">
          <h3 className="font-medium text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink/60">{subtitle}</p>}
        </div>
        <span
          aria-hidden="true"
          className={cn(
            "text-ink/40 transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        >
          ▾
        </span>
      </button>
      {open && <div className="space-y-4 border-t border-ink/10 px-5 py-5">{children}</div>}
    </section>
  );
}
