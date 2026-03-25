import type { TranslationLanguage, TranslationResult } from "@/lib/domain/models/translation";
import type { TranslationProvider } from "@/lib/providers/interfaces/translation-provider";

type ReplacementRule = {
  pattern: RegExp;
  replacement: string;
};

const EN_TO_PT: Array<[string, string]> = [
  ["probationary contract", "contrato em periodo experimental"],
  ["probation period", "periodo experimental"],
  ["fixed-term contract", "contrato a termo"],
  ["employment contract", "contrato de trabalho"],
  ["leave request", "pedido de licenca"],
  ["line manager", "chefia direta"],
  ["evidence trail", "registo de prova"],
  ["notice period", "prazo de aviso"],
  ["disciplinary process", "processo disciplinar"],
  ["working time", "tempo de trabalho"],
  ["termination", "cessacao"],
  ["dismissal", "despedimento"],
  ["renewal", "renovacao"],
  ["employee", "trabalhador"],
  ["employees", "trabalhadores"],
  ["manager", "gestor"],
  ["managers", "gestores"],
  ["policy", "politica"],
  ["documents", "documentos"],
  ["source", "fonte"],
  ["sources", "fontes"],
  ["review", "revisao"],
  ["approved", "aprovado"],
  ["pending", "pendente"],
  ["rejected", "rejeitado"],
  ["question", "pergunta"],
  ["answer", "resposta"],
  ["must", "deve"],
  ["should", "deve"],
  ["before", "antes de"],
  ["after", "depois de"],
  ["because", "porque"],
  ["without", "sem"],
  ["with", "com"],
  ["and", "e"],
  ["or", "ou"],
  ["for", "para"],
  ["the", "o"],
];

const PT_TO_EN: Array<[string, string]> = [
  ["periodo experimental", "probation period"],
  ["contrato em periodo experimental", "probationary contract"],
  ["contrato a termo", "fixed-term contract"],
  ["contrato de trabalho", "employment contract"],
  ["pedido de licenca", "leave request"],
  ["chefia direta", "line manager"],
  ["registo de prova", "evidence trail"],
  ["prazo de aviso", "notice period"],
  ["processo disciplinar", "disciplinary process"],
  ["tempo de trabalho", "working time"],
  ["cessacao", "termination"],
  ["despedimento", "dismissal"],
  ["renovacao", "renewal"],
  ["trabalhador", "employee"],
  ["trabalhadores", "employees"],
  ["gestor", "manager"],
  ["gestores", "managers"],
  ["politica", "policy"],
  ["documentos", "documents"],
  ["fonte", "source"],
  ["fontes", "sources"],
  ["revisao", "review"],
  ["aprovado", "approved"],
  ["pendente", "pending"],
  ["rejeitado", "rejected"],
  ["pergunta", "question"],
  ["resposta", "answer"],
  ["deve", "should"],
  ["antes de", "before"],
  ["depois de", "after"],
  ["porque", "because"],
  ["sem", "without"],
  ["com", "with"],
  [" e ", " and "],
  [" ou ", " or "],
  [" para ", " for "],
];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRules(entries: Array<[string, string]>) {
  return [...entries]
    .sort((left, right) => right[0].length - left[0].length)
    .map<ReplacementRule>(([source, target]) => ({
      pattern: new RegExp(`\\b${escapeRegex(source)}\\b`, "gi"),
      replacement: target,
    }));
}

function trimSpaces(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function normalizeForDetection(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectLanguage(value: string): TranslationLanguage | "auto" {
  const normalized = normalizeForDetection(value);
  const portugueseSignals = [" trabalhador", " desped", " licenca", " revisao", " periodo experimental", " contrato "];
  const englishSignals = [" employee", "dismiss", "leave request", "review", "probation", "contract "];
  const portugueseScore = portugueseSignals.filter((signal) => normalized.includes(signal)).length;
  const englishScore = englishSignals.filter((signal) => normalized.includes(signal)).length;

  if (portugueseScore === englishScore) {
    return "auto";
  }

  return portugueseScore > englishScore ? "pt-PT" : "en-GB";
}

function applyRules(text: string, rules: ReplacementRule[]) {
  let translated = ` ${normalizeForDetection(text)} `;

  for (const rule of rules) {
    translated = translated.replace(rule.pattern, ` ${rule.replacement} `);
  }

  translated = trimSpaces(translated);

  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

export class LocalTranslationProvider implements TranslationProvider {
  readonly family = "local" as const;
  readonly name = "local-glossary-translator";
  private readonly englishToPortugueseRules = buildRules(EN_TO_PT);
  private readonly portugueseToEnglishRules = buildRules(PT_TO_EN);

  isConfigured() {
    return true;
  }

  async healthCheck() {
    return "healthy" as const;
  }

  async translate(input: {
    text: string;
    targetLanguage: TranslationLanguage;
    sourceLanguage?: TranslationLanguage | "auto";
  }): Promise<TranslationResult> {
    const sourceLanguage = input.sourceLanguage && input.sourceLanguage !== "auto" ? input.sourceLanguage : detectLanguage(input.text);

    if (!input.text.trim()) {
      return {
        text: "",
        sourceLanguage,
        targetLanguage: input.targetLanguage,
        provider: this.family,
      };
    }

    if (sourceLanguage !== "auto" && sourceLanguage === input.targetLanguage) {
      return {
        text: input.text.trim(),
        sourceLanguage,
        targetLanguage: input.targetLanguage,
        provider: this.family,
        notice: "The draft is already in the requested language.",
      };
    }

    const text =
      input.targetLanguage === "pt-PT"
        ? applyRules(input.text, this.englishToPortugueseRules)
        : applyRules(input.text, this.portugueseToEnglishRules);

    return {
      text,
      sourceLanguage,
      targetLanguage: input.targetLanguage,
      provider: this.family,
      notice: "Quick glossary translation. Verify legal nuance before using it in production communication.",
    };
  }
}
