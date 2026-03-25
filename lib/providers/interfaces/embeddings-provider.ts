import type { HealthState, ProviderFamily } from "@/lib/domain/types/common";

export interface EmbeddingsProvider {
  readonly family: ProviderFamily | "local";
  readonly name: string;
  isConfigured(): boolean;
  healthCheck(): Promise<HealthState>;
  embedText(input: string): Promise<number[]>;
  embedMany?(inputs: string[]): Promise<number[][]>;
}
