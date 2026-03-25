import type { DocumentApprovalStatus } from "@/lib/domain/enums/status";
import type { DocumentChunkRecord, DocumentIngestionResult, DocumentRecord, DocumentVersionRecord } from "@/lib/domain/models/document";
import type { EmbeddingProviderRouter } from "@/lib/providers/router/embedding-provider-router";
import type { OcrProvider } from "@/lib/providers/interfaces/ocr-provider";
import type { PdfExtractor } from "@/lib/providers/interfaces/pdf-extractor";
import type { StorageProvider } from "@/lib/providers/interfaces/storage-provider";
import type { ChunkRepository } from "@/lib/repositories/interfaces/chunk-repository";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";
import type { DocumentVersionRepository } from "@/lib/repositories/interfaces/document-version-repository";
import { buildChunkDrafts, materializeChunks } from "@/lib/ingestion/chunker";
import type { DocumentIngestionService, UploadDocumentInput } from "@/lib/services/interfaces/document-ingestion-service";
import { createId, sha256 } from "@/lib/utils/id";

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.(pdf|png|jpe?g|webp)$/i, "").replace(/[-_]+/g, " ").trim();
}

function isImageUpload(contentType: string) {
  return ["image/png", "image/jpeg", "image/webp"].includes(contentType);
}

