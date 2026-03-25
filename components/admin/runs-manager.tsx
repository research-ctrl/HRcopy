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

  useEffect(() => {
    void loadData();
  }, []);

  async function triggerRun() {
    setRunning(true);
    await apiRequest("/api/monitor/run", { method: "POST" });
    await loadData();
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Monitor runs" description="Run and inspect daily source monitoring locally.">
        <div className="mb-5 flex justify-end">
          <Button onClick={() => void triggerRun()} disabled={running}>
            {running ? "Running..." : "Run monitor now"}
          </Button>
        </div>
        {loading ? (
          <LoadingState label="Loading runs" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Run</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Sources</th>
                  <th className="px-3 py-3 font-medium">Changes</th>
                  <th className="px-3 py-3 font-medium">Started</th>
                  <th className="px-3 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-4 font-medium text-slate-900">{run.id}</td>
                    <td className="px-3 py-4">
                      <StatusBadge value={run.status} />
                    </td>
                    <td className="px-3 py-4 text-slate-700">{run.sourcesChecked}</td>
                    <td className="px-3 py-4 text-slate-700">{run.changesDetected}</td>
                    <td className="px-3 py-4 text-slate-700">{formatDate(run.startedAt)}</td>
                    <td className="px-3 py-4 text-slate-600">{run.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Latest digest" description="Summarized change events from the latest run.">
        {!digest ? (
          <LoadingState label="Loading digest" />
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Generated {formatDate(digest.generatedAt)} • {digest.totalChanges} changes • escalated {digest.escalatedSources.length}
            </div>
            {digest.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                {highlight}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

