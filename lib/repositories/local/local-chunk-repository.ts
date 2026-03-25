import type { DocumentChunkRecord } from "@/lib/domain/models/document";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedChunks } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import type { ChunkRepository } from "@/lib/repositories/interfaces/chunk-repository";

export class LocalChunkRepository implements ChunkRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).chunks;
  }

  async list() {
    return readJsonFile<DocumentChunkRecord[]>(this.filePath, seedChunks);
  }

  async listByDocumentId(documentId: string) {
    const chunks = await this.list();
    return chunks.filter((chunk) => chunk.documentId === documentId);
  }

  async replaceForVersion(versionId: string, chunks: DocumentChunkRecord[]) {
    const current = await this.list();
    const next = current.filter((chunk) => chunk.versionId !== versionId);
    await writeJsonFile(this.filePath, [...chunks, ...next]);
  }

  async deleteByDocumentId(documentId: string) {
    const current = await this.list();
    await writeJsonFile(this.filePath, current.filter((c) => c.documentId !== documentId));
  }
}
