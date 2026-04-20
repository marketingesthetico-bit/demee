"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  ImageUploadError,
  deleteUserImage,
  generatePortfolioPath,
  uploadUserImage,
} from "@/lib/firebase/storage-client";
import type {
  PortfolioDetail,
  PortfolioVideo,
  PublicGalleryImage,
  PublicPortfolioItem,
} from "@/lib/profile/public";
import { detectVideoProvider } from "@/lib/profile/video-embed";
import { cn } from "@/lib/utils";

const UPLOAD_ERRORS: Record<string, string> = {
  "not-authenticated": "Inicia sesión antes de subir.",
  "invalid-type": "Solo JPG, PNG o WebP.",
  "too-large": "Máximo 5 MB.",
  "upload-failed": "No se pudo subir. Reintenta.",
};

function genId(): string {
  return `p${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

interface Props {
  value: PublicPortfolioItem[];
  onChange: (next: PublicPortfolioItem[]) => void;
  handle: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "sin fecha";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "sin fecha";
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "hoy";
  if (days < 7) return `hace ${days} d`;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function emptyDetail(): PortfolioDetail {
  return { longDescription: "", images: [], videos: [] };
}

export function PortfolioForm({ value, onChange, handle }: Props) {
  // Always display in reverse chronological order. The array passed in
  // mirrors persistence; we sort a view copy so edits don't thrash.
  const sorted = useMemo(() => {
    return [...value].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [value]);

  function patch(id: string, changes: Partial<PublicPortfolioItem>) {
    onChange(value.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }

  function remove(id: string) {
    const target = value.find((v) => v.id === id);
    if (target?.image?.path) void deleteUserImage(target.image.path);
    if (target?.detail?.images) {
      for (const img of target.detail.images) void deleteUserImage(img.path);
    }
    onChange(value.filter((s) => s.id !== id));
  }

  function add() {
    if (value.length >= 12) return;
    onChange([
      ...value,
      {
        id: genId(),
        title: "Nuevo proyecto",
        description: "",
        link: null,
        image: null,
        createdAt: new Date().toISOString(),
        hasDetailPage: false,
        detail: null,
      },
    ]);
  }

  function toggleDetail(id: string, next: boolean) {
    const item = value.find((v) => v.id === id);
    if (!item) return;
    patch(id, {
      hasDetailPage: next,
      detail: next ? item.detail ?? emptyDetail() : item.detail,
    });
  }

  function patchDetail(id: string, changes: Partial<PortfolioDetail>) {
    const item = value.find((v) => v.id === id);
    if (!item) return;
    const current = item.detail ?? emptyDetail();
    patch(id, { detail: { ...current, ...changes } });
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 && (
        <p className="rounded-md border border-dashed border-ink/15 bg-paper/60 px-3 py-4 text-center text-sm text-ink/60">
          Sin proyectos todavía. Añade el primero.
        </p>
      )}

      <ul className="space-y-3">
        {sorted.map((item) => (
          <li key={item.id} className="space-y-3 rounded-md border border-ink/10 bg-paper/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) => patch(item.id, { title: e.target.value })}
                placeholder="Título del proyecto"
                maxLength={120}
                className="flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
              />
              <IconButton label="Quitar" onClick={() => remove(item.id)} variant="danger">
                ×
              </IconButton>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink/50">
              <span>Añadido {formatDate(item.createdAt)}</span>
              {item.hasDetailPage && (
                <a
                  href={`/${handle}/work/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-olive-700 hover:underline"
                >
                  Ver página ↗
                </a>
              )}
            </div>

            <div className="flex gap-3">
              <PortfolioImageSlot
                image={item.image}
                onChange={(next) => patch(item.id, { image: next })}
              />
              <div className="flex flex-1 flex-col gap-2">
                <textarea
                  value={item.description}
                  onChange={(e) => patch(item.id, { description: e.target.value })}
                  placeholder="Qué hiciste, para quién y qué conseguisteis."
                  rows={3}
                  maxLength={280}
                  className="w-full flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
                <input
                  type="url"
                  value={item.link ?? ""}
                  onChange={(e) =>
                    patch(item.id, { link: e.target.value.trim() === "" ? null : e.target.value })
                  }
                  placeholder="Enlace externo (opcional)"
                  className="w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
                />
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-md border border-ink/10 bg-white p-3">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-ink">Página de detalles</div>
                <div className="text-xs text-ink/60">
                  {item.hasDetailPage
                    ? `Vive en /${handle}/work/${item.id}`
                    : "Añade texto largo, imágenes y vídeos en una página propia."}
                </div>
              </div>
              <Switch
                on={item.hasDetailPage}
                onClick={() => toggleDetail(item.id, !item.hasDetailPage)}
              />
            </div>

            {item.hasDetailPage && (
              <DetailEditor
                detail={item.detail ?? emptyDetail()}
                onChange={(changes) => patchDetail(item.id, changes)}
              />
            )}
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

