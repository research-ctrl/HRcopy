import type { DocumentApprovalStatus, DocumentLifecycleStatus } from "@/lib/domain/enums/status";
import type { DocumentChunkRecord, DocumentRecord } from "@/lib/domain/models/document";
import { createId, sha256 } from "@/lib/utils/id";
import { normalizeText, tokenize } from "@/lib/utils/text";

export interface ChunkDraft {
  text: string;
  normalizedText: string;
  tokenCount: number;
  pageStart?: number;
  pageEnd?: number;
  sectionTitle?: string;
}

interface ChunkingInput {
  pages: string[];
  maxChars?: number;
}

function isHeading(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }

  if (/^\d+(?:\.\d+)*[.)]?\s+/.test(trimmed)) {
    return true;
  }

  const lettersOnly = trimmed.replace(/[^A-Za-zÀ-ÿ\s]/g, "").trim();
  if (lettersOnly && lettersOnly === lettersOnly.toUpperCase() && lettersOnly.split(/\s+/).length <= 8) {
    return true;
  }

  return /^[A-ZÀ-Ý][A-Za-zÀ-ÿ\s-]{3,80}:?$/.test(trimmed) && trimmed.split(/\s+/).length <= 8;
}

function splitLongText(text: string, maxChars: number) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const result: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) {
      result.push(current.trim());
      current = "";
    }
  };

  for (const paragraph of paragraphs.length ? paragraphs : [text]) {
    if ((current + ` ${paragraph}`).trim().length <= maxChars) {
      current = `${current} ${paragraph}`.trim();
      continue;
    }

    if (paragraph.length <= maxChars) {
      flush();
      current = paragraph;
      continue;
    }

    flush();
    const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
    for (const sentence of sentences) {
      if ((current + ` ${sentence}`).trim().length > maxChars) {
        flush();
      }
      current = `${current} ${sentence}`.trim();
    }
  }

  flush();
  return result;
}

export function buildChunkDrafts({ pages, maxChars = 900 }: ChunkingInput): ChunkDraft[] {
  type SectionAccumulator = {
    sectionTitle?: string;
    pageStart?: number;
    pageEnd?: number;
    parts: string[];
  };

  const sections: SectionAccumulator[] = [];
  let current: SectionAccumulator | null = null;

  const flushCurrent = () => {
    if (current && current.parts.join(" ").trim()) {
      sections.push(current);
    }
    current = null;
  };

  pages.forEach((pageText, pageIndex) => {
    const lines = pageText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (isHeading(line)) {
        flushCurrent();
        current = {
          sectionTitle: line.replace(/:$/, ""),
          pageStart: pageIndex + 1,
          pageEnd: pageIndex + 1,
          parts: [],
        };
        continue;
      }

      if (!current) {
        current = {
          sectionTitle: "General",
          pageStart: pageIndex + 1,
          pageEnd: pageIndex + 1,
          parts: [],
        };
      }

      current.parts.push(line);
      current.pageEnd = pageIndex + 1;
    }
  });

  flushCurrent();

  const drafts: ChunkDraft[] = [];

  for (const section of sections) {
    const combined = section.parts.join("\n\n").trim();
    for (const piece of splitLongText(combined, maxChars)) {
      const normalized = normalizeText(piece);
      drafts.push({
        text: piece,
        normalizedText: normalized,
        tokenCount: tokenize(normalized).length,
        pageStart: section.pageStart,
        pageEnd: section.pageEnd,
        sectionTitle: section.sectionTitle,
      });
    }
  }

  return drafts;
}

interface MaterializeInput {
  document: DocumentRecord;
  versionId: string;
  drafts: ChunkDraft[];
  embeddings: number[][];
  createdAt?: string;
}

export function materializeChunks({
  document,
  versionId,
  drafts,
  embeddings,
  createdAt = new Date().toISOString(),
}: MaterializeInput): DocumentChunkRecord[] {
  return drafts.map((draft, index) => ({
    id: createId("chunk"),
    documentId: document.id,
    versionId,
    pageStart: draft.pageStart,
    pageEnd: draft.pageEnd,
    sectionTitle: draft.sectionTitle,
    sourceType: document.sourceType,
    approvalStatus: document.approvalStatus,
    effectiveDate: document.effectiveDate,
    text: draft.text,
    normalizedText: draft.normalizedText,
    embedding: embeddings[index] ?? [],
    tokenCount: draft.tokenCount,
    hash: sha256(`${document.id}:${versionId}:${index}:${draft.normalizedText}`),
    createdAt,
    updatedAt: createdAt,
  }));
}
