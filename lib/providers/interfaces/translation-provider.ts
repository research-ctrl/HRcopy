import type { TranslationLanguage, TranslationResult } from "@/lib/domain/models/translation";
import type { HealthState, ProviderFamily } from "@/lib/domain/types/common";

export interface TranslationProvider {
  readonly family: ProviderFamily | "local";
  readonly name: string;
  isConfigured(): boolean;
  healthCheck(): Promise<HealthState>;
  translate(input: {
    text: string;
    targetLanguage: TranslationLanguage;
    sourceLanguage?: TranslationLanguage | "auto";
  }): Promise<TranslationResult>;
}
