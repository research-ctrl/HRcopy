import type { LlmGenerationInput, LlmProvider } from "@/lib/providers/interfaces/llm-provider";

function trimSentence(value: string) {
  return value.replace(/\s+/g, " ").trim().replace(/[.]\s*$/, "");
}

export class LocalLlmProvider implements LlmProvider {
  readonly family = "local" as const;
  readonly name = "local-development-llm";

  isConfigured() {
    return true;
  }

  async healthCheck() {
    return "healthy" as const;
  }

  async generateAnswer(input: LlmGenerationInput) {
    const evidence = input.retrievedChunks.slice(0, 3);

    if (!evidence.length) {
      return {
        content:
          "Development fallback: no approved local materials were retrieved for this question. Do not rely on this response for legal action without adding approved documents or active allowlisted sources.",
        provider: this.family,
        mode: "development" as const,
        notice: "No external provider keys were used. No approved retrieval evidence was available.",
      };
    }

    const summary = evidence
      .map((entry) => trimSentence(entry.chunk.text).slice(0, 220))
      .join(" ");

    return {
      content:
        `Development fallback: external provider keys are missing or unavailable. Based only on approved retrieved material, ${summary}. ` +
        "This answer is for local development and should still be reviewed before operational use.",
      provider: this.family,
      mode: "development" as const,
      notice: "External providers were unavailable, so a safe local development answer was generated from retrieved chunks only.",
    };
  }
}

