import type { DocumentVersionRecord } from "@/lib/domain/models/document";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedVersions } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import type { DocumentVersionRepository } from "@/lib/repositories/interfaces/document-version-repository";

export class LocalDocumentVersionRepository implements DocumentVersionRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).versions;
  }

  async listByDocumentId(documentId: string) {
    const versions = await readJsonFile<DocumentVersionRecord[]>(this.filePath, seedVersions);
    return versions
      .filter((version) => version.documentId === documentId)
      .sort((left, right) => right.versionNumber - left.versionNumber);
  }

  async getLatestByDocumentId(documentId: string) {
    const versions = await this.listByDocumentId(documentId);
    return versions[0] ?? null;
  }

  async create(record: DocumentVersionRecord) {
    const versions = await readJsonFile<DocumentVersionRecord[]>(this.filePath, seedVersions);
    versions.unshift(record);
    await writeJsonFile(this.filePath, versions);
    return record;
  }
}

