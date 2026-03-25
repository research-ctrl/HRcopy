import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const [snapshot, documents, runs, reviews] = await Promise.all([
    localContainer.services.dashboardService.getSnapshot(),
    localContainer.services.documentService.list(),
    localContainer.services.monitoringService.listRuns(),
    localContainer.repositories.reviewRepository.listQueue(),
  ]);

  const checks = await Promise.all([
    ...localContainer.providers.llmProviders.map(async (provider) => ({
      name: provider.name,
      family: provider.family,
      health: await provider.healthCheck(),
      configured: provider.isConfigured(),
    })),
    ...localContainer.providers.embeddingProviders.map(async (provider) => ({
      name: provider.name,
      family: provider.family,
      health: await provider.healthCheck(),
      configured: provider.isConfigured(),
    })),
  ]);

  return NextResponse.json({
    snapshot,
    recentUploads: documents.slice(0, 5),
    recentRuns: runs.slice(0, 5),
    pendingReviews: reviews.slice(0, 5),
    systemHealth: checks,
  });
}
