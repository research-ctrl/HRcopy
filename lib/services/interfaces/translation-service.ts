import type { TranslationRequest, TranslationResult } from "@/lib/domain/models/translation";

export interface TranslationService {
  translate(request: TranslationRequest): Promise<TranslationResult>;
}
