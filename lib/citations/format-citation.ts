import type { ChatSourceCitation } from "@/lib/domain/models/chat";
import type { DocumentChunkRecord, DocumentRecord } from "@/lib/domain/models/document";
import type { SourceRecord } from "@/lib/domain/models/source";

function pageLabel(chunk: DocumentChunkRecord) {
  if (chunk.pageStart && chunk.pageEnd) {
    return chunk.pageStart === chunk.pageEnd ? `p. ${chunk.pageStart}` : `pp. ${chunk.pageStart}-${chunk.pageEnd}`;
  }

  return undefined;
}

function excerpt(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

export function formatCitation({
  chunk,
  document,
  source,
  confidence,
}: {
  chunk: DocumentChunkRecord;
  document: DocumentRecord;
  source?: SourceRecord;
  confidence: number;
}): ChatSourceCitation {
  const pages = pageLabel(chunk);
  const parts = [document.title];

  if (chunk.sectionTitle) {
    parts.push(chunk.sectionTitle);
  }

  if (pages) {
    parts.push(pages);
  }

  return {
    id: chunk.id,
    title: document.title,
    kind: chunk.sourceType === "web" ? "web" : "document",
    excerpt: excerpt(chunk.text),
    confidence: Number(confidence.toFixed(3)),
    formatted: parts.join(", "),
    sectionTitle: chunk.sectionTitle,
    pageLabel: pages,
    sourceUrl: source?.url,
  };
}
