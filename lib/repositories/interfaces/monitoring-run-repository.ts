import type { MonitoringDigest, MonitoringRun, SourceChangeEvent } from "@/lib/domain/models/monitoring";

export interface MonitoringRunRepository {
  listRuns(): Promise<MonitoringRun[]>;
  createRun(run: MonitoringRun): Promise<MonitoringRun>;
  updateRun(run: MonitoringRun): Promise<MonitoringRun>;
  listEvents(): Promise<SourceChangeEvent[]>;
  saveEvents(events: SourceChangeEvent[]): Promise<void>;
  getDigest(): Promise<MonitoringDigest>;
  saveDigest(digest: MonitoringDigest): Promise<MonitoringDigest>;
}
