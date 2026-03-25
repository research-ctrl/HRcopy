import type { DocumentIngestionResult, DocumentRecord } from "@/lib/domain/models/document";

export interface DocumentService {
  list(): Promise<DocumentRecord[]>;
  getById(id: string): Promise<DocumentRecord | null>;
  approve(id: string): Promise<DocumentRecord | null>;
  reprocess(id: string): Promise<DocumentIngestionResult | null>;
}
