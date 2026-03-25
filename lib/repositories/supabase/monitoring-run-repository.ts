import type {
  MonitoringDigest,
  MonitoringRun,
  SourceChangeEvent,
} from "@/lib/domain/models/monitoring";
import type { MonitoringRunRepository } from "@/lib/repositories/interfaces/monitoring-run-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error(
    "Supabase monitoring run repository is not implemented. Use local adapters for now."
  );
}

export class SupabaseMonitoringRunRepository implements MonitoringRunRepository {
  async listRuns(): Promise<MonitoringRun[]> {
    return notImplemented<MonitoringRun[]>();
  }

  async createRun(_run: MonitoringRun): Promise<MonitoringRun> {
    return notImplemented<MonitoringRun>();
  }

  async updateRun(_run: MonitoringRun): Promise<MonitoringRun> {
    return notImplemented<MonitoringRun>();
  }

  async listEvents(): Promise<SourceChangeEvent[]> {
    return notImplemented<SourceChangeEvent[]>();
  }

  async saveEvents(_events: SourceChangeEvent[]): Promise<void> {
    return notImplemented<void>();
  }

  async getDigest(): Promise<MonitoringDigest> {
    return notImplemented<MonitoringDigest>();
  }

  async saveDigest(_digest: MonitoringDigest): Promise<MonitoringDigest> {
    return notImplemented<MonitoringDigest>();
  }
}
