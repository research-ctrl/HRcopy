import type { DashboardSnapshot } from "@/lib/domain/models/dashboard";
import type { AppSettings } from "@/lib/domain/models/settings";

export interface DashboardService {
  getSnapshot(): Promise<DashboardSnapshot>;
  getSettings(): Promise<AppSettings>;
}

