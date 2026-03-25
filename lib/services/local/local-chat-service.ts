import type { ChatRequest, FeedbackRequest } from "@/lib/domain/models/chat";
import type { ReviewRepository } from "@/lib/repositories/interfaces/review-repository";
import type { AnswerService } from "@/lib/services/interfaces/answer-service";
import type { ChatService } from "@/lib/services/interfaces/chat-service";

export class LocalChatService implements ChatService {
  constructor(
    private readonly answerService: AnswerService,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async answer(request: ChatRequest) {
    return this.answerService.answer(request);
  }

  async saveFeedback(request: FeedbackRequest) {
    await this.reviewRepository.saveFeedback(request);
    return { ok: true as const };
  }
}

