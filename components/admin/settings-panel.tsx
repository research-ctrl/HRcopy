"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { AppSettings } from "@/lib/domain/models/settings";

interface SettingsResponse {
  settings: AppSettings;
  environment: {
    localMode: boolean;
    supabaseConfigured: boolean;
    providers: { nvidia: boolean; mistral: boolean; compatible: boolean };
    features: { translation: boolean; ocr: boolean };
  };
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-[color:var(--foreground)]">{title}</h2>
      <p className="mt-0.5 text-sm text-[color:var(--muted)]">{description}</p>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <div className="text-sm font-medium text-[color:var(--foreground)]">{children}</div>
    </div>
  );
}

export function SettingsPanel() {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [reviewThreshold, setReviewThreshold] = useState("0.6");
  const [defaultLanguage, setDefaultLanguage] = useState<"pt-PT" | "en-GB">("pt-PT");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    void apiRequest<SettingsResponse>("/api/settings").then((res) => {
      setData(res);
      setReviewThreshold(String(res.settings.reviewThreshold));
      setDefaultLanguage(res.settings.defaultLanguage as "pt-PT" | "en-GB");
    });
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaveError(undefined);
    setSaveSuccess(false);
    try {
      const threshold = parseFloat(reviewThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        setSaveError("Review threshold must be a number between 0 and 1.");
        return;
      }
      const result = await apiRequest<SettingsResponse>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          reviewThreshold: threshold,
          defaultLanguage,
        }),
      });
      setData(result);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <LoadingState label="Loading settings" />;

  const configuredProviders = Object.entries(data.environment.providers)
    .filter(([, v]) => v)
    .map(([name]) => name);

  return (
    <div className="space-y-6 max-w-2xl">

      {/* System status */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <SectionHeader
          title="System status"
          description="Current runtime mode and connected services."
        />
        <div className="space-y-2">
          <div className="rounded-xl bg-[color:var(--brand)] px-5 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Mode</p>
            <p className="mt-2 text-base font-semibold">
              {data.environment.localMode ? "Local file storage (JSON)" : "External mode"}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Data saved to <code className="font-mono text-xs">data/db/*.json</code> on the server.
              {" "}Not suitable for serverless deployment — use Supabase for production.
            </p>
          </div>
          <InfoRow label="Supabase">
            <StatusBadge value={data.environment.supabaseConfigured ? "approved" : "pending"} />
          </InfoRow>
          <InfoRow label="OCR (image scanning)">
            <StatusBadge value={data.environment.features.ocr ? "active" : "inactive"} />
          </InfoRow>
          <InfoRow label="Translation">
            <StatusBadge value={data.environment.features.translation ? "active" : "inactive"} />
          </InfoRow>
          <InfoRow label="AI providers configured">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              {configuredProviders.length > 0 ? configuredProviders.join(", ") : "None — using local demo"}
            </span>
          </InfoRow>
        </div>
      </div>

      {/* Editable settings */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <SectionHeader
          title="Assistant behaviour"
          description="Adjust how the assistant responds and when it escalates for human review."
        />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5">
              Default language
            </label>
            <div className="flex gap-2">
              {(["pt-PT", "en-GB"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setDefaultLanguage(lang)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    defaultLanguage === lang
                      ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
                      : "border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  {lang === "pt-PT" ? "Portuguese (PT)" : "English (UK)"}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-[color:var(--muted)]">
              The assistant responds in this language by default. Users can override per-session in the chat header.
            </p>
          </div>

          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-[color:var(--foreground)] mb-1.5">
              Review threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                id="threshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(e.target.value)}
                className="w-28 rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-sm text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--brand)] focus:shadow-[0_0_0_3px_rgba(15,93,86,0.08)] transition-all"
              />
              <span className="text-sm text-[color:var(--muted)]">0 = never escalate · 1 = always escalate</span>
            </div>
            <p className="mt-1.5 text-xs text-[color:var(--muted)]">
              Answers with a grounding score below this value are added to the review queue.
              Recommended: 0.5–0.7.
            </p>
          </div>
        </div>

        {/* Feedback */}
        {saveError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{saveError}</div>
        )}
        {saveSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <AppIcon name="check" className="h-4 w-4 text-emerald-600" />
            Settings saved successfully.
          </div>
        )}

        <div className="mt-5">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>

      {/* Provider routing (read-only info) */}
      <div className="rounded-2xl border border-[color:var(--line)] bg-white p-5">
        <SectionHeader
          title="AI provider routing"
          description="Which providers handle each task. Add API keys to .env.local to enable external models."
        />
        <div className="space-y-2">
          {data.settings.providerRouting.map((route) => (
            <div
              key={route.purpose}
              className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium capitalize text-[color:var(--foreground)]">{route.purpose}</p>
                <StatusBadge value={route.primary === "local" ? "active" : "approved"} />
              </div>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Primary: <strong>{route.primary}</strong> · Fallback: {route.fallback}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[color:var(--muted)] leading-relaxed">
          To change routing, set <code className="font-mono bg-[color:var(--background)] px-1 py-0.5 rounded text-[11px]">LLM_PROVIDER_ORDER</code> and{" "}
          <code className="font-mono bg-[color:var(--background)] px-1 py-0.5 rounded text-[11px]">EMBEDDING_PROVIDER_ORDER</code> in{" "}
          <code className="font-mono bg-[color:var(--background)] px-1 py-0.5 rounded text-[11px]">.env.local</code>.
          Add API keys for Mistral, NVIDIA NIM, or any OpenAI-compatible provider.
        </p>
      </div>

    </div>
  );
}
