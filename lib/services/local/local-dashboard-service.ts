import type { DashboardService } from "@/lib/services/interfaces/dashboard-service";
import type { DocumentRepository } from "@/lib/repositories/interfaces/document-repository";
import type { ReviewRepository } from "@/lib/repositories/interfaces/review-repository";
import type { SettingsRepository } from "@/lib/repositories/interfaces/settings-repository";
import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";

export class LocalDashboardService implements DashboardService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async getSnapshot() {
    const [documents, sources, reviews] = await Promise.all([
      this.documentRepository.list(),
      this.sourceRepository.list(),
      this.reviewRepository.listQueue(),
    ]);

    const approvedDocuments = documents.filter((document) => document.approvalStatus === "approved").length;
    const allowlistedSources = sources.filter((source) => source.allowlisted && source.status === "active").length;
    const pendingDocuments = documents.filter((document) => document.approvalStatus !== "approved").length;
    const majorSourceAlerts = sources.filter((source) => source.changeSeverity === "major").length;

    return {
      metrics: [
        { label: "Approved documents", value: String(approvedDocuments), delta: `${pendingDocuments} pending review` },
        { label: "Allowlisted sources", value: String(allowlistedSources), delta: `${sources.length - allowlistedSources} inactive or pending` },
        { label: "Monitoring coverage", value: allowlistedSources ? "100%" : "0%", delta: "daily digest local mode" },
        { label: "Answer review queue", value: String(reviews.length), delta: `${reviews.filter((review) => review.priority === "high").length} high priority` },
      ],
      alerts: [
        `${majorSourceAlerts} allowlisted source(s) currently marked with major change severity.`,
        `${pendingDocuments} document(s) are excluded from retrieval until approved.`,
        "Local-mode persistence is active under data/db and data/uploads.",
      ],
    };
  }

  async getSettings() {
    return this.settingsRepository.getSettings();
  }
}
