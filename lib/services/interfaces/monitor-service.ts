import type { MonitoringDigest, MonitoringRun } from "@/lib/domain/models/monitoring";

export interface MonitorService {
  listRuns(): Promise<MonitoringRun[]>;
  runNow(mode?: "manual" | "scheduled"): Promise<MonitoringRun>;
  getDigest(): Promise<MonitoringDigest>;
}
