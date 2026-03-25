import type { DocumentRecord } from "@/lib/domain/models/document";

export interface DocumentRepository {
  list(): Promise<DocumentRecord[]>;
  getById(id: string): Promise<DocumentRecord | null>;
  create(record: DocumentRecord): Promise<DocumentRecord>;
  update(record: DocumentRecord): Promise<DocumentRecord>;
}
