import { cn } from "@/lib/utils";

/**
 * Decorative SVGs that show up only in the Playful aesthetic. Each one
 * is purely visual (`aria-hidden`), uses CSS variables so the user's
 * accent overrides flow through, and animates via keyframes scoped in
 * `globals.css` under `[data-aesthetic="playful"]`. None of these
 * components introduce JS state — everything is server-renderable.
 *
 * The keyframes themselves freeze for users with
 * `prefers-reduced-motion: reduce`; the SVGs stay rendered so the
 * layout doesn't lose its visual rhythm.
 */

/**
 * Three drifting circles. Sized to sit comfortably next to the avatar
 * and name in the public header without competing with the text.
 */
export function PlayfulHeaderShapes({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 80"
      width="140"
      height="80"
      className={cn("pointer-events-none select-none", className)}
    >
      <circle
        cx="22"
        cy="22"
        r="14"
        fill="var(--aesthetic-color-accent)"
        opacity="0.45"
        className="playful-drift-a"
      />
      <circle
        cx="68"
        cy="50"
        r="9"
        fill="var(--aesthetic-color-fg)"
        opacity="0.18"
        className="playful-drift-b"
      />
      <circle
        cx="110"
        cy="28"
        r="7"
        fill="var(--aesthetic-color-accent)"
        opacity="0.7"
        className="playful-drift-c"
      />
    </svg>
  );
}

/**
 * Four-point twinkling star. Inherits the accent colour and twinkles
 * via the `playful-sparkle` keyframe.
 */
export function PlayfulSparkle({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={cn(
        "pointer-events-none select-none playful-sparkle",
        className,
      )}
    >
      {/* Four-point star (sharp diagonals + soft cardinals). */}
      <path
        d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z"
        fill="var(--aesthetic-color-accent)"
      />
    </svg>
  );
}
