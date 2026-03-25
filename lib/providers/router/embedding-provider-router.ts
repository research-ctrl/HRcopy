import type { EmbeddingsProvider } from "@/lib/providers/interfaces/embeddings-provider";

function getProviderOrder() {
  return (process.env.EMBEDDING_PROVIDER_ORDER ?? "nvidia,mistral,compatible,local")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export class EmbeddingProviderRouter {
  constructor(private readonly providers: EmbeddingsProvider[]) {}

  async embedText(input: string) {
    const orderedProviders = getProviderOrder()
      .map((family) => this.providers.find((provider) => provider.family === family))
      .filter((provider): provider is EmbeddingsProvider => Boolean(provider));

    for (const provider of orderedProviders) {
      if (!provider.isConfigured() && provider.family !== "local") {
        continue;
      }

      try {
        return await provider.embedText(input);
      } catch (error) {
        if (provider.family === "local") {
          throw error;
        }
      }
    }

    const fallback = this.providers.find((provider) => provider.family === "local");
    if (!fallback) {
      throw new Error("No embeddings fallback provider is registered.");
    }

    return fallback.embedText(input);
  }

  async embedMany(inputs: string[]) {
    return Promise.all(inputs.map((input) => this.embedText(input)));
  }
}
