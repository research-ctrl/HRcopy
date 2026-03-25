import type { ChatAnswer, ChatRequest, FeedbackRequest } from "@/lib/domain/models/chat";

export interface ChatService {
  answer(request: ChatRequest): Promise<ChatAnswer>;
  saveFeedback(request: FeedbackRequest): Promise<{ ok: true }>;
}
