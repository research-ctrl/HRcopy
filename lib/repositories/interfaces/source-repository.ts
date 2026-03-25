import type { SourceRecord, UpsertSourceRequest } from "@/lib/domain/models/source";

export interface SourceRepository {
  list(): Promise<SourceRecord[]>;
  getById(id: string): Promise<SourceRecord | null>;
  upsert(request: UpsertSourceRequest): Promise<SourceRecord>;
  update(record: SourceRecord): Promise<SourceRecord>;
  remove(id: string): Promise<boolean>;
}
