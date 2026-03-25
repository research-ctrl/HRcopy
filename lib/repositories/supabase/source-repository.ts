import type { SourceRecord } from "@/lib/domain/models/source";
import type { UpsertSourceRequest } from "@/lib/domain/models/source";
import type { ActorRef } from "@/lib/domain/types/common";
import { getSupabaseClient } from "@/lib/database/supabase";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";
import { createId } from "@/lib/utils/id";

function rowToRecord(row: Record<string, unknown>): SourceRecord {
  const ownerStr = row.owner as string | null;
  const owner: ActorRef = ownerStr
    ? { id: ownerStr, name: "Admin", role: "hr-admin" }
    : { id: "system-admin", name: "System", role: "hr-admin" };

  return {
    id: row.id as string,
    name: row.name as string,
    url: row.url as string,
    sourceType: "web",
    parserType: (row.parser_type as SourceRecord["parserType"]) ?? "html",
    refreshFrequency:
      (row.refresh_frequency as SourceRecord["refreshFrequency"]) ?? "weekly",
    priority: (row.priority as 1 | 2 | 3 | 4 | 5) ?? 3,
    owner,
    jurisdiction: (row.jurisdiction as string) as any ?? "PT",
    status: (row.status as SourceRecord["status"]) ?? "active",
    approvalStatus: (row.approval_status as SourceRecord["approvalStatus"]) ?? "pending",
    allowlisted: Boolean(row.allowlisted),
    digestEnabled: Boolean(row.digest_enabled),
    changeSeverity: (row.change_severity as SourceRecord["changeSeverity"]) ?? "none",
    lastContentHash: (row.last_content_hash as string | null) ?? undefined,
    lastCheckedAt: (row.last_checked_at as string | null) ?? undefined,
    nextCheckAt: (row.next_check_at as string | null) ?? undefined,
    notes: (row.notes as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class SupabaseSourceRepository implements SourceRepository {
  private get db() {
    return getSupabaseClient();
  }

  async list(): Promise<SourceRecord[]> {
    const { data, error } = await this.db
      .from("sources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase listSources: ${error.message}`);
    return (data ?? []).map(rowToRecord);
  }

  async getById(id: string): Promise<SourceRecord | null> {
    const { data, error } = await this.db
      .from("sources")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return rowToRecord(data);
  }

  async upsert(request: UpsertSourceRequest): Promise<SourceRecord> {
    const now = new Date().toISOString();

    if (request.id) {
      const existing = await this.getById(request.id);
      if (existing) {
        const updated: SourceRecord = {
          ...existing,
          name: request.name,
          url: request.url,
          sourceType: request.sourceType ?? existing.sourceType,
          parserType: request.parserType ?? existing.parserType,
          refreshFrequency:
            request.refreshFrequency ?? existing.refreshFrequency,
          priority: request.priority ?? existing.priority,
          digestEnabled: request.digestEnabled ?? existing.digestEnabled,
          status: request.status ?? existing.status,
          approvalStatus: request.approvalStatus ?? existing.approvalStatus,
          allowlisted: request.allowlisted ?? existing.allowlisted,
          notes: request.notes ?? existing.notes,
          updatedAt: now,
        };
        await this.update(updated);
        return updated;
      }
    }

    const id = request.id ?? createId("src");
    const newRecord: SourceRecord = {
      id,
      name: request.name,
      url: request.url,
      sourceType: request.sourceType ?? "web",
      parserType: request.parserType ?? "html",
      refreshFrequency: request.refreshFrequency ?? "weekly",
      priority: request.priority ?? 3,
      owner: { id: "system-admin", name: "System", role: "hr-admin" },
      jurisdiction: "PT" as any,
      status: request.status ?? "active",
      approvalStatus: request.approvalStatus ?? "pending",
      allowlisted: request.allowlisted ?? false,
      digestEnabled: request.digestEnabled ?? false,
      changeSeverity: "none",
      notes: request.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };

    const row = {
      id: newRecord.id,
      name: newRecord.name,
      url: newRecord.url,
      source_type: newRecord.sourceType,
      parser_type: newRecord.parserType,
      refresh_frequency: newRecord.refreshFrequency,
      priority: newRecord.priority,
      owner: newRecord.owner.id,
      jurisdiction: newRecord.jurisdiction,
      status: newRecord.status,
      approval_status: newRecord.approvalStatus,
      allowlisted: newRecord.allowlisted,
      digest_enabled: newRecord.digestEnabled,
      change_severity: newRecord.changeSeverity,
      notes: newRecord.notes,
      created_at: newRecord.createdAt,
      updated_at: newRecord.updatedAt,
    };

    const { error } = await this.db.from("sources").insert([row]);
    if (error) throw new Error(`Supabase insertSource: ${error.message}`);

    return newRecord;
  }

  async update(record: SourceRecord): Promise<SourceRecord> {
    const row = {
      id: record.id,
      name: record.name,
      url: record.url,
      source_type: record.sourceType,
      parser_type: record.parserType,
      refresh_frequency: record.refreshFrequency,
      priority: record.priority,
      owner: record.owner?.id || null,
      jurisdiction: record.jurisdiction,
      status: record.status,
      approval_status: record.approvalStatus,
      allowlisted: record.allowlisted,
      digest_enabled: record.digestEnabled,
      change_severity: record.changeSeverity,
      notes: record.notes,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };

    const { error } = await this.db
      .from("sources")
      .update(row)
      .eq("id", record.id);
    if (error) throw new Error(`Supabase updateSource: ${error.message}`);

    return record;
  }

  async remove(id: string): Promise<boolean> {
    const { error } = await this.db.from("sources").delete().eq("id", id);
    if (error) throw new Error(`Supabase deleteSource: ${error.message}`);
    return true;
  }
}

