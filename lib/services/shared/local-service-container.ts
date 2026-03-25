import { CompatibleEmbeddingsProvider, CompatibleGenerationProvider } from "@/lib/providers/external/openai-compatible-providers";
import { MistralEmbeddingsProvider, MistralGenerationProvider } from "@/lib/providers/external/mistral-providers";
import { NvidiaEmbeddingsProvider, NvidiaGenerationProvider } from "@/lib/providers/external/nvidia-providers";
import { LocalEmbeddingsProvider } from "@/lib/providers/local/local-embeddings-provider";
import { LocalLlmProvider } from "@/lib/providers/local/local-llm-provider";
import { LocalOcrProvider } from "@/lib/providers/local/local-ocr-provider";
import { LocalPdfExtractor } from "@/lib/providers/local/local-pdf-extractor";
import { LocalStorageProvider } from "@/lib/providers/local/local-storage-provider";
import { SupabaseStorageProvider } from "@/lib/providers/supabase/supabase-storage-provider";
import { LocalTranslationProvider } from "@/lib/providers/local/local-translation-provider";
import { EmbeddingProviderRouter } from "@/lib/providers/router/embedding-provider-router";
import { LlmProviderRouter } from "@/lib/providers/router/llm-provider-router";
import { LocalChunkRepository } from "@/lib/repositories/local/local-chunk-repository";
import { LocalConversationRepository } from "@/lib/repositories/local/local-conversation-repository";
import { LocalDocumentRepository } from "@/lib/repositories/local/local-document-repository";
import { LocalDocumentVersionRepository } from "@/lib/repositories/local/local-document-version-repository";
import { LocalMonitoringRunRepository } from "@/lib/repositories/local/local-monitoring-run-repository";
import { LocalReviewRepository } from "@/lib/repositories/local/local-review-repository";
import { LocalSettingsRepository } from "@/lib/repositories/local/local-settings-repository";
import { LocalSourceRepository } from "@/lib/repositories/local/local-source-repository";
import { isSupabaseConfigured } from "@/lib/database/supabase";
import { SupabaseConversationRepository } from "@/lib/repositories/supabase/conversation-repository";
import { SupabaseDocumentRepository } from "@/lib/repositories/supabase/document-repository";
import { SupabaseSettingsRepository } from "@/lib/repositories/supabase/settings-repository";
import { LocalAnswerService } from "@/lib/services/answer-service";
import { LocalDocumentIngestionService } from "@/lib/services/document-ingestion-service";
import { LocalChatService } from "@/lib/services/local/local-chat-service";
import { LocalDashboardService } from "@/lib/services/local/local-dashboard-service";
import { LocalDocumentService } from "@/lib/services/local/local-document-service";
import { LocalMonitoringService } from "@/lib/services/local/local-monitoring-service";
import { LocalSourceGovernanceService } from "@/lib/services/local/local-source-governance-service";
import { LocalMonitorService } from "@/lib/services/monitor-service";
import { LocalQcService } from "@/lib/services/qc-service";
import { LocalRetrievalService } from "@/lib/services/retrieval-service";
import { LocalTranslationService } from "@/lib/services/translation-service";

export function createLocalContainer(root?: string) {
  const useSupabase = isSupabaseConfigured();

  const documentRepository = useSupabase
    ? new SupabaseDocumentRepository()
    : new LocalDocumentRepository(root);
  // Use local for now until Supabase repos are fully implemented
  const documentVersionRepository = new LocalDocumentVersionRepository(root);
  const chunkRepository = new LocalChunkRepository(root);
  const sourceRepository = new LocalSourceRepository(root);
  const reviewRepository = new LocalReviewRepository(root);
  const monitoringRunRepository = new LocalMonitoringRunRepository(root);
  const conversationRepository = useSupabase
    ? new SupabaseConversationRepository()
    : new LocalConversationRepository(root);
  const settingsRepository = useSupabase
    ? new SupabaseSettingsRepository()
    : new LocalSettingsRepository(root);

  const localLlmProvider = new LocalLlmProvider();
  const localEmbeddingsProvider = new LocalEmbeddingsProvider();
  const nvidiaGenerationProvider = new NvidiaGenerationProvider();
  const nvidiaEmbeddingsProvider = new NvidiaEmbeddingsProvider();
  const mistralGenerationProvider = new MistralGenerationProvider();
  const mistralEmbeddingsProvider = new MistralEmbeddingsProvider();
  const compatibleGenerationProvider = new CompatibleGenerationProvider();
  const compatibleEmbeddingsProvider = new CompatibleEmbeddingsProvider();
  const storageProvider = useSupabase ? new SupabaseStorageProvider() : new LocalStorageProvider(root);
  const pdfExtractor = new LocalPdfExtractor();
  const ocrProvider = new LocalOcrProvider();
  const translationProvider = new LocalTranslationProvider();

  const llmRouter = new LlmProviderRouter([
    mistralGenerationProvider,
    nvidiaGenerationProvider,
    compatibleGenerationProvider,
    localLlmProvider,
  ]);

  const embeddingRouter = new EmbeddingProviderRouter([
    nvidiaEmbeddingsProvider,
    mistralEmbeddingsProvider,
    compatibleEmbeddingsProvider,
    localEmbeddingsProvider,
  ]);

  const documentIngestionService = new LocalDocumentIngestionService(
    documentRepository,
    documentVersionRepository,
    chunkRepository,
    storageProvider,
    pdfExtractor,
    ocrProvider,
    embeddingRouter,
  );

  const retrievalService = new LocalRetrievalService(
    chunkRepository,
    documentRepository,
    sourceRepository,
    embeddingRouter,
  );

  const qcService = new LocalQcService();
  const answerService = new LocalAnswerService(
    retrievalService,
    qcService,
    llmRouter,
    conversationRepository,
    reviewRepository,
  );
  const monitorService = new LocalMonitorService(monitoringRunRepository, sourceRepository);

  return {
    repositories: {
      documentRepository,
      documentVersionRepository,
      chunkRepository,
      sourceRepository,
      reviewRepository,
      monitoringRunRepository,
      conversationRepository,
      settingsRepository,
    },
    providers: {
      llmRouter,
      embeddingRouter,
      llmProviders: [
        mistralGenerationProvider,
        nvidiaGenerationProvider,
        compatibleGenerationProvider,
        localLlmProvider,
      ],
      embeddingProviders: [
        nvidiaEmbeddingsProvider,
        mistralEmbeddingsProvider,
        compatibleEmbeddingsProvider,
        localEmbeddingsProvider,
      ],
      storageProvider,
      pdfExtractor,
      ocrProvider,
      translationProvider,
    },
    services: {
      documentIngestionService,
      retrievalService,
      answerService,
      qcService,
      monitorService,
      chatService: new LocalChatService(answerService, reviewRepository),
      documentService: new LocalDocumentService(documentRepository, documentIngestionService),
      sourceGovernanceService: new LocalSourceGovernanceService(sourceRepository),
      monitoringService: new LocalMonitoringService(monitorService),
      translationService: new LocalTranslationService(translationProvider),
      dashboardService: new LocalDashboardService(
        settingsRepository,
        documentRepository,
        sourceRepository,
        reviewRepository,
      ),
    },
  };
}

export const localContainer = createLocalContainer();
