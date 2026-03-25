"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { AppSettings } from "@/lib/domain/models/settings";

interface SettingsResponse {
  settings: AppSettings;
  environment: {
    localMode: boolean;
    supabaseConfigured: boolean;
    providers: {
      nvidia: boolean;
      mistral: boolean;
      compatible: boolean;
    };
  };
}

export function SettingsPanel() {
  const [data, setData] = useState<SettingsResponse | null>(null);

  useEffect(() => {
    void apiRequest<SettingsResponse>("/api/settings").then(setData);
  }, []);

  if (!data) {
    return <LoadingState label="Loading settings" />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SectionCard title="Environment status" description="Current runtime posture in local mode.">
        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Mode</dt>
            <dd><StatusBadge value={data.environment.localMode ? "active" : "inactive"} /></dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Supabase wiring</dt>
            <dd><StatusBadge value={data.environment.supabaseConfigured ? "approved" : "draft"} /></dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Default jurisdiction</dt>
            <dd className="font-medium text-slate-900">{data.settings.defaultJurisdiction}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Default language</dt>
            <dd className="font-medium text-slate-900">{data.settings.defaultLanguage}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Review threshold</dt>
            <dd className="font-medium text-slate-900">{data.settings.reviewThreshold}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Provider configuration" description="Configured providers fall back safely to local development mode when keys are absent.">
        <div className="space-y-3">
          {Object.entries(data.environment.providers).map(([key, configured]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium capitalize text-slate-900">{key}</p>
                <StatusBadge value={configured ? "approved" : "draft"} />
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
            External provider keys are optional. If absent, the assistant returns a clearly marked development answer based only on retrieved approved material.
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Routing policy" description="Future provider selection remains driven by typed runtime config.">
        <div className="space-y-3">
          {data.settings.providerRouting.map((route) => (
            <div key={route.purpose} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
              <p className="font-medium text-slate-900">{route.purpose}</p>
              <p className="mt-2 text-slate-600">Primary: {route.primary} • Fallback: {route.fallback}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Future Supabase wiring" description="Placeholder guidance for external persistence rollout.">
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">Add Supabase repositories behind the existing interfaces.</div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">Swap local storage provider for Supabase storage.</div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4">Preserve document, chunk, citation, QC, and audit metadata during migration.</div>
        </div>
      </SectionCard>
    </div>
  );
}
