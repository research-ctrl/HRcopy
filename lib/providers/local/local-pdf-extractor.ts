import pdfParse from "pdf-parse/lib/pdf-parse.js";
import type { PdfExtractor } from "@/lib/providers/interfaces/pdf-extractor";

export class LocalPdfExtractor implements PdfExtractor {
  async healthCheck() {
    return "healthy" as const;
  }

  async extract(buffer: Buffer) {
    const parsed = await pdfParse(buffer);
    const pages = parsed.text
      .split(/\f+/)
      .map((page: string) => page.trim())
      .filter(Boolean);

    return {
      text: parsed.text.trim(),
      pages: pages.length ? pages : [parsed.text.trim()],
      pageCount: parsed.numpages || pages.length || 1,
      method: "pdf-text" as const,
    };
  }
}