function DetailEditor({
  detail,
  onChange,
}: {
  detail: PortfolioDetail;
  onChange: (next: Partial<PortfolioDetail>) => void;
}) {
  return (
    <div className="space-y-4 rounded-md border border-olive-200 bg-olive-50/40 p-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/60">
          Descripción larga
        </span>
        <textarea
          value={detail.longDescription}
          onChange={(e) => onChange({ longDescription: e.target.value })}
          rows={6}
          maxLength={6000}
          placeholder="El contexto, las decisiones clave, los resultados. Puedes usar varios párrafos."
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20"
        />
      </label>

      <DetailImagesField
        images={detail.images}
        onChange={(images) => onChange({ images })}
      />

      <DetailVideosField
        videos={detail.videos}
        onChange={(videos) => onChange({ videos })}
      />
    </div>
  );
}

function DetailImagesField({
  images,
  onChange,
}: {
  images: PublicGalleryImage[];
  onChange: (next: PublicGalleryImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: FileList) {
    setError(null);
    const remaining = 12 - images.length;
    if (remaining <= 0) {
      setError("Máximo 12 imágenes.");
      return;
    }
    const chosen = Array.from(files).slice(0, remaining);
    setUploading(chosen.length);
    const added: PublicGalleryImage[] = [];
    for (const f of chosen) {
      try {
        const uploaded = await uploadUserImage({
          file: f,
          relativePath: generatePortfolioPath(f),
        });
        added.push({ url: uploaded.url, path: uploaded.path });
      } catch (err) {
        const code = err instanceof ImageUploadError ? err.code : "upload-failed";
        setError(UPLOAD_ERRORS[code] ?? "Error.");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
    if (added.length > 0) onChange([...images, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(idx: number) {
    const t = images[idx];
    if (!t) return;
    await deleteUserImage(t.path);
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/60">
          Imágenes del proyecto
        </span>
        <span className="text-[11px] text-ink/50">{images.length} / 12</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {images.map((img, i) => (
          <div
            key={img.path}
            className="group relative aspect-square overflow-hidden rounded-md border border-ink/10 bg-white"
          >
            <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => void remove(i)}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[11px] text-white opacity-0 transition group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="aspect-square animate-pulse rounded-md border border-ink/10 bg-ink/5"
          />
        ))}
        {images.length < 12 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-ink/20 text-xs text-ink/60 hover:border-olive-500 hover:bg-white"
          >
            + imagen
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) void addFiles(e.target.files);
        }}
      />
    </div>
  );
}

function DetailVideosField({
  videos,
  onChange,
}: {
  videos: PortfolioVideo[];
  onChange: (next: PortfolioVideo[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    const url = draft.trim();
    if (!url) return;
    const provider = detectVideoProvider(url);
    if (!provider) {
      setError("Solo YouTube, Vimeo o archivos .mp4 / .webm / .ogg.");
      return;
    }
    if (videos.length >= 6) {
      setError("Máximo 6 vídeos.");
      return;
    }
    onChange([...videos, { url, provider }]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/60">
          Vídeos
        </span>
        <span className="text-[11px] text-ink/50">{videos.length} / 6</span>
      </div>

      {videos.length > 0 && (
        <ul className="space-y-1.5">
          {videos.map((v, i) => (
            <li
              key={`${v.url}-${i}`}
              className="flex items-center justify-between gap-2 rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink/60">
                  {v.provider}
                </span>{" "}
                <span className="truncate align-middle text-ink/70">{v.url}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange(videos.filter((_, idx) => idx !== i))}
                aria-label="Quitar vídeo"
                className="text-ink/50 hover:text-danger"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {videos.length < 6 && (
        <div className="flex gap-1.5">
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="https://youtube.com/watch?v=… · vimeo.com/… · *.mp4"
            className="flex-1 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-olive-500"
          />
          <button
            type="button"
            onClick={add}
            className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/70 hover:bg-ink/5"
          >
            Añadir
          </button>
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
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

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition",
        on ? "bg-olive-500" : "bg-ink/20",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition",
          on ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </button>
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
