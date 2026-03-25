import type { ChatAnswer, ChatRequest } from "@/lib/domain/models/chat";

export interface AnswerService {
  answer(request: ChatRequest): Promise<ChatAnswer>;
}

