import type { AuditFields, ProviderFamily } from "@/lib/domain/types/common";

export interface AppSettings extends AuditFields {
  defaultJurisdiction: "PT";
  defaultLanguage: "pt-PT";
  mockMode: boolean;
  providerRouting: Array<{
    purpose: "chat" | "embeddings" | "ocr";
    primary: ProviderFamily | "local";
    fallback: ProviderFamily | "local";
  }>;
  reviewThreshold: number;
}

