import type { RetrievedChunk } from "@/lib/domain/models/retrieval";
import type { HealthState, ProviderFamily } from "@/lib/domain/types/common";

export interface LlmGenerationInput {
  question: string;
  retrievedChunks: RetrievedChunk[];
  systemPrompt: string;
  preferredProvider?: string;
}

export interface LlmGenerationResult {
  content: string;
  provider: ProviderFamily | "local";
  mode: "live" | "development";
  notice?: string;
}

export interface LlmProvider {
  readonly family: ProviderFamily | "local";
  readonly name: string;
  isConfigured(): boolean;
  healthCheck(): Promise<HealthState>;
  generateAnswer(input: LlmGenerationInput): Promise<LlmGenerationResult>;
}
