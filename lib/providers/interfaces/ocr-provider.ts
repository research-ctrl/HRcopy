import type { HealthState, ProviderFamily } from "@/lib/domain/types/common";

export interface OcrExtractionResult {
  text: string;
  method: "ocr-fallback";
}

export interface OcrProvider {
  readonly family: ProviderFamily | "local";
  readonly name: string;
  isConfigured(): boolean;
  healthCheck(): Promise<HealthState>;
  extract(buffer: Buffer, fileName: string): Promise<OcrExtractionResult>;
}
