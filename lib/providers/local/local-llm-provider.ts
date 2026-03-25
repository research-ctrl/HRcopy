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
          "Modo local: nao foram encontrados materiais aprovados para responder com seguranca. Nao use esta resposta para decisao juridica sem adicionar documentos aprovados ou fontes autorizadas.",
        provider: this.family,
        mode: "development" as const,
        notice: "Nao foram usadas chaves externas e nao existia evidencia aprovada suficiente para fundamentar a resposta.",
      };
    }

    const summary = evidence
      .map((entry) => trimSentence(entry.chunk.text).slice(0, 220))
      .join(" ");

    return {
      content:
        `Modo local: com base apenas no material aprovado recuperado, ${summary}. ` +
        "Esta resposta continua a precisar de revisao humana antes de uso operacional.",
      provider: this.family,
      mode: "development" as const,
      notice: "Os fornecedores externos nao estavam disponiveis, por isso foi gerada uma resposta local baseada apenas nos excertos aprovados.",
    };
  }
}
