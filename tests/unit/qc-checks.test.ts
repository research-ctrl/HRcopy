import { describe, expect, it } from "vitest";
import { evaluateGrounding } from "@/lib/qc/check-grounding";
import type { RetrievedChunk } from "@/lib/domain/models/retrieval";

const retrievedChunks: RetrievedChunk[] = [
  {
    score: 0.92,
    document: {
      id: "doc-1",
      title: "Employment Code",
      fileName: "employment.pdf",
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
    },
    chunk: {
      id: "chunk-1",
      documentId: "doc-1",
      versionId: "ver-1",
      sectionTitle: "Probation",
      sourceType: "document",
      approvalStatus: "approved",
      text: "Probation termination requires checking the probation period and keeping a documented evidence trail.",
      normalizedText:
        "probation termination requires checking the probation period and keeping a documented evidence trail",
      embedding: [1, 0, 0],
      tokenCount: 12,
      hash: "hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  },
];

describe("evaluateGrounding", () => {
  it("passes when answer claims overlap retrieved evidence", () => {
    const result = evaluateGrounding(
      "Probation termination requires checking the probation period and keeping a documented evidence trail.",
      retrievedChunks,
    );

    expect(result.status).toBe("pass");
    expect(result.groundedClaims).toBeGreaterThan(0);
  });

  it("fails when answer claims are unsupported", () => {
    const result = evaluateGrounding("Employees may always terminate with no evidence requirement.", retrievedChunks);

    expect(result.status).toBe("fail");
    expect(result.groundedClaims).toBe(0);
  });
});
