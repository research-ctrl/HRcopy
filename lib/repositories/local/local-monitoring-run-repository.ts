import type { MonitoringDigest, MonitoringRun, SourceChangeEvent } from "@/lib/domain/models/monitoring";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedDigest, seedEvents, seedRuns } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import type { MonitoringRunRepository } from "@/lib/repositories/interfaces/monitoring-run-repository";

export class LocalMonitoringRunRepository implements MonitoringRunRepository {
  constructor(private readonly root?: string) {}

  private get paths() {
    return getDbFilePaths(this.root);
  }

  async listRuns() {
    return readJsonFile<MonitoringRun[]>(this.paths.runs, seedRuns);
  }

  async createRun(run: MonitoringRun) {
    const runs = await this.listRuns();
    runs.unshift(run);
    await writeJsonFile(this.paths.runs, runs);
    return run;
  }

  async updateRun(run: MonitoringRun) {
    const runs = await this.listRuns();
    const index = runs.findIndex((item) => item.id === run.id);
    if (index === -1) {
      runs.unshift(run);
    } else {
      runs[index] = run;
    }
    await writeJsonFile(this.paths.runs, runs);
    return run;
  }

  async listEvents() {
    return readJsonFile<SourceChangeEvent[]>(this.paths.events, seedEvents);
  }

  async saveEvents(events: SourceChangeEvent[]) {
    const current = await this.listEvents();
    const next = [...events, ...current];
    await writeJsonFile(this.paths.events, next);
  }

  async getDigest() {
    return readJsonFile<MonitoringDigest>(this.paths.digest, seedDigest);
  }

  async saveDigest(digest: MonitoringDigest) {
    await writeJsonFile(this.paths.digest, digest);
    return digest;
  }
}

