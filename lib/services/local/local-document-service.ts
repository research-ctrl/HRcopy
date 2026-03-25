import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";
import type { DocumentService } from "@/lib/services/interfaces/document-service";
import type { DocumentIngestionService } from "@/lib/services/interfaces/document-ingestion-service";

export class LocalDocumentService implements DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly ingestionService: DocumentIngestionService,
  ) {}

  async list() {
    return this.documentRepository.list();
  }

  async getById(id: string) {
    return this.documentRepository.getById(id);
  }

  async approve(id: string) {
    return this.ingestionService.approveDocument(id, "Local Legal Reviewer");
  }

  async reprocess(id: string) {
    return this.ingestionService.reprocessDocument(id);
  }
}

