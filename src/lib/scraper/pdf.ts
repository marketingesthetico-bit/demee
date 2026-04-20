import "server-only";

// The default entry of pdf-parse ships with a bundled debug file that only
// loads when require.main === module. Importing from the lib path avoids
// the "./test/data/05-versions-space.pdf" ENOENT surprise in serverless envs.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import { ScrapeError } from "./fetch-html";

export const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4 MB

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (buffer.byteLength > MAX_PDF_BYTES) {
    throw new ScrapeError("too-large", `pdf=${buffer.byteLength}`);
  }
  try {
    const result = await pdfParse(buffer, { max: 20 });
    const text = result.text.trim();
    if (text.length < 40) {
      throw new ScrapeError("empty-text", `${text.length} chars`);
    }
    return text
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join("\n")
      .slice(0, 16_000);
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    console.error("[scraper/pdf] parse failed", err);
    throw new ScrapeError("fetch-failed", (err as Error).message);
  }
}
