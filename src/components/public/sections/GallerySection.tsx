import Image from "next/image";

import type { PublicProfile } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

// Tailwind classes per aesthetic so images feel native to the theme
// instead of looking like stock tiles glued on top.
const AESTHETIC_STYLES: Record<
  PublicProfile["aesthetic"],
  {
    container: string;
    cell: string;
    imageClass: string;
    filter: string;
  }
> = {
  minimal: {
    container: "grid grid-cols-2 gap-3 sm:grid-cols-3",
    cell: "aspect-square overflow-hidden border border-aesthetic-fg/10",
    imageClass: "object-cover transition duration-500 hover:scale-[1.02]",
    filter: "",
  },
  editorial: {
    // Masonry-ish via varied row spans
    container: "grid grid-cols-2 gap-4 sm:grid-cols-3 [grid-auto-rows:8rem]",
    cell: "overflow-hidden border border-aesthetic-fg/10",
    imageClass: "object-cover transition duration-700 hover:scale-[1.03]",
    filter: "sepia-[0.08] saturate-[0.95]",
  },
  bold: {
    container: "grid grid-cols-2 gap-2 sm:grid-cols-3",
    cell: "aspect-square overflow-hidden",
    imageClass: "object-cover grayscale contrast-125 transition duration-500 hover:grayscale-0 hover:contrast-100",
    filter: "",
  },
  playful: {
    container: "grid grid-cols-2 gap-4 sm:grid-cols-3",
    cell: "aspect-square overflow-hidden rounded-3xl border border-aesthetic-fg/15",
    imageClass: "object-cover transition duration-500 hover:rotate-[-1deg] hover:scale-105",
    filter: "",
  },
  corporate: {
    container: "grid grid-cols-2 gap-3 sm:grid-cols-3",
    cell: "aspect-[4/3] overflow-hidden rounded-md border border-aesthetic-fg/10",
    imageClass: "object-cover transition duration-300 hover:scale-[1.02]",
    filter: "",
  },
  artistic: {
    container: "grid grid-cols-2 gap-6 sm:grid-cols-3 [grid-auto-rows:10rem]",
    cell: "overflow-hidden",
    imageClass: "object-cover transition duration-700 hover:scale-[1.04]",
    filter: "contrast-110 saturate-110",
  },
};

// Editorial-specific row spans to create a magazine-ish rhythm without
// needing actual image dimensions.
const EDITORIAL_SPANS = ["row-span-3", "row-span-2", "row-span-3", "row-span-2", "row-span-3", "row-span-2"];

export function GallerySection({ profile }: { profile: PublicProfile }) {
  if (profile.gallery.length === 0) return null;

  const style = AESTHETIC_STYLES[profile.aesthetic] ?? AESTHETIC_STYLES.minimal;
  const isEditorial = profile.aesthetic === "editorial";
  const isArtistic = profile.aesthetic === "artistic";

  return (
    <section className="space-y-4">
      <h2 className="font-aesthetic-display text-2xl">Galería</h2>
      <div className={cn(style.container, style.filter)}>
        {profile.gallery.map((img, i) => {
          const spanClass =
            isEditorial || isArtistic
              ? EDITORIAL_SPANS[i % EDITORIAL_SPANS.length]
              : "";
          return (
            <div key={img.path} className={cn(style.cell, spanClass, "relative")}>
              <Image
                src={img.url}
                alt={`Trabajo ${i + 1}`}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className={style.imageClass}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
