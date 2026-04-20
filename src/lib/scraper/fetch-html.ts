import "server-only";

import * as cheerio from "cheerio";

export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB

export class ScrapeError extends Error {
  constructor(
    public code:
      | "timeout"
      | "too-large"
      | "non-html"
      | "not-found"
      | "bot-blocked"
      | "fetch-failed"
      | "empty-text",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ScrapeError";
  }
}

interface FetchHtmlResult {
  text: string;
  title: string | null;
  ogDescription: string | null;
  finalUrl: string;
}

export async function fetchAndExtractText(url: string): Promise<FetchHtmlResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "DemeeImporter/1.0 (+https://demee.app; contact: hola@demee.app)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "Accept-Language": "es,en;q=0.8",
      },
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    throw new ScrapeError(isAbort ? "timeout" : "fetch-failed", (err as Error).message);
  }
  clearTimeout(timer);

  if (response.status === 403 || response.status === 429) {
    throw new ScrapeError("bot-blocked", `HTTP ${response.status}`);
  }
  if (response.status === 404) {
    throw new ScrapeError("not-found", "HTTP 404");
  }
  if (!response.ok) {
    throw new ScrapeError("fetch-failed", `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new ScrapeError("non-html", contentType);
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength && contentLength > MAX_HTML_BYTES) {
    throw new ScrapeError("too-large", `content-length=${contentLength}`);
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_HTML_BYTES) {
    throw new ScrapeError("too-large", `body=${buffer.byteLength}`);
  }

  const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const result = extractTextFromHtml(html);
  if (!result.text || result.text.length < 40) {
    throw new ScrapeError("empty-text", `${result.text.length} chars`);
  }
  return { ...result, finalUrl: response.url };
}

export function extractTextFromHtml(html: string): Omit<FetchHtmlResult, "finalUrl"> {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe, svg, nav, footer, header, form").remove();
  $("[aria-hidden=true]").remove();

  const title = $("title").first().text().trim() || null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    null;

  const main =
    $("main").text() || $("article").text() || $("body").text() || $.text();

  const text = collapseWhitespace(main).slice(0, 16_000);
  return { text, title, ogDescription };
}

function collapseWhitespace(input: string): string {
  return input
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}
