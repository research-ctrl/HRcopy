import type { DocumentRecord } from "@/lib/domain/models/document";
import { seedDocuments } from "@/lib/persistence/local-seeds";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";

export class LocalDocumentRepository implements DocumentRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).documents;
  }

  async list() {
    return readJsonFile<DocumentRecord[]>(this.filePath, seedDocuments);
  }

  async getById(id: string) {
    const documents = await this.list();
    return documents.find((document) => document.id === id) ?? null;
  }

  async create(record: DocumentRecord) {
    const documents = await this.list();
    documents.unshift(record);
    await writeJsonFile(this.filePath, documents);
    return record;
  }

  async update(record: DocumentRecord) {
    const documents = await this.list();
    const index = documents.findIndex((document) => document.id === record.id);
    if (index === -1) {
      documents.unshift(record);
    } else {
      documents[index] = record;
    }
    await writeJsonFile(this.filePath, documents);
    return record;
  }
}

