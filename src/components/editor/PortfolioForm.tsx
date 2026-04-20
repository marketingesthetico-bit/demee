"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  ImageUploadError,
  deleteUserImage,
  generatePortfolioPath,
  uploadUserImage,
} from "@/lib/firebase/storage-client";
import type { PublicPortfolioItem } from "@/lib/profile/public";
import { cn } from "@/lib/utils";

const UPLOAD_ERRORS: Record<string, string> = {
  "not-authenticated": "Inicia sesión antes de subir.",
  "invalid-type": "Solo JPG, PNG o WebP.",
  "too-large": "Máximo 5 MB.",
  "upload-failed": "No se pudo subir. Reintenta.",
};

interface Props {
  value: PublicPortfolioItem[];
  onChange: (next: PublicPortfolioItem[]) => void;
}

export function PortfolioForm({ value, onChange }: Props) {
  function patchAt(index: number, changes: Partial<PublicPortfolioItem>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  }

  function remove(index: number) {
    const target = value[index];
    if (target?.image?.path) void deleteUserImage(target.image.path);
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    onChange(next);
  }

  function add() {
    if (value.length >= 12) return;
    onChange([
      ...value,
      { title: "Nuevo proyecto", description: "", link: null, image: null },
    ]);
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="rounded-md border border-dashed border-ink/15 bg-paper/60 px-3 py-4 text-center text-sm text-ink/60">
          Sin proyectos todavía. Añade el primero.
        </p>
      )}

      <ul className="space-y-3">
        {value.map((item, i) => (
          <li key={i} className="space-y-3 rounded-md border border-ink/10 bg-paper/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => patchAt(i, { title: e.target.value })}
                placeholder="Título del proyecto"
                maxLength={120}
                className="flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              />
              <div className="flex items-center gap-0.5">
                <IconButton label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </IconButton>
                <IconButton
                  label="Bajar"
                  onClick={() => move(i, +1)}
                  disabled={i === value.length - 1}
                >
                  ↓
                </IconButton>
                <IconButton label="Quitar" onClick={() => remove(i)} variant="danger">
                  ×
                </IconButton>
              </div>
            </div>

            <div className="flex gap-3">
              <PortfolioImageSlot
                image={item.image}
                onChange={(next) => patchAt(i, { image: next })}
              />
              <div className="flex flex-1 flex-col gap-2">
                <textarea
                  value={item.description}
                  onChange={(e) => patchAt(i, { description: e.target.value })}
                  placeholder="Qué hiciste, para quién y qué conseguisteis."
                  rows={3}
                  maxLength={280}
                  className="w-full flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
                <input
                  type="url"
                  value={item.link ?? ""}
                  onChange={(e) =>
                    patchAt(i, { link: e.target.value.trim() === "" ? null : e.target.value })
                  }
                  placeholder="Enlace (opcional)"
                  className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {value.length < 12 && (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm text-ink/70 hover:border-olive-500 hover:bg-olive-50"
        >
          + Añadir proyecto
        </button>
      )}
    </div>
  );
}

function PortfolioImageSlot({
  image,
  onChange,
}: {
  image: PublicPortfolioItem["image"];
  onChange: (next: PublicPortfolioItem["image"]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      if (image?.path) await deleteUserImage(image.path);
      const uploaded = await uploadUserImage({
        file,
        relativePath: generatePortfolioPath(file),
      });
      onChange({ url: uploaded.url, path: uploaded.path });
    } catch (err) {
      const code = err instanceof ImageUploadError ? err.code : "upload-failed";
      setError(UPLOAD_ERRORS[code] ?? "Error.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (image?.path) await deleteUserImage(image.path);
    onChange(null);
  }

  return (
    <div className="shrink-0 space-y-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-white transition",
          image ? "border-transparent" : "border-ink/20 hover:border-olive-500 hover:bg-olive-50",
        )}
        aria-label="Subir imagen del proyecto"
      >
        {image ? (
          <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
        ) : uploading ? (
          <span className="text-xs text-ink/50">Subiendo…</span>
        ) : (
          <span className="text-xs text-ink/50">+ imagen</span>
        )}
      </button>
      {image && (
        <button
          type="button"
          onClick={removeImage}
          className="block w-full text-center text-[10px] text-ink/50 underline-offset-2 hover:text-danger hover:underline"
        >
          Quitar
        </button>
      )}
      {error && <p className="text-[10px] text-danger">{error}</p>}
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

function IconButton({
  children,
  onClick,
  disabled,
  label,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  variant?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-sm transition",
        "hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-30",
        variant === "danger" && "hover:bg-danger/10 hover:text-danger",
      )}
    >
      {children}
    </button>
  );
}
