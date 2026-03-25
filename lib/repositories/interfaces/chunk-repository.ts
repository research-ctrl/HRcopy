import type { DocumentChunkRecord } from "@/lib/domain/models/document";

export interface ChunkRepository {
  list(): Promise<DocumentChunkRecord[]>;
  listByDocumentId(documentId: string): Promise<DocumentChunkRecord[]>;
  replaceForVersion(versionId: string, chunks: DocumentChunkRecord[]): Promise<void>;
}
