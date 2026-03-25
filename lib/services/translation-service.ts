import type { TranslationRequest } from "@/lib/domain/models/translation";
import type { TranslationProvider } from "@/lib/providers/interfaces/translation-provider";
import type { TranslationService } from "@/lib/services/interfaces/translation-service";

export class LocalTranslationService implements TranslationService {
  constructor(private readonly translationProvider: TranslationProvider) {}

  async translate(request: TranslationRequest) {
    return this.translationProvider.translate(request);
  }
}
