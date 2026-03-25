import type { MonitoringDigest, MonitoringRun, SourceChangeEvent } from "@/lib/domain/models/monitoring";
import type { SourceRecord } from "@/lib/domain/models/source";
import type { MonitoringRunRepository } from "@/lib/repositories/interfaces/monitoring-run-repository";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";
import type { MonitorService } from "@/lib/services/interfaces/monitor-service";
import { createId, sha256 } from "@/lib/utils/id";

function simulateFingerprint(source: SourceRecord, dayKey: string) {
  return sha256(`${source.id}:${source.url}:${dayKey}`).slice(0, 16);
}

function severityForFingerprint(fingerprint: string) {
  const numeric = Number.parseInt(fingerprint.slice(0, 2), 16);
  if (numeric % 7 === 0) {
    return "major" as const;
  }
  if (numeric % 3 === 0) {
    return "minor" as const;
  }
  return null;
}

export class LocalMonitorService implements MonitorService {
  constructor(
    private readonly monitoringRepository: MonitoringRunRepository,
    private readonly sourceRepository: SourceRepository,
  ) {}

  async listRuns() {
    return this.monitoringRepository.listRuns();
  }

  async runNow(mode: "manual" | "scheduled" = "manual") {
    const startedAt = new Date().toISOString();
    const dayKey = startedAt.slice(0, 10);
    const activeSources = (await this.sourceRepository.list()).filter(
      (source) => source.allowlisted && source.approvalStatus === "approved" && source.status === "active",
    );

    const run: MonitoringRun = {
      id: createId("run"),
      mode,
      status: "running",
      startedAt,
      sourcesChecked: activeSources.length,
      changesDetected: 0,
      changeEventIds: [],
      notes: "Monitoring run in progress.",
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    await this.monitoringRepository.createRun(run);

    const events: SourceChangeEvent[] = [];
    const updatedSources: SourceRecord[] = [];

    for (const source of activeSources) {
      const fingerprint = simulateFingerprint(source, dayKey);
      const severity = severityForFingerprint(fingerprint);
      const checkedAt = new Date().toISOString();

      updatedSources.push({
        ...source,
        lastCheckedAt: checkedAt,
        nextCheckAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        lastContentHash: fingerprint,
        changeSeverity: severity ?? "none",
        updatedAt: checkedAt,
      });

      if (!severity) {
        continue;
      }

      const event: SourceChangeEvent = {
        id: createId("evt"),
        runId: run.id,
        sourceId: source.id,
        severity,
        fingerprint,
        summary: `${source.name} produced a simulated ${severity} content change during the daily monitor run.`,
        detectedAt: checkedAt,
        createdAt: checkedAt,
        updatedAt: checkedAt,
      };

      events.push(event);
    }

    await Promise.all(updatedSources.map((source) => this.sourceRepository.update(source)));
    if (events.length) {
      await this.monitoringRepository.saveEvents(events);
    }

    const completedRun: MonitoringRun = {
      ...run,
      status: "completed",
      endedAt: new Date().toISOString(),
      changesDetected: events.length,
      changeEventIds: events.map((event) => event.id),
      notes: events.length
        ? `Completed with ${events.length} simulated change event(s).`
        : "Completed with no detected changes.",
      updatedAt: new Date().toISOString(),
    };

    await this.monitoringRepository.updateRun(completedRun);

    const digest: MonitoringDigest = {
      runId: completedRun.id,
      generatedAt: completedRun.updatedAt,
      highlights: events.length
        ? events.map((event) => event.summary)
        : ["No changes were detected across active allowlisted sources in this run."],
      totalChanges: events.length,
      escalatedSources: events
        .filter((event) => event.severity === "major")
        .map((event) => activeSources.find((source) => source.id === event.sourceId)?.name ?? event.sourceId),
    };

    await this.monitoringRepository.saveDigest(digest);
    return completedRun;
  }

  async getDigest() {
    return this.monitoringRepository.getDigest();
  }
}
