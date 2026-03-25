import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const llmHealth = await Promise.all(localContainer.providers.llmProviders.map((provider) => provider.healthCheck()));
  const embeddingHealth = await Promise.all(
    localContainer.providers.embeddingProviders.map((provider) => provider.healthCheck()),
  );
  const providerHealth = await Promise.all([
    localContainer.providers.storageProvider.healthCheck(),
    localContainer.providers.pdfExtractor.healthCheck(),
    localContainer.providers.ocrProvider.healthCheck(),
  ]);

  return NextResponse.json({
    status: "ok",
    mode: "local",
    checks: {
      llm: llmHealth,
      embeddings: embeddingHealth,
      storage: providerHealth[0],
      pdf: providerHealth[1],
      ocr: providerHealth[2],
    },
    timestamp: new Date().toISOString(),
  });
}
