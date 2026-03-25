"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatGrid } from "@/components/admin/stat-grid";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { DashboardSnapshot } from "@/lib/domain/models/dashboard";
import type { DocumentRecord } from "@/lib/domain/models/document";
import type { MonitoringRun } from "@/lib/domain/models/monitoring";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import { formatDate } from "@/lib/utils";

interface DashboardResponse {
  snapshot: DashboardSnapshot;
  recentUploads: DocumentRecord[];
  recentRuns: MonitoringRun[];
  pendingReviews: ReviewQueueItem[];
  systemHealth: Array<{
    name: string;
    family: string;
    health: string;
    configured: boolean;
  }>;
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    void apiRequest<DashboardResponse>("/api/dashboard").then(setData);
  }, []);

  if (!data) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <div className="space-y-6">
      <StatGrid metrics={data.snapshot.metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <SectionCard title="Quick actions" description="Common tasks for HR operations and legal governance.">
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/admin/documents" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              Open document operations
            </Link>
            <Link href="/chat" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
              Open assistant workspace
            </Link>
            <Link href="/admin/sources" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
              Review sources
            </Link>
            <Link href="/admin/reviews" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
              Inspect QC queue
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {data.snapshot.alerts.map((alert) => (
              <div key={alert} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {alert}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="System health" description="Provider and runtime posture.">
          <div className="space-y-3">
            {data.systemHealth.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.family}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge value={item.health} />
                    <span className="text-xs text-slate-500">{item.configured ? "configured" : "local fallback"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Recent uploads" description="Newest ingested documents.">
          <div className="space-y-3">
            {data.recentUploads.map((document) => (
              <div key={document.id} className="rounded-2xl bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{document.title}</p>
                  <StatusBadge value={document.approvalStatus} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{document.chunkCount} chunks • {document.versionCount} versions</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent monitor runs" description="Latest source monitoring activity.">
          <div className="space-y-3">
            {data.recentRuns.map((run) => (
              <div key={run.id} className="rounded-2xl bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{run.id}</p>
                  <StatusBadge value={run.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{run.sourcesChecked} sources • {run.changesDetected} changes</p>
                <p className="mt-2 text-xs text-slate-500">{formatDate(run.startedAt)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Review queue" description="Latest escalations requiring attention.">
          <div className="space-y-3">
            {data.pendingReviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{review.verdict}</p>
                  <StatusBadge value={review.priority} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.question}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
