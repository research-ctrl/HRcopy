import path from "node:path";
import { createWorker } from "tesseract.js";
import type { OcrExtractionResult, OcrProvider } from "@/lib/providers/interfaces/ocr-provider";

export class LocalOcrProvider implements OcrProvider {
  readonly family = "local" as const;
  readonly name = "local-tesseract-ocr";
  private workerPromise?: ReturnType<typeof createWorker>;

  private get languagePath() {
    return path.join(process.cwd(), "node_modules", "@tesseract.js-data", "por", "4.0.0");
  }

  private async getWorker() {
    if (!this.workerPromise) {
      this.workerPromise = createWorker("por", 1, {
        langPath: this.languagePath,
        cacheMethod: "none",
        logger: () => undefined,
      });
    }

    return this.workerPromise;
  }

  isConfigured() {
    return true;
  }

  async healthCheck() {
    return "healthy" as const;
  }

  async extract(buffer: Buffer, fileName: string): Promise<OcrExtractionResult> {
    const worker = await this.getWorker();
    const result = await worker.recognize(buffer);
    const text = result.data.text.replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error(`OCR could not detect readable text in ${fileName}.`);
    }

    return {
      text,
      method: "ocr-fallback",
    };
  }
}
