import type { DocumentChunkRecord } from "@/lib/domain/models/document";
import { getSupabaseClient } from "@/lib/database/supabase";
import type { ChunkRepository } from "@/lib/repositories/interfaces/chunk-repository";

function rowToRecord(row: Record<string, unknown>): DocumentChunkRecord {
  return {
    id: row.id as string,
    documentId: row.document_id as string,
    versionId: row.version_id as string,
    sourceId: (row.source_id as string | null) ?? undefined,
    pageStart: (row.page_start as number | null) ?? undefined,
    pageEnd: (row.page_end as number | null) ?? undefined,
    sectionTitle: (row.section_title as string | null) ?? undefined,
    sourceType: (row.source_type as "document" | "web") ?? "document",
    approvalStatus: (row.approval_status as DocumentChunkRecord["approvalStatus"]) ?? "pending",
    effectiveDate: (row.effective_date as string | null) ?? undefined,
    text: row.text as string,
    normalizedText: (row.normalized_text as string) ?? "",
    embedding: (row.embedding as number[]) ?? [],
    tokenCount: Number(row.token_count ?? 0),
    hash: (row.hash as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class SupabaseChunkRepository implements ChunkRepository {
  private get db() {
    return getSupabaseClient();
  }

  async list(): Promise<DocumentChunkRecord[]> {
    const { data, error } = await this.db
      .from("document_chunks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase listChunks: ${error.message}`);
    return (data ?? []).map(rowToRecord);
  }

  async listByDocumentId(documentId: string): Promise<DocumentChunkRecord[]> {
    const { data, error } = await this.db
      .from("document_chunks")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase listChunksByDocId: ${error.message}`);
    return (data ?? []).map(rowToRecord);
  }

  async replaceForVersion(
    versionId: string,
    chunks: DocumentChunkRecord[]
  ): Promise<void> {
    // Delete existing chunks for this version
    const { error: deleteError } = await this.db
      .from("document_chunks")
      .delete()
      .eq("version_id", versionId);
    if (deleteError) throw new Error(`Supabase deleteChunks: ${deleteError.message}`);

    // Insert new chunks
    if (chunks.length > 0) {
      const rows = chunks.map((chunk) => ({
        id: chunk.id,
        document_id: chunk.documentId,
        version_id: chunk.versionId,
        source_id: chunk.sourceId || null,
        page_start: chunk.pageStart ?? null,
        page_end: chunk.pageEnd ?? null,
        section_title: chunk.sectionTitle || null,
        source_type: chunk.sourceType,
        approval_status: chunk.approvalStatus,
        effective_date: chunk.effectiveDate || null,
        text: chunk.text,
        normalized_text: chunk.normalizedText,
        embedding: chunk.embedding,
        token_count: chunk.tokenCount,
        hash: chunk.hash,
        created_at: chunk.createdAt,
        updated_at: chunk.updatedAt,
      }));

      const { error: insertError } = await this.db
        .from("document_chunks")
        .insert(rows);
      if (insertError) throw new Error(`Supabase insertChunks: ${insertError.message}`);
    }
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    const { error } = await this.db
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);
    if (error) throw new Error(`Supabase deleteChunksByDocId: ${error.message}`);
  }
}

