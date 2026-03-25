import type { SourceRecord } from "@/lib/domain/models/source";
import type { UpsertSourceRequest } from "@/lib/domain/models/source";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error("Supabase source repository is not implemented. Use local adapters for now.");
}

export class SupabaseSourceRepositoryPlaceholder implements SourceRepository {
  async list(): Promise<SourceRecord[]> {
    return notImplemented<SourceRecord[]>();
  }

  async getById(_id: string): Promise<SourceRecord | null> {
    return notImplemented<SourceRecord | null>();
  }

  async upsert(_request: UpsertSourceRequest): Promise<SourceRecord> {
    return notImplemented<SourceRecord>();
  }

  async update(_record: SourceRecord): Promise<SourceRecord> {
    return notImplemented<SourceRecord>();
  }

  async remove(_id: string): Promise<boolean> {
    return notImplemented<boolean>();
  }
}
