import type { MonitoringRunStatus } from "@/lib/domain/enums/status";
import type { AuditFields, ID, ISODateString } from "@/lib/domain/types/common";

export interface MonitoringRun extends AuditFields {
  id: ID;
  mode: "scheduled" | "manual";
  status: MonitoringRunStatus;
  startedAt: ISODateString;
  endedAt?: ISODateString;
  sourcesChecked: number;
  changesDetected: number;
  changeEventIds: ID[];
  notes: string;
}

export interface SourceChangeEvent extends AuditFields {
  id: ID;
  runId: ID;
  sourceId: ID;
  severity: "minor" | "major";
  fingerprint: string;
  summary: string;
  detectedAt: ISODateString;
}

export interface MonitoringDigest {
  runId?: ID;
  generatedAt: ISODateString;
  highlights: string[];
  totalChanges: number;
  escalatedSources: string[];
}
