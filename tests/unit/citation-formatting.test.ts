import { describe, expect, it } from "vitest";
import { formatCitation } from "@/lib/citations/format-citation";
import type { DocumentChunkRecord, DocumentRecord } from "@/lib/domain/models/document";

describe("formatCitation", () => {
  it("includes section title and page range", () => {
    const document: DocumentRecord = {
      id: "doc-1",
      title: "Employment Code",
      fileName: "employment-code.pdf",
      mimeType: "application/pdf",
      language: "pt-PT",
      jurisdiction: "PT",
      category: "employment-code",
      sourceType: "document",
      tags: [],
      uploadState: "stored",
      processingStatus: "approved",
      approvalStatus: "approved",
      chunkCount: 1,
      versionCount: 1,
      summary: "",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const chunk: DocumentChunkRecord = {
      id: "chunk-1",
      documentId: "doc-1",
      versionId: "ver-1",
      pageStart: 3,
      pageEnd: 4,
      sectionTitle: "Probation",
      sourceType: "document",
      approvalStatus: "approved",
      text: "Probation termination requires evidence and notice review.",
      normalizedText: "probation termination requires evidence and notice review",
      embedding: [1, 0, 0],
      tokenCount: 7,
      hash: "hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const citation = formatCitation({ chunk, document, confidence: 0.82 });

    expect(citation.formatted).toBe("Employment Code, Probation, pp. 3-4");
    expect(citation.pageLabel).toBe("pp. 3-4");
    expect(citation.excerpt).toContain("Probation termination");
  });
});
