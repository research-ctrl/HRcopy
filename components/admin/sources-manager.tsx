"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/client/api";
import type { SourceRecord, UpsertSourceRequest } from "@/lib/domain/models/source";

function emptyForm(): UpsertSourceRequest {
  return {
    name: "",
    url: "",
    sourceType: "web",
    parserType: "html",
    refreshFrequency: "daily",
    priority: 3,
    digestEnabled: true,
    status: "active",
    approvalStatus: "pending",
    allowlisted: false,
    notes: "",
  };
}

export function SourcesManager() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<UpsertSourceRequest>(emptyForm());

  async function loadSources() {
    setLoading(true);
    try {
      const data = await apiRequest<SourceRecord[]>("/api/sources");
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSources(); }, []);

  function startEdit(source: SourceRecord) {
    setEditingId(source.id);
    setForm({
      id: source.id,
      name: source.name,
      url: source.url,
      sourceType: source.sourceType,
      parserType: source.parserType,
      refreshFrequency: source.refreshFrequency,
      priority: source.priority,
      digestEnabled: source.digestEnabled,
      status: source.status,
      approvalStatus: source.approvalStatus,
      allowlisted: source.allowlisted,
      notes: source.notes,
    });
  }

  async function saveSource(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      if (editingId) {
        await apiRequest(`/api/sources/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await apiRequest("/api/sources", { method: "POST", body: JSON.stringify(form) });
      }
      setForm(emptyForm());
      setEditingId(undefined);
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save source.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(source: SourceRecord) {
    await apiRequest(`/api/sources/${source.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: source.status === "active" ? "inactive" : "active" }),
    });
    await loadSources();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
      <SectionCard
        title={editingId ? "Edit source" : "Create source"}
        description="Capture only the sources you want the assistant to trust."
      >
        <form className="space-y-4" onSubmit={saveSource}>
          <Field label="Source name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ACT Guidance Portal" />
          </Field>
          <Field label="Base URL">
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://portal.act.gov.pt" />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Type">
              <Select value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as SourceRecord["sourceType"] })}>
                <option value="web">Web</option>
              </Select>
            </Field>
            <Field label="Parser">
              <Select value={form.parserType} onChange={(e) => setForm({ ...form, parserType: e.target.value as SourceRecord["parserType"] })}>
                <option value="html">HTML</option>
                <option value="rss">RSS</option>
                <option value="sitemap">Sitemap</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
            <Field label="Refresh">
              <Select value={form.refreshFrequency} onChange={(e) => setForm({ ...form, refreshFrequency: e.target.value as SourceRecord["refreshFrequency"] })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Priority">
              <Select value={String(form.priority)} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) as SourceRecord["priority"] })}>
                {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SourceRecord["status"] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <Field label="Approval">
              <Select value={form.approvalStatus} onChange={(e) => setForm({ ...form, approvalStatus: e.target.value as SourceRecord["approvalStatus"] })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] cursor-pointer">
              <input type="checkbox" checked={Boolean(form.allowlisted)} onChange={(e) => setForm({ ...form, allowlisted: e.target.checked })} />
              Allowlisted for retrieval
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)] cursor-pointer">
              <input type="checkbox" checked={form.digestEnabled} onChange={(e) => setForm({ ...form, digestEnabled: e.target.checked })} />
              Include in digest runs
            </label>
          </div>

          <Field label="Notes">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Why this source belongs in the governed corpus." />
          </Field>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create source"}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(undefined); setForm(emptyForm()); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Governed sources" description="Only approved and allowlisted sources are eligible for retrieval.">
        {loading ? (
          <LoadingState label="Loading sources" />
        ) : !sources.length ? (
          <EmptyState title="No sources configured" description="Create a source entry to begin governance and monitoring." />
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <article key={source.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4 transition hover:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{source.name}</p>
                      <StatusBadge value={source.status} />
                      <StatusBadge value={source.approvalStatus} />
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--muted)] truncate">{source.url}</p>
                    <p className="mt-1 text-[11px] text-[color:var(--muted)]">
                      {source.sourceType} · {source.parserType} · {source.refreshFrequency} · priority {source.priority}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(source)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleActive(source)}>
                      {source.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white border border-[color:var(--line)] px-3 py-2 text-xs text-[color:var(--muted)]">
                    Retrieval:{" "}
                    <span className={source.allowlisted && source.status === "active" && source.approvalStatus === "approved" ? "text-emerald-600 font-medium" : ""}>
                      {source.allowlisted && source.status === "active" && source.approvalStatus === "approved" ? "Eligible" : "Blocked"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-white border border-[color:var(--line)] px-3 py-2 text-xs text-[color:var(--muted)]">
                    Keep only stable official sources in the allowlist.
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
