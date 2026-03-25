import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const [documents, sources, runs, reviews, threads] = await Promise.all([
    localContainer.repositories.documentRepository.list(),
    localContainer.repositories.sourceRepository.list(),
    localContainer.repositories.monitoringRunRepository.listRuns(),
    localContainer.repositories.reviewRepository.listQueue(),
    localContainer.repositories.conversationRepository.listThreads(),
  ]);

  return NextResponse.json({
    mode: "local-seeded",
    counts: {
      documents: documents.length,
      sources: sources.length,
      runs: runs.length,
      reviews: reviews.length,
      threads: threads.length,
    },
  });
}

export async function POST() {
  return GET();
}
