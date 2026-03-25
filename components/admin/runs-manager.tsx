"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { MonitoringDigest, MonitoringRun } from "@/lib/domain/models/monitoring";
import { formatDate } from "@/lib/utils";

export function RunsManager() {
  const [runs, setRuns] = useState<MonitoringRun[]>([]);
  const [digest, setDigest] = useState<MonitoringDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  async function loadData() {
    setLoading(true);
    const [runsData, digestData] = await Promise.all([
      apiRequest<MonitoringRun[]>("/api/monitor/run"),
      apiRequest<MonitoringDigest>("/api/monitor/digest"),
    ]);
    setRuns(runsData);
    setDigest(digestData);
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  async function triggerRun() {
    setRunning(true);
    await apiRequest("/api/monitor/run", { method: "POST" });
    await loadData();
    setRunning(false);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Monitor runs" description="Run and inspect local source monitoring.">
        <div className="mb-4 flex justify-end">
          <Button onClick={() => void triggerRun()} disabled={running}>
            {running ? "Running…" : "Run now"}
          </Button>
        </div>

        {loading ? (
          <LoadingState label="Loading runs" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] bg-[color:var(--background)]">
                  {["Run", "Status", "Sources", "Changes", "Started", "Summary"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold text-[color:var(--muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-[color:var(--line)] align-top last:border-b-0 hover:bg-[color:var(--background)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{run.id}</td>
                    <td className="px-4 py-3"><StatusBadge value={run.status} /></td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{run.sourcesChecked}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{run.changesDetected}</td>
                    <td className="px-4 py-3 text-[color:var(--muted)]">{formatDate(run.startedAt)}</td>
                    <td className="px-4 py-3 text-[color:var(--muted)]">{run.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Latest digest" description="Highlights from the most recent run.">
        {!digest ? (
          <LoadingState label="Loading digest" />
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl bg-[color:var(--background)] border border-[color:var(--line)] px-4 py-3 text-sm text-[color:var(--muted)]">
              Generated {formatDate(digest.generatedAt)} · {digest.totalChanges} changes · {digest.escalatedSources.length} escalated
            </div>
            {digest.highlights.map((h) => (
              <div key={h} className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)]">
                {h}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
