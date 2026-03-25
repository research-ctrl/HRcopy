import type { RetrievedChunk } from "@/lib/domain/models/retrieval";

export interface RetrievalService {
  retrieve(question: string, topK?: number): Promise<RetrievedChunk[]>;
}

