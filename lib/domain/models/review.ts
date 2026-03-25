import type { ReviewVerdict } from "@/lib/domain/enums/status";
import type { AuditFields, ID } from "@/lib/domain/types/common";

export interface ReviewQueueItem extends AuditFields {
  id: ID;
  question: string;
  answerPreview: string;
  verdict: ReviewVerdict;
  reviewer: string;
  priority: "high" | "medium" | "low";
  issueTags: string[];
}

