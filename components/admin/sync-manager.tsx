"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { MonitoringDigest, MonitoringRun } from "@/lib/domain/models/monitoring";
import type { SourceRecord } from "@/lib/domain/models/source";
import { cn, formatDate } from "@/lib/utils";

function StatPill({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-3">
      <p className="text-xs text-[color:var(--muted)]">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold", highlight ? "text-[color:var(--brand)]" : "text-[color:var(--foreground)]")}>
        {value}
      </p>
    </div>
  );
}

export function SyncManager() {
  const [runs, setRuns] = useState<MonitoringRun[]>([]);
  const [digest, setDigest] = useState<MonitoringDigest | null>(null);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string>();
  const [persistenceOk, setPersistenceOk] = useState<boolean | null>(null);

  async function loadData() {
    setLoading(true);
    const [runsRes, digestRes, sourcesRes] = await Promise.allSettled([
      apiRequest<MonitoringRun[]>("/api/monitor/run"),
      apiRequest<MonitoringDigest>("/api/monitor/digest"),
      apiRequest<SourceRecord[]>("/api/sources"),
    ]);
    if (runsRes.status === "fulfilled")   setRuns(runsRes.value);
    if (digestRes.status === "fulfilled") setDigest(digestRes.value);
    if (sourcesRes.status === "fulfilled") setSources(sourcesRes.value);
    setLoading(false);
  }

  async function checkPersistence() {
    try {
      await apiRequest<{ writable: boolean }>("/api/dev/check-persistence");
      setPersistenceOk(true);
    } catch {
      setPersistenceOk(false);
    }
  }

  useEffect(() => {
    void loadData();
    void checkPersistence();
  }, []);

  async function triggerRun() {
    setRunning(true);
    setRunError(undefined);
    try {
      await apiRequest("/api/monitor/run", { method: "POST" });
      await loadData();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  }

  const activeSources   = sources.filter((s) => s.status === "active").length;
  const allowlisted     = sources.filter((s) => s.allowlisted && s.status === "active" && s.approvalStatus === "approved").length;
  const lastRun         = runs[0];
  const totalChanges    = digest?.totalChanges ?? 0;

  return (
    <div className="space-y-6">

      {/* Persistence health banner */}
      {persistenceOk === false && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p className="font-semibold mb-1">Storage is not writable</p>
          <p>
            Data cannot be saved to disk. This usually means the app is running on a serverless host
            (e.g. Vercel) where the filesystem is read-only. To fix this, either run the app on a
            persistent server, or switch to Supabase — see <code className="font-mono">supabase-schema.sql</code> in
            the project root.
          </p>
        </div>
      )}

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Active sources"     value={activeSources} />
          <StatPill label="Allowlisted"        value={allowlisted} highlight />
          <StatPill label="Total runs"         value={runs.length} />
          <StatPill label="Changes detected"   value={totalChanges} highlight={totalChanges > 0} />
        </div>
      )}

      {/* Run now */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[color:var(--foreground)]">Manual scan</h2>
            <p className="text-sm text-[color:var(--muted)] mt-1">
              Check all active sources for content changes right now.
              {lastRun ? ` Last run: ${formatDate(lastRun.startedAt)}.` : " No runs yet."}
            </p>
          </div>
          <Button onClick={() => void triggerRun()} disabled={running || loading} className="shrink-0">
            {running ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Scanning…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <AppIcon name="monitor" className="h-4 w-4" />
                Run now
              </span>
            )}
          </Button>
        </div>
        {runError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{runError}</div>
        )}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Scheduled scans:</strong> To run automatically, add this to{" "}
          <code className="font-mono text-xs bg-amber-100 px-1 rounded">vercel.json</code>:{" "}
          <code className="font-mono text-xs bg-amber-100 px-1 rounded">{`"crons": [{"path": "/api/cron/sync", "schedule": "0 7 * * *"}]`}</code>
          {" "}(runs at 07:00 UTC daily). Or call <code className="font-mono text-xs bg-amber-100 px-1 rounded">GET /api/cron/sync</code> from any external scheduler.
        </div>
      </div>

      {/* Latest digest */}
      {digest && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
          <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-1">Latest digest</h2>
          <p className="text-sm text-[color:var(--muted)] mb-4">
            {formatDate(digest.generatedAt)} · {digest.totalChanges} change{digest.totalChanges === 1 ? "" : "s"} ·{" "}
            {digest.escalatedSources.length} escalated
          </p>
          {digest.highlights.length > 0 ? (
            <div className="space-y-2">
              {digest.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)]" />
                  <p className="text-sm text-[color:var(--foreground)]">{h}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">No changes detected in the last run.</p>
          )}
        </div>
      )}

      {/* Run history */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-1">Run history</h2>
        <p className="text-sm text-[color:var(--muted)] mb-4">All source scans recorded on this instance.</p>

        {loading ? (
          <LoadingState label="Loading run history" />
        ) : !runs.length ? (
          <EmptyState title="No runs yet" description="Click Run now to perform the first source scan." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[color:var(--line)]">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] bg-[color:var(--background)]">
                  {["Status", "Started", "Sources", "Changes", "Mode", "Notes"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-[color:var(--line)] last:border-b-0 hover:bg-[color:var(--background)] transition-colors">
                    <td className="px-4 py-3"><StatusBadge value={run.status} /></td>
                    <td className="px-4 py-3 text-[color:var(--muted)]">{formatDate(run.startedAt)}</td>
                    <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{run.sourcesChecked}</td>
                    <td className="px-4 py-3">
                      <span className={run.changesDetected > 0 ? "text-amber-700 font-medium" : "text-[color:var(--muted)]"}>
                        {run.changesDetected}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--muted)] capitalize">{run.mode}</td>
                    <td className="px-4 py-3 text-[color:var(--muted)] max-w-xs truncate">{run.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Source status */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <h2 className="text-base font-semibold text-[color:var(--foreground)] mb-1">Source status</h2>
        <p className="text-sm text-[color:var(--muted)] mb-4">Last check time and change status per source.</p>
        {loading ? (
          <LoadingState label="Loading sources" />
        ) : !sources.length ? (
          <EmptyState title="No sources configured" description="Add sources in the Sources page first." />
        ) : (
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{s.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">
                    {s.lastCheckedAt ? `Checked ${formatDate(s.lastCheckedAt)}` : "Not yet checked"} · {s.refreshFrequency}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.changeSeverity && s.changeSeverity !== "none" && (
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      s.changeSeverity === "major" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700",
                    )}>
                      {s.changeSeverity} change
                    </span>
                  )}
                  <StatusBadge value={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
