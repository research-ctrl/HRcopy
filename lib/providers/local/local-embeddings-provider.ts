import type { EmbeddingsProvider } from "@/lib/providers/interfaces/embeddings-provider";
import { normalizeText, tokenize } from "@/lib/utils/text";

const DIMENSIONS = 64;

function hashToken(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizeVector(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(8)));
}

export class LocalEmbeddingsProvider implements EmbeddingsProvider {
  readonly family = "local" as const;
  readonly name = "local-deterministic-embeddings";

  isConfigured() {
    return true;
  }

  async healthCheck() {
    return "healthy" as const;
  }

  async embedText(input: string) {
    const normalized = normalizeText(input);
    const tokens = tokenize(normalized);
    const vector = Array.from({ length: DIMENSIONS }, () => 0);

    for (const token of tokens) {
      const hash = hashToken(token);
      const index = hash % DIMENSIONS;
      const weight = 1 + Math.min(token.length / 12, 1);
      vector[index] += weight;
    }

    if (!tokens.length) {
      vector[0] = 1;
    }

    return normalizeVector(vector);
  }

  async embedMany(inputs: string[]) {
    return Promise.all(inputs.map((input) => this.embedText(input)));
  }
}

