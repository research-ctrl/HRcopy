import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";
import { isSupabaseConfigured } from "@/lib/database/supabase";

export async function GET() {
  try {
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
      mode: isSupabaseConfigured() ? "supabase" : "local",
      checks: {
        llm: llmHealth,
        embeddings: embeddingHealth,
        storage: providerHealth[0],
        pdf: providerHealth[1],
        ocr: providerHealth[2],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health check failed";
    return NextResponse.json(
      {
        status: "error",
        mode: isSupabaseConfigured() ? "supabase" : "local",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
