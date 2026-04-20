"use client";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { getFirebaseAuth, getFirebaseStorage } from "./client";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class ImageUploadError extends Error {
  constructor(
    public code:
      | "not-authenticated"
      | "invalid-type"
      | "too-large"
      | "upload-failed",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ImageUploadError";
  }
}

export interface UploadedImage {
  url: string;
  path: string;
  contentType: string;
  sizeBytes: number;
}

interface UploadOptions {
  file: File;
  /**
   * Relative path under /users/{uid}/. Do NOT include a leading slash.
   * Examples: "avatar.jpg", "gallery/1716.jpg".
   */
  relativePath: string;
}

function extensionFor(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "bin";
}

export function generateAvatarPath(file: File): string {
  return `avatar.${extensionFor(file.type)}`;
}

export function generateGalleryPath(file: File): string {
  const ts = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `gallery/${ts}-${random}.${extensionFor(file.type)}`;
}

function validate(file: File): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageUploadError("invalid-type", file.type);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError("too-large", `${file.size}`);
  }
}

export async function uploadUserImage({
  file,
  relativePath,
}: UploadOptions): Promise<UploadedImage> {
  validate(file);

  const auth = getFirebaseAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new ImageUploadError("not-authenticated");
  }

  const fullPath = `users/${uid}/${relativePath}`;
  const storageRef = ref(getFirebaseStorage(), fullPath);

  try {
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });
    const url = await getDownloadURL(snapshot.ref);
    return {
      url,
      path: fullPath,
      contentType: file.type,
      sizeBytes: snapshot.metadata.size,
    };
  } catch (err) {
    console.error("[storage/upload] failed", err);
    throw new ImageUploadError("upload-failed", (err as Error).message);
  }
}

export async function deleteUserImage(path: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) return;
  try {
    await deleteObject(ref(getFirebaseStorage(), path));
  } catch (err) {
    // Best-effort; deleting a missing file is fine.
    console.warn("[storage/delete] failed", err);
  }
}
