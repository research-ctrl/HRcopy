import type { EmbeddingsProvider } from "@/lib/providers/interfaces/embeddings-provider";
import type { LlmGenerationInput, LlmGenerationResult, LlmProvider } from "@/lib/providers/interfaces/llm-provider";
import { OpenAiCompatibleClient } from "@/lib/providers/http/openai-compatible-client";

function buildContext(input: LlmGenerationInput) {
  return input.retrievedChunks
    .map(
      (entry, index) =>
        `[${index + 1}] ${entry.document.title}${entry.chunk.sectionTitle ? ` / ${entry.chunk.sectionTitle}` : ""}: ${entry.chunk.text}`,
    )
    .join("\n\n");
}

export class MistralGenerationProvider implements LlmProvider {
  readonly family = "mistral" as const;
  readonly name = "mistral-generation";
  private readonly apiKey = process.env.MISTRAL_API_KEY ?? "";
  private readonly client = this.apiKey
    ? new OpenAiCompatibleClient({
        baseUrl: process.env.MISTRAL_API_BASE_URL ?? "https://api.mistral.ai/v1/",
        apiKey: this.apiKey,
      })
    : null;

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async healthCheck() {
    return this.isConfigured() ? ("healthy" as const) : ("offline" as const);
  }

  async generateAnswer(input: LlmGenerationInput): Promise<LlmGenerationResult> {
    if (!this.client) {
      throw new Error("Mistral provider is not configured.");
    }

    const response = await this.client.post<{ choices: Array<{ message: { content: string } }> }>("chat/completions", {
      model: process.env.MISTRAL_CHAT_MODEL ?? "mistral-small-latest",
      temperature: 0.2,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: `Question: ${input.question}\n\nRetrieved context:\n${buildContext(input)}` },
      ],
    });

    return {
      content: response.choices[0]?.message?.content ?? "",
      provider: this.family,
      mode: "live",
    };
  }
}

export class MistralEmbeddingsProvider implements EmbeddingsProvider {
  readonly family = "mistral" as const;
  readonly name = "mistral-embeddings";
  private readonly apiKey = process.env.MISTRAL_API_KEY ?? "";
  private readonly client = this.apiKey
    ? new OpenAiCompatibleClient({
        baseUrl: process.env.MISTRAL_API_BASE_URL ?? "https://api.mistral.ai/v1/",
        apiKey: this.apiKey,
      })
    : null;

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async healthCheck() {
    return this.isConfigured() ? ("healthy" as const) : ("offline" as const);
  }

  async embedText(input: string) {
    if (!this.client) {
      throw new Error("Mistral embeddings provider is not configured.");
    }

    const response = await this.client.post<{ data: Array<{ embedding: number[] }> }>("embeddings", {
      model: process.env.MISTRAL_EMBEDDING_MODEL ?? "mistral-embed",
      input,
    });

    return response.data[0]?.embedding ?? [];
  }
}
