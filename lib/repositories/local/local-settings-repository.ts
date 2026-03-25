import type { AppSettings } from "@/lib/domain/models/settings";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedSettings } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import type { SettingsRepository } from "@/lib/repositories/interfaces/settings-repository";

export class LocalSettingsRepository implements SettingsRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).settings;
  }

  async getSettings() {
    return readJsonFile<AppSettings>(this.filePath, seedSettings);
  }

  async saveSettings(settings: AppSettings) {
    await writeJsonFile(this.filePath, settings);
    return settings;
  }
}

