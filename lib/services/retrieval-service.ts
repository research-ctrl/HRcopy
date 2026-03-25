import type { RetrievedChunk } from "@/lib/domain/models/retrieval";
import type { EmbeddingProviderRouter } from "@/lib/providers/router/embedding-provider-router";
import type { ChunkRepository } from "@/lib/repositories/interfaces/chunk-repository";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";
import { isChunkRetrievable } from "@/lib/retrieval/filtering";
import { cosineSimilarity, keywordOverlapScore } from "@/lib/retrieval/scoring";
import type { RetrievalService } from "@/lib/services/interfaces/retrieval-service";

export class LocalRetrievalService implements RetrievalService {
  constructor(
    private readonly chunkRepository: ChunkRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly embeddingRouter: EmbeddingProviderRouter,
  ) {}

  async retrieve(question: string, topK = 5) {
    const [chunks, documents, sources, queryEmbedding] = await Promise.all([
      this.chunkRepository.list(),
      this.documentRepository.list(),
      this.sourceRepository.list(),
      this.embeddingRouter.embedText(question),
    ]);

    const documentsById = new Map(documents.map((document) => [document.id, document]));
    const sourcesById = new Map(sources.map((source) => [source.id, source]));

    const retrieved: RetrievedChunk[] = chunks
      .flatMap((chunk) => {
        const document = documentsById.get(chunk.documentId);
        const source = chunk.sourceId ? sourcesById.get(chunk.sourceId) : undefined;
        if (!document || !isChunkRetrievable(chunk, document, source)) {
          return [];
        }

        return [{ chunk, document, source }];
      })
      .map((entry) => {
        const vectorScore = cosineSimilarity(queryEmbedding, entry.chunk.embedding);
        const lexicalScore = keywordOverlapScore(question, entry.chunk);
        const score = vectorScore * 0.75 + lexicalScore * 0.25;

        return {
          chunk: entry.chunk,
          document: entry.document,
          source: entry.source,
          score,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, topK);

    return retrieved;
  }
}
