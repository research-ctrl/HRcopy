import type { HealthState } from "@/lib/domain/types/common";

export interface PdfExtractionResult {
  text: string;
  pages: string[];
  pageCount: number;
  method: "pdf-text";
}

export interface PdfExtractor {
  healthCheck(): Promise<HealthState>;
  extract(buffer: Buffer, fileName: string): Promise<PdfExtractionResult>;
}
