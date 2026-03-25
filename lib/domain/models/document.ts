import type { DocumentApprovalStatus, DocumentLifecycleStatus } from "@/lib/domain/enums/status";
import type { ActorRef, AuditFields, ID, ISODateString, JurisdictionCode } from "@/lib/domain/types/common";

export interface DocumentRecord extends AuditFields {
  id: ID;
  title: string;
  fileName: string;
  mimeType: string;
  language: "pt-PT";
  jurisdiction: JurisdictionCode;
  category: "employment-code" | "policy" | "contract-template" | "case-note";
  sourceType: "document" | "web";
  tags: string[];
  uploadState: "received" | "stored";
  processingStatus: DocumentLifecycleStatus;
  approvalStatus: DocumentApprovalStatus;
  currentVersionId?: ID;
  storagePath?: string;
  chunkCount: number;
  versionCount: number;
  approvedBy?: ActorRef;
  approvedAt?: ISODateString;
  lastProcessedAt?: ISODateString;
  effectiveDate?: ISODateString;
  summary: string;
}

export interface DocumentUploadRequest {
  title?: string;
  fileName: string;
  category: DocumentRecord["category"];
  tags: string[];
  effectiveDate?: ISODateString;
}

export interface DocumentVersionRecord extends AuditFields {
  id: ID;
  documentId: ID;
  versionNumber: number;
  storagePath: string;
  extractedTextPath?: string;
  fileHash: string;
  textLength: number;
  pageCount: number;
  extractionMethod: "pdf-text" | "ocr-fallback" | "seed";
  status: "stored" | "extracted" | "indexed" | "failed";
}

export interface DocumentChunkRecord extends AuditFields {
  id: ID;
  documentId: ID;
  versionId: ID;
  sourceId?: ID;
  pageStart?: number;
  pageEnd?: number;
  sectionTitle?: string;
  sourceType: DocumentRecord["sourceType"];
  approvalStatus: DocumentApprovalStatus;
  effectiveDate?: ISODateString;
  text: string;
  normalizedText: string;
  embedding: number[];
  tokenCount: number;
  hash: string;
}

export interface DocumentIngestionResult {
  document: DocumentRecord;
  version: DocumentVersionRecord;
  chunksCreated: number;
  extractionNotice?: string;
}
