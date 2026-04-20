import type { VideoProvider } from "./public";

/**
 * Detects the video provider from a raw URL.
 * Supports YouTube (watch?v=, youtu.be, /shorts/, /embed/), Vimeo, and
 * direct video file URLs (.mp4, .webm, .ogg, .mov).
 */
export function detectVideoProvider(rawUrl: string): VideoProvider | null {
  const url = rawUrl.trim();
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    return "youtube";
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    return "vimeo";
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(parsed.pathname)) {
    return "direct";
  }
  return null;
}

/** Extracts a YouTube video id from any of the common URL shapes. */
export function youtubeIdFromUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return v;
      // /shorts/abc or /embed/abc
      const m = u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/);
      if (m) return m[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Extracts the numeric video id from a Vimeo URL. */
export function vimeoIdFromUrl(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const m = u.pathname.match(/(\d{4,})/);
    return m ? m[1] ?? null : null;
  } catch {
    return null;
  }
}

export function embedUrlFor(
  url: string,
  provider: VideoProvider,
): string | null {
  if (provider === "youtube") {
    const id = youtubeIdFromUrl(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (provider === "vimeo") {
    const id = vimeoIdFromUrl(url);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
