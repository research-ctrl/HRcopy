import type { AppSettings } from "@/lib/domain/models/settings";
import { getSupabaseClient } from "@/lib/database/supabase";
import type { SettingsRepository } from "@/lib/repositories/interfaces/settings-repository";

const DEFAULT_SETTINGS: AppSettings = {
  defaultJurisdiction: "PT",
  defaultLanguage: "pt-PT",
  mockMode: false,
  providerRouting: [],
  reviewThreshold: 0.6,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class SupabaseSettingsRepository implements SettingsRepository {
  private get db() {
    return getSupabaseClient();
  }

  async getSettings(): Promise<AppSettings> {
    const { data, error } = await this.db
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      defaultJurisdiction: "PT",
      defaultLanguage: (data.default_language as AppSettings["defaultLanguage"]) ?? "pt-PT",
      mockMode: Boolean(data.mock_mode),
      providerRouting: (data.provider_routing as AppSettings["providerRouting"]) ?? [],
      reviewThreshold: Number(data.review_threshold ?? 0.6),
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    const now = new Date().toISOString();
    const { error } = await this.db.from("app_settings").upsert({
      id: 1,
      default_jurisdiction: settings.defaultJurisdiction,
      default_language: settings.defaultLanguage,
      mock_mode: settings.mockMode,
      provider_routing: settings.providerRouting,
      review_threshold: settings.reviewThreshold,
      updated_at: now,
    });

    if (error) throw new Error(`Supabase saveSettings: ${error.message}`);
    return { ...settings, updatedAt: now };
  }
}
