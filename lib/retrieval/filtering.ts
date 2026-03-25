import type { DocumentRecord, DocumentChunkRecord } from "@/lib/domain/models/document";
import type { SourceRecord } from "@/lib/domain/models/source";

export function isChunkRetrievable(
  chunk: DocumentChunkRecord,
  document: DocumentRecord | undefined,
  source: SourceRecord | undefined,
) {
  if (!document) {
    return false;
  }

  if (document.approvalStatus !== "approved") {
    return false;
  }

  if (document.processingStatus !== "approved" && document.processingStatus !== "ready") {
    return false;
  }

  if (chunk.approvalStatus !== "approved") {
    return false;
  }

  if (chunk.sourceType === "web") {
    return Boolean(source && source.allowlisted && source.approvalStatus === "approved" && source.status === "active");
  }

  return true;
}
