"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/onboarding", label: "Industria" },
  { path: "/onboarding/aesthetic", label: "Estilo" },
  { path: "/onboarding/import", label: "Datos" },
  { path: "/onboarding/publish", label: "Publicar" },
];

export function StepperBar() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.path === pathname),
  );

  return (
    <nav className="mx-auto flex w-full max-w-3xl items-center gap-3 py-6" aria-label="Pasos del onboarding">
      {STEPS.map((step, i) => {
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex;
        return (
          <div key={step.path} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                isActive && "bg-ink text-paper",
                isCompleted && "bg-olive-500 text-paper",
                !isActive && !isCompleted && "bg-ink/10 text-ink/50",
              )}
            >
              {isCompleted ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                isActive ? "text-ink" : "text-ink/50",
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px flex-1", isCompleted ? "bg-olive-500" : "bg-ink/10")} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
