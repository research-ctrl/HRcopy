import type { DocumentRecord } from "@/lib/domain/models/document";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error("Supabase document repository is not implemented. Use local adapters for now.");
}

export class SupabaseDocumentRepositoryPlaceholder implements DocumentRepository {
  async list(): Promise<DocumentRecord[]> {
    return notImplemented<DocumentRecord[]>();
  }

  async getById(_id: string): Promise<DocumentRecord | null> {
    return notImplemented<DocumentRecord | null>();
  }

  async create(_record: DocumentRecord): Promise<DocumentRecord> {
    return notImplemented<DocumentRecord>();
  }

  async update(_record: DocumentRecord): Promise<DocumentRecord> {
    return notImplemented<DocumentRecord>();
  }
}
