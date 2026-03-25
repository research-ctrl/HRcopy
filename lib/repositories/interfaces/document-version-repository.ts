import type { DocumentVersionRecord } from "@/lib/domain/models/document";

export interface DocumentVersionRepository {
  listByDocumentId(documentId: string): Promise<DocumentVersionRecord[]>;
  getLatestByDocumentId(documentId: string): Promise<DocumentVersionRecord | null>;
  create(record: DocumentVersionRecord): Promise<DocumentVersionRecord>;
  deleteByDocumentId(documentId: string): Promise<void>;
}

