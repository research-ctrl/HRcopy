import type { MonitoringDigest, MonitoringRun, SourceChangeEvent } from "@/lib/domain/models/monitoring";
import type { SourceRecord } from "@/lib/domain/models/source";
import type { MonitoringRunRepository } from "@/lib/repositories/interfaces/monitoring-run-repository";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";
import type { MonitorService } from "@/lib/services/interfaces/monitor-service";
import { createId, sha256 } from "@/lib/utils/id";

/**
 * Attempt a real HTTP HEAD request to detect content changes.
 * Uses ETag and Last-Modified headers where available.
 * Falls back to a content-length comparison if headers are absent.
 * Returns a fingerprint string suitable for comparison.
 */
async function fetchFingerprint(url: string): Promise<{ fingerprint: string; reachable: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "HR-Legal-Assistant/1.0 (+compliance-monitor)" },
      redirect: "follow",
    });

    clearTimeout(timeout);

    // Build fingerprint from headers that indicate content change
    const etag          = res.headers.get("etag")          ?? "";
    const lastModified  = res.headers.get("last-modified") ?? "";
    const contentLength = res.headers.get("content-length") ?? "";
    const status        = String(res.status);

    const raw = `${status}:${etag}:${lastModified}:${contentLength}`;
    return { fingerprint: sha256(raw).slice(0, 16), reachable: res.ok };
  } catch {
    // Network error, timeout, or CORS block — treat as "unchanged" to avoid false positives
    return { fingerprint: "", reachable: false };
  }
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

    const activeSources = (await this.sourceRepository.list()).filter(
      (s) => s.allowlisted && s.approvalStatus === "approved" && s.status === "active",
    );

    const run: MonitoringRun = {
      id: createId("run"),
      mode,
      status: "running",
      startedAt,
      sourcesChecked: activeSources.length,
      changesDetected: 0,
      changeEventIds: [],
      notes: "Source scan in progress…",
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    await this.monitoringRepository.createRun(run);

    const events: SourceChangeEvent[] = [];
    const updatedSources: SourceRecord[] = [];

    for (const source of activeSources) {
      const { fingerprint, reachable } = await fetchFingerprint(source.url);
      const checkedAt = new Date().toISOString();

      // If unreachable, skip change detection for this source
      if (!reachable) {
        updatedSources.push({
          ...source,
          lastCheckedAt: checkedAt,
          nextCheckAt: nextCheckTime(source.refreshFrequency),
          updatedAt: checkedAt,
        });
        continue;
      }

      // Detect change: compare new fingerprint to stored hash
      const previousHash = source.lastContentHash ?? "";
      const changed = previousHash !== "" && previousHash !== fingerprint;
      const severity = changed ? detectSeverity(source, fingerprint, previousHash) : null;

      updatedSources.push({
        ...source,
        lastCheckedAt: checkedAt,
        nextCheckAt: nextCheckTime(source.refreshFrequency),
        lastContentHash: fingerprint || previousHash, // keep old hash if fetch gave empty
        changeSeverity: severity ?? (previousHash === "" ? "none" : source.changeSeverity ?? "none"),
        updatedAt: checkedAt,
      });

      if (changed && severity) {
        const event: SourceChangeEvent = {
          id: createId("evt"),
          runId: run.id,
          sourceId: source.id,
          severity,
          fingerprint,
          summary: `${source.name}: ${severity} content change detected (headers changed since last check).`,
          detectedAt: checkedAt,
          createdAt: checkedAt,
          updatedAt: checkedAt,
        };
        events.push(event);
      }
    }

    await Promise.all(updatedSources.map((s) => this.sourceRepository.update(s)));
    if (events.length) await this.monitoringRepository.saveEvents(events);

    const completedRun: MonitoringRun = {
      ...run,
      status: "completed",
      endedAt: new Date().toISOString(),
      changesDetected: events.length,
      changeEventIds: events.map((e) => e.id),
      notes: buildRunNotes(activeSources.length, events),
      updatedAt: new Date().toISOString(),
    };

    await this.monitoringRepository.updateRun(completedRun);

    const digest: MonitoringDigest = {
      runId: completedRun.id,
      generatedAt: completedRun.updatedAt,
      highlights: events.length
        ? events.map((e) => e.summary)
        : ["No content changes detected across active sources in this run."],
      totalChanges: events.length,
      escalatedSources: events
        .filter((e) => e.severity === "major")
        .map((e) => activeSources.find((s) => s.id === e.sourceId)?.name ?? e.sourceId),
    };

    await this.monitoringRepository.saveDigest(digest);
    return completedRun;
  }

  async getDigest() {
    return this.monitoringRepository.getDigest();
  }
}

/** Very simple severity heuristic based on fingerprint entropy change */
function detectSeverity(
  _source: SourceRecord,
  newHash: string,
  _oldHash: string,
): "minor" | "major" {
  // If the first nibble of the hash changed significantly (high-entropy diff), treat as major
  const diff = parseInt(newHash.slice(0, 2), 16) ^ parseInt(_oldHash.slice(0, 2), 16);
  return diff > 64 ? "major" : "minor";
}

function nextCheckTime(frequency: SourceRecord["refreshFrequency"]): string {
  const ms =
    frequency === "daily"  ? 24 * 60 * 60 * 1000 :
    frequency === "weekly" ? 7 * 24 * 60 * 60 * 1000 :
    7 * 24 * 60 * 60 * 1000; // manual → check weekly anyway
  return new Date(Date.now() + ms).toISOString();
}

function buildRunNotes(sourcesChecked: number, events: SourceChangeEvent[]): string {
  if (!events.length) return `Checked ${sourcesChecked} source(s). No changes detected.`;
  const major = events.filter((e) => e.severity === "major").length;
  const minor = events.filter((e) => e.severity === "minor").length;
  const parts = [
    `Checked ${sourcesChecked} source(s).`,
    major ? `${major} major change(s) detected.` : null,
    minor ? `${minor} minor change(s) detected.` : null,
  ].filter(Boolean);
  return parts.join(" ");
}
