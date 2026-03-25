import type { AnswerQcResult } from "@/lib/domain/models/chat";
import type { RetrievedChunk } from "@/lib/domain/models/retrieval";

export interface QcService {
  evaluate(answer: string, retrievedChunks: RetrievedChunk[]): Promise<AnswerQcResult>;
}

