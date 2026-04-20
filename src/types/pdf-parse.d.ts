declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseOptions {
    max?: number;
    pagerender?: (pageData: unknown) => string | Promise<string>;
    version?: string;
  }

  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdf(data: Buffer | Uint8Array, options?: PdfParseOptions): Promise<PdfParseResult>;

  export default pdf;
}
