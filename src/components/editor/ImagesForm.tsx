"use client";

import { AvatarUpload } from "@/components/onboarding/AvatarUpload";
import { GalleryUpload } from "@/components/onboarding/GalleryUpload";
import type { GalleryImage } from "@/lib/onboarding/draft";
import type {
  PublicGalleryImage,
} from "@/lib/profile/public";
import type { EditableProfile } from "@/lib/profile/editable";

interface Props {
  header: EditableProfile["header"];
  gallery: PublicGalleryImage[];
  onHeaderChange: (next: EditableProfile["header"]) => void;
  onGalleryChange: (next: PublicGalleryImage[]) => void;
}

export function ImagesForm({ header, gallery, onHeaderChange, onGalleryChange }: Props) {
  const avatar: GalleryImage | null =
    header.photoURL && header.photoPath
      ? { url: header.photoURL, path: header.photoPath }
      : null;

  function setAvatar(next: GalleryImage | null) {
    onHeaderChange({
      ...header,
      photoURL: next?.url ?? null,
      photoPath: next?.path ?? null,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink">Foto tuya</label>
        <AvatarUpload value={avatar} onChange={setAvatar} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink">
          Galería de trabajo <span className="font-normal text-ink/50">(hasta 6)</span>
        </label>
        <GalleryUpload value={gallery} onChange={onGalleryChange} max={6} />
        <p className="text-xs text-ink/50">
          La galería se adapta al estilo visual elegido: minimal, editorial o bold la renderizan de
          forma distinta.
        </p>
      </div>
    </div>
  );
}
