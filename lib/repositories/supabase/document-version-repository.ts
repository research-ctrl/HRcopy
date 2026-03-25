import type { DocumentVersionRecord } from "@/lib/domain/models/document";
import type { DocumentVersionRepository } from "@/lib/repositories/interfaces/document-version-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error(
    "Supabase document version repository is not implemented. Use local adapters for now."
  );
}

export class SupabaseDocumentVersionRepository
  implements DocumentVersionRepository
{
  async listByDocumentId(_documentId: string): Promise<DocumentVersionRecord[]> {
    return notImplemented<DocumentVersionRecord[]>();
  }

  async getLatestByDocumentId(
    _documentId: string
  ): Promise<DocumentVersionRecord | null> {
    return notImplemented<DocumentVersionRecord | null>();
  }

  async create(_record: DocumentVersionRecord): Promise<DocumentVersionRecord> {
    return notImplemented<DocumentVersionRecord>();
  }

  async deleteByDocumentId(_documentId: string): Promise<void> {
    return notImplemented<void>();
  }
}
