"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { LoadingState } from "@/components/ui/loading-state";
import { StatGrid } from "@/components/admin/stat-grid";
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

/* ── 4-step RAG setup guide ─────────────────────────────────── */
const ragSteps = [
  {
    number: "1",
    title: "Upload documents",
    description: "Go to Knowledge → upload a PDF or image (policy, contract, employment code). Images are auto-scanned with OCR.",
    href: "/admin/knowledge",
    action: "Upload now",
    icon: "upload" as const,
  },
  {
    number: "2",
    title: "Approve the document",
    description: "After uploading, click Approve. Only approved documents can be used by the assistant — this is how you control what it knows.",
    href: "/admin/knowledge",
    action: "Review documents",
    icon: "check" as const,
  },
  {
    number: "3",
    title: "Ask a question in chat",
    description: "Go to Chat and ask any HR question. The assistant searches your approved documents and answers based only on what you uploaded.",
    href: "/chat",
    action: "Open chat",
    icon: "chat" as const,
  },
  {
    number: "4",
    title: "Add an AI model (optional)",
    description: "Add MISTRAL_API_KEY to .env.local to use Mistral AI instead of local demo mode. Then select Mistral in the chat model picker.",
    href: "/admin/settings",
    action: "View settings",
    icon: "spark" as const,
  },
];

function RagGuide() {
  return (
    <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--brand)]">How RAG works</p>
      <h2 className="mt-1.5 text-base font-semibold text-[color:var(--foreground)]">
        Setup guide — 4 steps to a working assistant
      </h2>
      <p className="mt-1.5 text-sm text-[color:var(--muted)] leading-relaxed">
        RAG = Retrieval-Augmented Generation. The AI searches your documents first, then answers based only on what it finds —
        no hallucinations from general knowledge, only your approved official content.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ragSteps.map((step) => (
          <div
            key={step.number}
            className="flex gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-bold text-white">
              {step.number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted)]">{step.description}</p>
              <Link
                href={step.href}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--brand)] hover:underline"
              >
                {step.action} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Where data is stored:</strong> Everything saves to{" "}
        <code className="font-mono text-xs bg-amber-100 px-1 rounded">data/db/*.json</code> on your server.
        To use Supabase cloud storage, run <code className="font-mono text-xs bg-amber-100 px-1 rounded">supabase-schema.sql</code> and
        add your Supabase keys to <code className="font-mono text-xs bg-amber-100 px-1 rounded">.env.local</code>.
      </div>
    </section>
  );
}

const quickLinks = [
  { href: "/chat",             label: "Open chat",   icon: "chat"     as const, desc: "Ask HR questions" },
  { href: "/admin/knowledge",  label: "Knowledge",   icon: "document" as const, desc: "Upload & approve" },
  { href: "/admin/sources",    label: "Sources",     icon: "source"   as const, desc: "Edit source registry" },
  { href: "/admin/sync",       label: "Sync",        icon: "monitor"  as const, desc: "Run source scans" },
];

export function DashboardOverview() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [persistenceOk, setPersistenceOk] = useState<boolean | null>(null);

  useEffect(() => {
    void apiRequest<DashboardResponse>("/api/dashboard").then(setData);
    void apiRequest<{ writable: boolean }>("/api/dev/check-persistence")
      .then(() => setPersistenceOk(true))
      .catch(() => setPersistenceOk(false));
  }, []);

  if (!data) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <div className="space-y-6">

      {/* Storage warning if not writable */}
      {persistenceOk === false && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p className="font-semibold mb-1">Storage is not writable — data will not be saved</p>
          <p>
            The server cannot write to disk. This usually means you are running on a serverless platform.
            Run locally with <code className="font-mono text-xs bg-rose-100 px-1 rounded">npm run dev</code>, or switch to Supabase.
          </p>
        </div>
      )}

      {/* Stats */}
      <StatGrid metrics={data.snapshot.metrics} />

      {/* RAG setup guide */}
      <RagGuide />

      {/* Health + quick links */}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">System health</h2>
          <p className="mb-4 text-sm text-[color:var(--muted)]">Which AI providers are configured and working.</p>
          <div className="space-y-2">
            {/* Persistence status */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">Storage</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {persistenceOk === null ? "Checking…" : persistenceOk ? "Writable — data will persist" : "Read-only — data will not persist"}
                </p>
              </div>
              {persistenceOk !== null && (
                <StatusBadge value={persistenceOk ? "approved" : "failed"} />
              )}
            </div>
            {data.systemHealth.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">{item.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">
                    {item.configured ? "API key found — ready to use" : "No API key — using local fallback"}
                  </p>
                </div>
                <StatusBadge value={item.health} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">Quick links</h2>
          <p className="mb-4 text-sm text-[color:var(--muted)]">Common admin actions.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-3 transition-colors hover:bg-white"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
                  <AppIcon name={item.icon} className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">{item.label}</p>
                  <p className="text-xs text-[color:var(--muted)]">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {data.snapshot.alerts.length > 0 ? (
            <div className="mt-3 space-y-2">
              {data.snapshot.alerts.map((alert) => (
                <div key={alert} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {alert}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* Recent activity */}
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">Recent uploads</h2>
          <p className="mb-3 text-sm text-[color:var(--muted)]">Last documents added.</p>
          {data.recentUploads.length ? (
            <div className="space-y-2">
              {data.recentUploads.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{doc.title}</p>
                    <StatusBadge value={doc.approvalStatus} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {doc.chunkCount} chunks · {doc.versionCount} version{doc.versionCount === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">
              No documents yet.{" "}
              <Link href="/admin/knowledge" className="text-[color:var(--brand)] font-medium hover:underline">
                Upload one
              </Link>{" "}
              to get started.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">Recent syncs</h2>
          <p className="mb-3 text-sm text-[color:var(--muted)]">Latest source monitoring runs.</p>
          {data.recentRuns.length ? (
            <div className="space-y-2">
              {data.recentRuns.map((run) => (
                <div key={run.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{run.id}</p>
                    <StatusBadge value={run.status} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {run.sourcesChecked} sources · {formatDate(run.startedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">
              No syncs yet.{" "}
              <Link href="/admin/sync" className="text-[color:var(--brand)] font-medium hover:underline">
                Run the first scan
              </Link>.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">Review queue</h2>
          <p className="mb-3 text-sm text-[color:var(--muted)]">Low-confidence answers needing human review.</p>
          {data.pendingReviews.length ? (
            <div className="space-y-2">
              {data.pendingReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{review.verdict}</p>
                    <StatusBadge value={review.priority} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)] line-clamp-2">{review.question}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">All clear — no items in queue.</p>
          )}
        </section>
      </div>
    </div>
  );
}