export class LocalDocumentIngestionService implements DocumentIngestionService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly versionRepository: DocumentVersionRepository,
    private readonly chunkRepository: ChunkRepository,
    private readonly storageProvider: StorageProvider,
    private readonly pdfExtractor: PdfExtractor,
    private readonly ocrProvider: OcrProvider,
    private readonly embeddingRouter: EmbeddingProviderRouter,
  ) {}

  private async extractContent(bytes: Buffer, fileName: string, contentType: string) {
    if (isImageUpload(contentType)) {
      if (!this.ocrProvider.isConfigured()) {
        throw new Error("OCR is not configured for image uploads.");
      }

      const ocr = await this.ocrProvider.extract(bytes, fileName);
      return {
        text: ocr.text,
        pages: [ocr.text],
        method: ocr.method,
        notice: "Image OCR was used to extract text from the uploaded file.",
      };
    }

    try {
      const extracted = await this.pdfExtractor.extract(bytes, fileName);
      return {
        text: extracted.text,
        pages: extracted.pages,
        method: extracted.method,
      };
    } catch (error) {
      if (!this.ocrProvider.isConfigured()) {
        throw error;
      }

      const ocr = await this.ocrProvider.extract(bytes, fileName);
      return {
        text: ocr.text,
        pages: [ocr.text],
        method: ocr.method,
        notice: "PDF extraction failed, OCR fallback was used.",
      };
    }
  }

  private async persistIngestion(
    document: DocumentRecord,
    version: DocumentVersionRecord,
    extractedText: string,
    pages: string[],
    extractionNotice?: string,
  ): Promise<DocumentIngestionResult> {
    const textPath = `documents/${document.id}/v${version.versionNumber}.txt`;
    await this.storageProvider.storeObject(textPath, Buffer.from(extractedText, "utf8"));

    const drafts = buildChunkDrafts({ pages });
    const embeddings = await this.embeddingRouter.embedMany(drafts.map((draft) => draft.normalizedText));
    const chunks = materializeChunks({
      document,
      versionId: version.id,
      drafts,
      embeddings,
      createdAt: version.createdAt,
    });

    await this.chunkRepository.replaceForVersion(version.id, chunks);

    const updatedVersion: DocumentVersionRecord = {
      ...version,
      extractedTextPath: textPath,
      textLength: extractedText.length,
      pageCount: pages.length || 1,
      status: "indexed",
      updatedAt: new Date().toISOString(),
    };

    await this.versionRepository.create(updatedVersion);

    const updatedDocument: DocumentRecord = {
      ...document,
      uploadState: "stored",
      processingStatus: "ready",
      approvalStatus: "pending",
      currentVersionId: version.id,
      chunkCount: chunks.length,
      versionCount: version.versionNumber,
      lastProcessedAt: updatedVersion.updatedAt,
      summary: extractedText.slice(0, 240).replace(/\s+/g, " ").trim(),
      updatedAt: updatedVersion.updatedAt,
    };

    await this.documentRepository.update(updatedDocument);

    return {
      document: updatedDocument,
      version: updatedVersion,
      chunksCreated: chunks.length,
      extractionNotice,
    };
  }

  async ingestUpload(input: UploadDocumentInput) {
    const now = new Date().toISOString();
    const documentId = createId("doc");
    const versionId = createId("ver");
    const storagePath = `documents/${documentId}/v1/${input.fileName}`;
    const fileHash = sha256(input.bytes);

    const document: DocumentRecord = {
      id: documentId,
      title: input.title?.trim() || titleFromFileName(input.fileName),
      fileName: input.fileName,
      mimeType: input.contentType,
      language: "pt-PT",
      jurisdiction: "PT",
      category: input.category,
      sourceType: "document",
      tags: input.tags,
      uploadState: "stored",
      processingStatus: "extracting",
      approvalStatus: "pending",
      storagePath,
      chunkCount: 0,
      versionCount: 0,
      summary: "",
      effectiveDate: input.effectiveDate,
      createdAt: now,
      updatedAt: now,
    };

    await this.documentRepository.create(document);
    await this.storageProvider.storeObject(storagePath, input.bytes);

    const version: DocumentVersionRecord = {
      id: versionId,
      documentId,
      versionNumber: 1,
      storagePath,
      fileHash,
      textLength: 0,
      pageCount: 0,
      extractionMethod: "pdf-text",
      status: "stored",
      createdAt: now,
      updatedAt: now,
    };

    try {
      const extraction = await this.extractContent(input.bytes, input.fileName, input.contentType);

      return this.persistIngestion(
        document,
        {
          ...version,
          extractionMethod: extraction.method,
        },
        extraction.text,
        extraction.pages,
        extraction.notice,
      );
    } catch (error) {
      const extractionNotice = `${isImageUpload(input.contentType) ? "Image OCR failed" : "PDF extraction failed"}: ${
        error instanceof Error ? error.message : "unknown error"
      }`;
      await this.documentRepository.update({
        ...document,
        processingStatus: "failed",
        summary: extractionNotice,
        updatedAt: new Date().toISOString(),
      });
      throw new Error(extractionNotice);
    }
  }

  async approveDocument(documentId: string, actorName: string) {
    const document = await this.documentRepository.getById(documentId);
    if (!document) {
      return null;
    }

    const approvedAt = new Date().toISOString();
    const updatedDocument: DocumentRecord = {
      ...document,
      approvalStatus: "approved",
      processingStatus: "approved",
      approvedBy: {
        id: createId("actor"),
        name: actorName,
        role: "legal-reviewer",
      },
      approvedAt,
      updatedAt: approvedAt,
    };

    await this.documentRepository.update(updatedDocument);

    if (updatedDocument.currentVersionId) {
      const chunks = await this.chunkRepository.listByDocumentId(documentId);
      const updatedChunks = chunks
        .filter((chunk) => chunk.versionId === updatedDocument.currentVersionId)
        .map((chunk) => ({
          ...chunk,
          approvalStatus: "approved" as DocumentApprovalStatus,
          updatedAt: approvedAt,
        }));

      await this.chunkRepository.replaceForVersion(updatedDocument.currentVersionId, updatedChunks);
    }

    return updatedDocument;
  }

  async reprocessDocument(documentId: string) {
    const document = await this.documentRepository.getById(documentId);
    if (!document || !document.storagePath) {
      return null;
    }

    const existingVersion = await this.versionRepository.getLatestByDocumentId(documentId);
    const versionNumber = (existingVersion?.versionNumber ?? 0) + 1;
    const bytes = await this.storageProvider.readObject(document.storagePath);
    const now = new Date().toISOString();
    const extraction = await this.extractContent(bytes, document.fileName, document.mimeType);

    const version: DocumentVersionRecord = {
      id: createId("ver"),
      documentId,
      versionNumber,
      storagePath: document.storagePath,
      fileHash: sha256(bytes),
      textLength: 0,
      pageCount: 0,
      extractionMethod: extraction.method,
      status: "stored",
      createdAt: now,
      updatedAt: now,
    };

    return this.persistIngestion(document, version, extraction.text, extraction.pages, extraction.notice);
  }
}
