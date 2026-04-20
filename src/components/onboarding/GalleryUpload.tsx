"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  ImageUploadError,
  deleteUserImage,
  generateGalleryPath,
  uploadUserImage,
} from "@/lib/firebase/storage-client";
import type { GalleryImage } from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

interface Props {
  value: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
  max?: number;
}

const ERROR_COPY: Record<string, string> = {
  "not-authenticated": "Debes iniciar sesión antes de subir imágenes.",
  "invalid-type": "Solo JPG, PNG o WebP.",
  "too-large": "Máximo 5 MB por imagen.",
  "upload-failed": "No se pudo subir alguna imagen. Inténtalo de nuevo.",
};

export function GalleryUpload({ value, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Máximo ${max} imágenes.`);
      return;
    }
    const chosen = Array.from(files).slice(0, remaining);

    setUploadingCount(chosen.length);
    const results: GalleryImage[] = [];
    for (const file of chosen) {
      try {
        const uploaded = await uploadUserImage({
          file,
          relativePath: generateGalleryPath(file),
        });
        results.push({ url: uploaded.url, path: uploaded.path });
      } catch (err) {
        const code = err instanceof ImageUploadError ? err.code : "upload-failed";
        setError(ERROR_COPY[code] ?? "Error inesperado.");
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    }
    if (results.length > 0) onChange([...value, ...results]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(index: number) {
    const target = value[index];
    if (!target) return;
    await deleteUserImage(target.path);
    onChange(value.filter((_, i) => i !== index));
  }

  const canAdd = value.length < max && uploadingCount === 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {value.map((img, i) => (
          <div
            key={img.path}
            className="group relative aspect-square overflow-hidden rounded-md border border-ink/10 bg-paper"
          >
            <Image
              src={img.url}
              alt={`Imagen ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => void remove(i)}
              aria-label={`Quitar imagen ${i + 1}`}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="aspect-square animate-pulse rounded-md border border-ink/10 bg-ink/5"
          />
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-ink/20 text-center text-xs text-ink/60",
              "hover:border-olive-500 hover:bg-olive-50",
            )}
          >
            <span className="text-xl">+</span>
            <span>Añadir</span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-ink/50">
        <span>
          {value.length} / {max} imágenes · JPG, PNG o WebP · máx. 5 MB cada una
        </span>
        {error && <span className="text-danger">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) void handleFiles(e.target.files);
        }}
      />
    </div>
  );
}
