import type { MonitorService } from "@/lib/services/interfaces/monitor-service";
import type { MonitoringService } from "@/lib/services/interfaces/monitoring-service";

export class LocalMonitoringService implements MonitoringService {
  constructor(private readonly monitorService: MonitorService) {}

  async listRuns() {
    return this.monitorService.listRuns();
  }

  async runNow() {
    return this.monitorService.runNow("manual");
  }

  async getDigest() {
    return this.monitorService.getDigest();
  }
}

