import type { LlmGenerationInput, LlmGenerationResult, LlmProvider } from "@/lib/providers/interfaces/llm-provider";

function getProviderOrder() {
  return (process.env.LLM_PROVIDER_ORDER ?? "mistral,nvidia,compatible,local")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export class LlmProviderRouter {
  constructor(private readonly providers: LlmProvider[]) {}

  async generate(input: LlmGenerationInput): Promise<LlmGenerationResult> {
    // If a preferred provider is specified, move it to the front
    let order = getProviderOrder();
    if (input.preferredProvider) {
      order = [input.preferredProvider, ...order.filter((p) => p !== input.preferredProvider)];
    }

    const orderedProviders = order
      .map((family) => this.providers.find((provider) => provider.family === family))
      .filter((provider): provider is LlmProvider => Boolean(provider));

    for (const provider of orderedProviders) {
      if (!provider.isConfigured() && provider.family !== "local") {
        continue;
      }

      try {
        return await provider.generateAnswer(input);
      } catch (error) {
        if (provider.family === "local") {
          throw error;
        }
      }
    }

    const fallback = this.providers.find((provider) => provider.family === "local");
    if (!fallback) {
      throw new Error("No LLM fallback provider is registered.");
    }

    return fallback.generateAnswer(input);
  }
}
