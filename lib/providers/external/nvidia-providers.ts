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

export class NvidiaGenerationProvider implements LlmProvider {
  readonly family = "nvidia" as const;
  readonly name = "nvidia-generation";
  private readonly apiKey = process.env.NVIDIA_API_KEY ?? "";
  private readonly client = this.apiKey
    ? new OpenAiCompatibleClient({
        baseUrl: process.env.NVIDIA_API_BASE_URL ?? "https://integrate.api.nvidia.com/v1/",
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
      throw new Error("NVIDIA provider is not configured.");
    }

    const response = await this.client.post<{ choices: Array<{ message: { content: string } }> }>("chat/completions", {
      model: process.env.NVIDIA_CHAT_MODEL ?? "meta/llama-3.1-70b-instruct",
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

export class NvidiaEmbeddingsProvider implements EmbeddingsProvider {
  readonly family = "nvidia" as const;
  readonly name = "nvidia-embeddings";
  private readonly apiKey = process.env.NVIDIA_API_KEY ?? "";
  private readonly client = this.apiKey
    ? new OpenAiCompatibleClient({
        baseUrl: process.env.NVIDIA_API_BASE_URL ?? "https://integrate.api.nvidia.com/v1/",
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
      throw new Error("NVIDIA embeddings provider is not configured.");
    }

    const response = await this.client.post<{ data: Array<{ embedding: number[] }> }>("embeddings", {
      model: process.env.NVIDIA_EMBEDDING_MODEL ?? "nvidia/nv-embedqa-e5-v5",
      input,
    });

    return response.data[0]?.embedding ?? [];
  }
}
