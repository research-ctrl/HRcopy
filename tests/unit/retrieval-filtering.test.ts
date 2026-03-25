import { describe, expect, it } from "vitest";
import { isChunkRetrievable } from "@/lib/retrieval/filtering";
import type { DocumentChunkRecord, DocumentRecord } from "@/lib/domain/models/document";
import type { SourceRecord } from "@/lib/domain/models/source";

const baseDocument: DocumentRecord = {
  id: "doc-1",
  title: "Approved document",
  fileName: "approved.pdf",
  mimeType: "application/pdf",
  language: "pt-PT",
  jurisdiction: "PT",
  category: "policy",
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

const baseChunk: DocumentChunkRecord = {
  id: "chunk-1",
  documentId: "doc-1",
  versionId: "ver-1",
  sourceType: "document",
  approvalStatus: "approved",
  text: "Approved grounded content.",
  normalizedText: "approved grounded content",
  embedding: [1, 0, 0],
  tokenCount: 3,
  hash: "hash-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const approvedSource: SourceRecord = {
  id: "src-1",
  name: "Approved source",
  url: "https://example.com",
  sourceType: "web",
  parserType: "html",
  refreshFrequency: "daily",
  priority: 3,
  owner: { id: "actor-1", name: "Owner", role: "ops-owner" },
  jurisdiction: "PT",
  status: "active",
  approvalStatus: "approved",
  allowlisted: true,
  digestEnabled: true,
  changeSeverity: "none",
  notes: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("isChunkRetrievable", () => {
  it("accepts approved document chunks", () => {
    expect(isChunkRetrievable(baseChunk, baseDocument, undefined)).toBe(true);
  });

  it("rejects chunks from inactive or unapproved web sources", () => {
    const webChunk = { ...baseChunk, sourceType: "web" as const, sourceId: "src-1" };
    const inactiveSource = { ...approvedSource, status: "inactive" as const };
    const pendingSource = { ...approvedSource, approvalStatus: "pending" as const };

    expect(isChunkRetrievable(webChunk, baseDocument, inactiveSource)).toBe(false);
    expect(isChunkRetrievable(webChunk, baseDocument, pendingSource)).toBe(false);
    expect(isChunkRetrievable(webChunk, baseDocument, approvedSource)).toBe(true);
  });
});
