import type { SourceRecord, UpsertSourceRequest } from "@/lib/domain/models/source";
import { seedSources } from "@/lib/persistence/local-seeds";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import { createId } from "@/lib/utils/id";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";

export class LocalSourceRepository implements SourceRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).sources;
  }

  async list() {
    return readJsonFile<SourceRecord[]>(this.filePath, seedSources);
  }

  async getById(id: string) {
    const sources = await this.list();
    return sources.find((source) => source.id === id) ?? null;
  }

  async upsert(request: UpsertSourceRequest) {
    const sources = await this.list();
    const now = new Date().toISOString();

    if (request.id) {
      const existing = sources.find((source) => source.id === request.id);
      if (existing) {
        const updated: SourceRecord = {
          ...existing,
          name: request.name,
          url: request.url,
          sourceType: request.sourceType ?? existing.sourceType,
          parserType: request.parserType ?? existing.parserType,
          refreshFrequency: request.refreshFrequency ?? existing.refreshFrequency,
          priority: request.priority ?? existing.priority,
          digestEnabled: request.digestEnabled,
          status: request.status,
          approvalStatus: request.approvalStatus ?? existing.approvalStatus,
          allowlisted: request.allowlisted ?? existing.allowlisted,
          notes: request.notes,
          updatedAt: now,
        };
        await this.update(updated);
        return updated;
      }
    }

    const created: SourceRecord = {
      id: createId("src"),
      name: request.name,
      url: request.url,
      sourceType: request.sourceType ?? "web",
      parserType: request.parserType ?? "html",
      refreshFrequency: request.refreshFrequency ?? "daily",
      priority: request.priority ?? 3,
      owner: {
        id: "actor-ops-local",
        name: "Local Ops Owner",
        role: "ops-owner",
      },
      jurisdiction: "PT",
      status: request.status,
      approvalStatus: request.approvalStatus ?? "pending",
      allowlisted: request.allowlisted ?? false,
      digestEnabled: request.digestEnabled,
      changeSeverity: "none",
      notes: request.notes,
      createdAt: now,
      updatedAt: now,
    };

    sources.unshift(created);
    await writeJsonFile(this.filePath, sources);
    return created;
  }

  async update(record: SourceRecord) {
    const sources = await this.list();
    const index = sources.findIndex((source) => source.id === record.id);
    if (index === -1) {
      sources.unshift(record);
    } else {
      sources[index] = record;
    }

    await writeJsonFile(this.filePath, sources);
    return record;
  }

  async remove(id: string) {
    const sources = await this.list();
    const next = sources.filter((source) => source.id !== id);
    const removed = next.length !== sources.length;
    if (removed) {
      await writeJsonFile(this.filePath, next);
    }
    return removed;
  }
}
