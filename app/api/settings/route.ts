import { NextResponse } from "next/server";
import type { AppSettings } from "@/lib/domain/models/settings";
import { isSupabaseConfigured } from "@/lib/database/supabase";
import { localContainer } from "@/lib/services/shared/local-service-container";

function buildEnvironment() {
  const supabaseActive = isSupabaseConfigured();
  return {
    localMode: !supabaseActive,
    supabaseConfigured: supabaseActive,
    providers: {
      nvidia: Boolean(process.env.NVIDIA_API_KEY),
      mistral: Boolean(process.env.MISTRAL_API_KEY),
      compatible: Boolean(process.env.COMPATIBLE_API_KEY && process.env.COMPATIBLE_API_BASE_URL),
    },
    features: {
      translation: localContainer.providers.translationProvider.isConfigured(),
      ocr: localContainer.providers.ocrProvider.isConfigured(),
    },
  };
}

export async function GET() {
  const settings = await localContainer.repositories.settingsRepository.getSettings();
  return NextResponse.json({ settings, environment: buildEnvironment() });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<AppSettings>;
  const existing = await localContainer.repositories.settingsRepository.getSettings();
  const merged: AppSettings = {
    ...existing,
    ...body,
    // Ensure nested arrays are fully replaced, not partially merged
    providerRouting: body.providerRouting ?? existing.providerRouting,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const saved = await localContainer.repositories.settingsRepository.saveSettings(merged);
  return NextResponse.json({ settings: saved, environment: buildEnvironment() });
}
