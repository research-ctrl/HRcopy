import type { ProviderFamily } from "@/lib/domain/types/common";

export type TranslationLanguage = "pt-PT" | "en-GB";

export interface TranslationRequest {
  text: string;
  targetLanguage: TranslationLanguage;
  sourceLanguage?: TranslationLanguage | "auto";
}

export interface TranslationResult {
  text: string;
  sourceLanguage: TranslationLanguage | "auto";
  targetLanguage: TranslationLanguage;
  provider: ProviderFamily | "local";
  notice?: string;
}
