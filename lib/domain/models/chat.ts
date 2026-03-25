import type { FeedbackSignal, QcStatus } from "@/lib/domain/enums/status";
import type { AuditFields, ID, ISODateString, ProviderFamily } from "@/lib/domain/types/common";

export interface ChatSourceCitation {
  id: ID;
  title: string;
  kind: "document" | "web";
  excerpt: string;
  confidence: number;
  formatted: string;
  sectionTitle?: string;
  pageLabel?: string;
  sourceUrl?: string;
}

export interface QcClaimResult {
  claim: string;
  supported: boolean;
  supportingChunkIds: string[];
  score: number;
}

export interface AnswerQcResult {
  status: QcStatus;
  groundedClaims: number;
  totalClaims: number;
  score: number;
  notes: string[];
  claims: QcClaimResult[];
}

export interface ChatMessage extends AuditFields {
  id: ID;
  role: "user" | "assistant";
  content: string;
  citations?: ChatSourceCitation[];
  confidence?: number;
  qc?: AnswerQcResult;
  notice?: string;
}

export interface ChatThread extends AuditFields {
  id: ID;
  title: string;
  provider: ProviderFamily | "local";
  messages: ChatMessage[];
  citations: ChatSourceCitation[];
}

export interface ChatAnswer {
  threadId: ID;
  message: ChatMessage;
  citations: ChatSourceCitation[];
  provider: ProviderFamily | "local";
  qualityLabel: "draft" | "reviewed";
  confidence: number;
  qc: AnswerQcResult;
  developmentNotice?: string;
}

export interface ChatRequest {
  question: string;
  threadId?: ID;
  topK?: number;
}

export interface FeedbackRecord extends AuditFields {
  id: ID;
  threadId: ID;
  messageId: ID;
  signal: FeedbackSignal;
  comment?: string;
}

export interface FeedbackRequest {
  threadId: ID;
  messageId: ID;
  signal: FeedbackSignal;
  comment?: string;
}
