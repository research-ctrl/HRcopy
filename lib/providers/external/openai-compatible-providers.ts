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

export class CompatibleGenerationProvider implements LlmProvider {
  readonly family = "compatible" as const;
  readonly name = "openai-compatible-generation";
  private readonly apiKey = process.env.COMPATIBLE_API_KEY ?? "";
  private readonly baseUrl = process.env.COMPATIBLE_API_BASE_URL ?? "";
  private readonly client =
    this.apiKey && this.baseUrl
      ? new OpenAiCompatibleClient({
          baseUrl: this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`,
          apiKey: this.apiKey,
        })
      : null;

  isConfigured() {
    return Boolean(this.apiKey && this.baseUrl);
  }

  async healthCheck() {
    return this.isConfigured() ? ("healthy" as const) : ("offline" as const);
  }

  async generateAnswer(input: LlmGenerationInput): Promise<LlmGenerationResult> {
    if (!this.client) {
      throw new Error("Compatible generation provider is not configured.");
    }

    const response = await this.client.post<{ choices: Array<{ message: { content: string } }> }>("chat/completions", {
      model: process.env.COMPATIBLE_CHAT_MODEL ?? "gpt-4o-mini",
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

export class CompatibleEmbeddingsProvider implements EmbeddingsProvider {
  readonly family = "compatible" as const;
  readonly name = "openai-compatible-embeddings";
  private readonly apiKey = process.env.COMPATIBLE_API_KEY ?? "";
  private readonly baseUrl = process.env.COMPATIBLE_API_BASE_URL ?? "";
  private readonly client =
    this.apiKey && this.baseUrl
      ? new OpenAiCompatibleClient({
          baseUrl: this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`,
          apiKey: this.apiKey,
        })
      : null;

  isConfigured() {
    return Boolean(this.apiKey && this.baseUrl);
  }

  async healthCheck() {
    return this.isConfigured() ? ("healthy" as const) : ("offline" as const);
  }

  async embedText(input: string) {
    if (!this.client) {
      throw new Error("Compatible embeddings provider is not configured.");
    }

    const response = await this.client.post<{ data: Array<{ embedding: number[] }> }>("embeddings", {
      model: process.env.COMPATIBLE_EMBEDDING_MODEL ?? "text-embedding-3-small",
      input,
    });

    return response.data[0]?.embedding ?? [];
  }
}
