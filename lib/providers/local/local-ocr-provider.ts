import type { OcrExtractionResult, OcrProvider } from "@/lib/providers/interfaces/ocr-provider";

async function notConfigured<T>(fileName: string): Promise<T> {
  throw new Error(`OCR fallback is not wired in local mode for ${fileName}.`);
}

export class LocalOcrProvider implements OcrProvider {
  readonly family = "local" as const;
  readonly name = "local-ocr-unwired";

  isConfigured() {
    return false;
  }

  async healthCheck() {
    return "degraded" as const;
  }

  async extract(_buffer: Buffer, fileName: string): Promise<OcrExtractionResult> {
    return notConfigured<OcrExtractionResult>(fileName);
  }
}
