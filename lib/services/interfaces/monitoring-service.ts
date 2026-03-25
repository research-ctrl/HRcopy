import type { MonitoringDigest, MonitoringRun } from "@/lib/domain/models/monitoring";

export interface MonitoringService {
  listRuns(): Promise<MonitoringRun[]>;
  runNow(): Promise<MonitoringRun>;
  getDigest(): Promise<MonitoringDigest>;
}

