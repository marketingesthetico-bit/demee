"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  ImageUploadError,
  deleteUserImage,
  generateAvatarPath,
  uploadUserImage,
} from "@/lib/firebase/storage-client";
import type { GalleryImage } from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

interface Props {
  value: GalleryImage | null;
  onChange: (value: GalleryImage | null) => void;
}

const ERROR_COPY: Record<string, string> = {
  "not-authenticated": "Debes iniciar sesión antes de subir imágenes.",
  "invalid-type": "Solo JPG, PNG o WebP.",
  "too-large": "Máximo 5 MB por imagen.",
  "upload-failed": "No se pudo subir la imagen. Inténtalo de nuevo.",
};

export function AvatarUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      // Delete the previous one so we don't accumulate orphans.
      if (value?.path) await deleteUserImage(value.path);
      const uploaded = await uploadUserImage({
        file,
        relativePath: generateAvatarPath(file),
      });
      onChange({ url: uploaded.url, path: uploaded.path });
    } catch (err) {
      const code = err instanceof ImageUploadError ? err.code : "upload-failed";
      setError(ERROR_COPY[code] ?? "Error inesperado.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (value?.path) await deleteUserImage(value.path);
    onChange(null);
  }

  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-paper transition",
          value ? "border-transparent" : "border-ink/20 hover:border-olive-500",
        )}
      >
        {value ? (
          <Image
            src={value.url}
            alt="Foto de perfil"
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="text-2xl">📷</span>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm hover:bg-ink/5 disabled:opacity-50"
          >
            {uploading ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
          </button>
          {value && (
            <button
              type="button"
              onClick={remove}
              className="text-sm text-ink/50 underline-offset-2 hover:text-ink hover:underline"
            >
              Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-ink/50">JPG, PNG o WebP · máx. 5 MB.</p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </div>
  );
}
