import type { DocumentRecord } from "@/lib/domain/models/document";
import { getSupabaseClient } from "@/lib/database/supabase";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";

function rowToRecord(row: Record<string, unknown>): DocumentRecord {
  return {
    id: row.id as string,
    title: row.title as string,
    fileName: row.file_name as string,
    mimeType: row.mime_type as string,
    language: "pt-PT",
    jurisdiction: (row.jurisdiction as DocumentRecord["jurisdiction"]) ?? "PT",
    category: row.category as DocumentRecord["category"],
    sourceType: (row.source_type as DocumentRecord["sourceType"]) ?? "document",
    tags: (row.tags as string[]) ?? [],
    uploadState: (row.upload_state as DocumentRecord["uploadState"]) ?? "received",
    processingStatus: row.processing_status as DocumentRecord["processingStatus"],
    approvalStatus: row.approval_status as DocumentRecord["approvalStatus"],
    currentVersionId: row.current_version_id as string | undefined,
    storagePath: row.storage_path as string | undefined,
    chunkCount: Number(row.chunk_count ?? 0),
    versionCount: Number(row.version_count ?? 0),
    approvedBy: row.approved_by as string | undefined,
    approvedAt: row.approved_at as string | undefined,
    lastProcessedAt: row.last_processed_at as string | undefined,
    effectiveDate: row.effective_date as string | undefined,
    summary: (row.summary as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class SupabaseDocumentRepository implements DocumentRepository {
  private get db() {
    return getSupabaseClient();
  }

  async list(): Promise<DocumentRecord[]> {
    const { data, error } = await this.db
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase listDocuments: ${error.message}`);
    return (data ?? []).map(rowToRecord);
  }

  async getById(id: string): Promise<DocumentRecord | null> {
    const { data, error } = await this.db
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return rowToRecord(data);
  }

  async create(record: DocumentRecord): Promise<DocumentRecord> {
    const { error } = await this.db.from("documents").insert({
      id: record.id,
      title: record.title,
      file_name: record.fileName,
      mime_type: record.mimeType,
      language: record.language,
      jurisdiction: record.jurisdiction,
      category: record.category,
      source_type: record.sourceType,
      tags: record.tags,
      upload_state: record.uploadState,
      processing_status: record.processingStatus,
      approval_status: record.approvalStatus,
      current_version_id: record.currentVersionId ?? null,
      storage_path: record.storagePath ?? null,
      chunk_count: record.chunkCount,
      version_count: record.versionCount,
      approved_by: record.approvedBy ?? null,
      approved_at: record.approvedAt ?? null,
      last_processed_at: record.lastProcessedAt ?? null,
      effective_date: record.effectiveDate ?? null,
      summary: record.summary,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
    if (error) throw new Error(`Supabase createDocument: ${error.message}`);
    return record;
  }

  async update(record: DocumentRecord): Promise<DocumentRecord> {
    const { error } = await this.db.from("documents").upsert({
      id: record.id,
      title: record.title,
      file_name: record.fileName,
      mime_type: record.mimeType,
      language: record.language,
      jurisdiction: record.jurisdiction,
      category: record.category,
      source_type: record.sourceType,
      tags: record.tags,
      upload_state: record.uploadState,
      processing_status: record.processingStatus,
      approval_status: record.approvalStatus,
      current_version_id: record.currentVersionId ?? null,
      storage_path: record.storagePath ?? null,
      chunk_count: record.chunkCount,
      version_count: record.versionCount,
      approved_by: record.approvedBy ?? null,
      approved_at: record.approvedAt ?? null,
      last_processed_at: record.lastProcessedAt ?? null,
      effective_date: record.effectiveDate ?? null,
      summary: record.summary,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Supabase updateDocument: ${error.message}`);
    return record;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from("documents").delete().eq("id", id);
    if (error) throw new Error(`Supabase deleteDocument: ${error.message}`);
  }
}

/** Placeholder kept for backwards-compat */
export class SupabaseDocumentRepositoryPlaceholder implements DocumentRepository {
  private real = new SupabaseDocumentRepository();
  list = () => this.real.list();
  getById = (id: string) => this.real.getById(id);
  create = (r: DocumentRecord) => this.real.create(r);
  update = (r: DocumentRecord) => this.real.update(r);
  delete = (id: string) => this.real.delete(id);
}
