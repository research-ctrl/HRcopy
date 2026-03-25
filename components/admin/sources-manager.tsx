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
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load sources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

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
        await apiRequest(`/api/sources/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await apiRequest("/api/sources", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      setForm(emptyForm());
      setEditingId(undefined);
      await loadSources();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save source.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(source: SourceRecord) {
    await apiRequest(`/api/sources/${source.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: source.status === "active" ? "inactive" : "active",
      }),
    });
    await loadSources();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
      <SectionCard title={editingId ? "Edit source" : "Create source"} description="Manage approved-source governance, parser metadata, and refresh posture.">
        <form className="space-y-4" onSubmit={saveSource}>
          <Field label="Source name">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="ACT Guidance Portal" />
          </Field>
          <Field label="Base URL">
            <Input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://portal.act.gov.pt" />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Source type">
              <Select value={form.sourceType} onChange={(event) => setForm({ ...form, sourceType: event.target.value as SourceRecord["sourceType"] })}>
                <option value="web">Web</option>
              </Select>
            </Field>
            <Field label="Parser type">
              <Select value={form.parserType} onChange={(event) => setForm({ ...form, parserType: event.target.value as SourceRecord["parserType"] })}>
                <option value="html">HTML</option>
                <option value="rss">RSS</option>
                <option value="sitemap">Sitemap</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
            <Field label="Refresh frequency">
              <Select
                value={form.refreshFrequency}
                onChange={(event) => setForm({ ...form, refreshFrequency: event.target.value as SourceRecord["refreshFrequency"] })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Priority">
              <Select value={String(form.priority)} onChange={(event) => setForm({ ...form, priority: Number(event.target.value) as SourceRecord["priority"] })}>
                {[1, 2, 3, 4, 5].map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SourceRecord["status"] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <Field label="Approval">
              <Select
                value={form.approvalStatus}
                onChange={(event) => setForm({ ...form, approvalStatus: event.target.value as SourceRecord["approvalStatus"] })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.allowlisted)}
                onChange={(event) => setForm({ ...form, allowlisted: event.target.checked })}
              />
              Allowlisted for retrieval
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.digestEnabled}
                onChange={(event) => setForm({ ...form, digestEnabled: event.target.checked })}
              />
              Include in digest runs
            </label>
          </div>
          <Field label="Governance notes">
            <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Why this source is approved, what to watch, and any caveats." />
          </Field>
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create source"}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={() => { setEditingId(undefined); setForm(emptyForm()); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Allowlisted domains" description="Only approved, active, allowlisted sources are eligible for retrieval.">
        {loading ? (
          <LoadingState label="Loading sources" />
        ) : !sources.length ? (
          <EmptyState title="No sources configured" description="Create a source entry to begin governance and monitoring." />
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <article key={source.id} className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{source.name}</p>
                      <StatusBadge value={source.status} />
                      <StatusBadge value={source.approvalStatus} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{source.url}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {source.sourceType} • {source.parserType} parser • {source.refreshFrequency} refresh • priority {source.priority}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(source)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleActive(source)}>
                      {source.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Retrieval eligibility: {source.allowlisted && source.status === "active" && source.approvalStatus === "approved" ? "Eligible" : "Blocked"}
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Governance hint: approve and allowlist only stable official sources.
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
