"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { apiRequest } from "@/lib/client/api";
import { defaultBlockText, parseBlockText, sourcesToBlockText } from "@/lib/sources/source-block-parser";
import type { SourceRecord } from "@/lib/domain/models/source";

interface BulkSaveResponse {
  sources: SourceRecord[];
  warnings: string[];
  errors: string[];
}

function ValidationMessage({
  type,
  children,
}: {
  type: "error" | "warning" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    error:   "border-rose-200 bg-rose-50 text-rose-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
  );
}

export function SourceBlockEditor() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>();
  const [dirty, setDirty] = useState(false);

  // Live parse feedback (no network call, just client-side)
  const { blocks: liveBlocks, errors: liveErrors } = parseBlockText(text);

  async function loadSources() {
    setLoading(true);
    try {
      const sources = await apiRequest<SourceRecord[]>("/api/sources");
      if (sources.length > 0) {
        setText(sourcesToBlockText(sources));
      } else {
        setText(defaultBlockText());
      }
    } catch {
      setText(defaultBlockText());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSources(); }, []);

  async function handleSave() {
    setSaving(true);
    setError(undefined);
    setWarnings([]);
    setSuccess(undefined);

    try {
      const result = await apiRequest<BulkSaveResponse>("/api/sources/bulk", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setSuccess(`Saved ${result.sources.length} source${result.sources.length === 1 ? "" : "s"} successfully.`);
      setWarnings(result.warnings);
      setDirty(false);
    } catch (err) {
      if (err instanceof Error && err.message.includes("422")) {
        setError("There are errors in your source definitions. Check the validation panel below.");
      } else {
        setError(err instanceof Error ? err.message : "Unable to save sources.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setText(defaultBlockText());
    setDirty(true);
    setError(undefined);
    setSuccess(undefined);
    setWarnings([]);
  }

  if (loading) return <LoadingState label="Loading sources" />;

  return (
    <div className="space-y-4">
      {/* Format guide */}
      <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-5 py-4">
        <p className="text-sm font-semibold text-[color:var(--foreground)] mb-1.5">How to edit sources</p>
        <p className="text-sm text-[color:var(--muted)] leading-relaxed">
          Each source is a <code className="text-xs bg-white border border-[color:var(--line)] px-1.5 py-0.5 rounded font-mono">---</code> block with
          {" "}<strong>name</strong>, <strong>url</strong>, and optionally{" "}
          authority, topics, refresh (daily/weekly/manual), priority (1–5), allowlist (true/false), status, and notes.
          Separate blocks with <code className="text-xs bg-white border border-[color:var(--line)] px-1.5 py-0.5 rounded font-mono">---</code>.
          Changes only take effect when you click Save.
        </p>
      </div>

      {/* Live status bar */}
      <div className="flex items-center gap-3 text-sm">
        <span className={`flex items-center gap-1.5 font-medium ${liveErrors.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
          <span className={`h-2 w-2 rounded-full ${liveErrors.length > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
          {liveErrors.length > 0
            ? `${liveErrors.length} error${liveErrors.length === 1 ? "" : "s"} — fix before saving`
            : `${liveBlocks.length} source${liveBlocks.length === 1 ? "" : "s"} ready`}
        </span>
        {dirty && <span className="text-amber-600">Unsaved changes</span>}
      </div>

      {/* Live parse errors */}
      {liveErrors.length > 0 && (
        <div className="space-y-2">
          {liveErrors.map((e, i) => (
            <ValidationMessage key={i} type="error">{e.message}</ValidationMessage>
          ))}
        </div>
      )}

      {/* The editor */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setDirty(true); setSuccess(undefined); }}
          spellCheck={false}
          className="w-full rounded-xl border border-[color:var(--line)] bg-white px-5 py-4 font-mono text-sm text-[color:var(--foreground)] leading-relaxed focus:outline-none focus:border-[color:var(--brand)] focus:shadow-[0_0_0_3px_rgba(15,93,86,0.08)] transition-all resize-none"
          style={{ minHeight: "520px" }}
          placeholder="Paste or type source blocks here..."
        />
      </div>

      {/* Feedback */}
      {error && <ValidationMessage type="error">{error}</ValidationMessage>}
      {warnings.length > 0 && (
        <ValidationMessage type="warning">
          <p className="font-medium mb-1">Warnings (sources still saved):</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </ValidationMessage>
      )}
      {success && <ValidationMessage type="success">{success}</ValidationMessage>}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => void handleSave()}
          disabled={saving || liveErrors.length > 0}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <AppIcon name="check" className="h-4 w-4" />
              Save sources
            </span>
          )}
        </Button>
        <Button variant="secondary" onClick={handleReset} disabled={saving}>
          Reset to defaults
        </Button>
      </div>

      {/* Per-source preview */}
      {liveBlocks.length > 0 && liveErrors.length === 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">Preview</p>
          {liveBlocks.map((b, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-soft)] text-[color:var(--brand)] text-xs font-bold mt-0.5">
                {b.source.priority}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{b.source.name}</p>
                <p className="text-xs text-[color:var(--muted)] truncate">{b.source.url}</p>
                <p className="text-xs text-[color:var(--muted)] mt-0.5">
                  {b.source.refreshFrequency} · {b.source.allowlisted ? "Allowlisted" : "Not allowlisted"} · {b.source.status}
                </p>
              </div>
              {b.warnings.length > 0 && (
                <span className="shrink-0 text-amber-500 text-xs">{b.warnings.length} warning{b.warnings.length > 1 ? "s" : ""}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
