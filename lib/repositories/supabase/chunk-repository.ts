import type { DocumentChunkRecord } from "@/lib/domain/models/document";
import type { ChunkRepository } from "@/lib/repositories/interfaces/chunk-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error(
    "Supabase chunk repository is not implemented. Use local adapters for now."
  );
}

export class SupabaseChunkRepository implements ChunkRepository {
  async list(): Promise<DocumentChunkRecord[]> {
    return notImplemented<DocumentChunkRecord[]>();
  }

  async listByDocumentId(
    _documentId: string
  ): Promise<DocumentChunkRecord[]> {
    return notImplemented<DocumentChunkRecord[]>();
  }

  async replaceForVersion(
    _versionId: string,
    _chunks: DocumentChunkRecord[]
  ): Promise<void> {
    return notImplemented<void>();
  }

  async deleteByDocumentId(_documentId: string): Promise<void> {
    return notImplemented<void>();
  }
}
