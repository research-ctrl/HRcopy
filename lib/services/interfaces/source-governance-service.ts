import type { SourceRecord, UpsertSourceRequest } from "@/lib/domain/models/source";

export interface SourceGovernanceService {
  list(): Promise<SourceRecord[]>;
  getById(id: string): Promise<SourceRecord | null>;
  upsert(request: UpsertSourceRequest): Promise<SourceRecord>;
  remove(id: string): Promise<boolean>;
}

