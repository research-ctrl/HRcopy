import type { DocumentIngestionResult, DocumentRecord } from "@/lib/domain/models/document";

export interface UploadDocumentInput {
  fileName: string;
  contentType: string;
  bytes: Buffer;
  title?: string;
  category: DocumentRecord["category"];
  tags: string[];
  effectiveDate?: string;
}

export interface DocumentIngestionService {
  ingestUpload(input: UploadDocumentInput): Promise<DocumentIngestionResult>;
  approveDocument(documentId: string, actorName: string): Promise<DocumentRecord | null>;
  reprocessDocument(documentId: string): Promise<DocumentIngestionResult | null>;
}
