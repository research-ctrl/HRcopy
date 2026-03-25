import type { DocumentChunkRecord, DocumentRecord } from "@/lib/domain/models/document";
import type { SourceRecord } from "@/lib/domain/models/source";

export interface RetrievedChunk {
  chunk: DocumentChunkRecord;
  document: DocumentRecord;
  source?: SourceRecord;
  score: number;
}
