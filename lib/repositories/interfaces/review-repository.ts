import type { FeedbackRecord, FeedbackRequest } from "@/lib/domain/models/chat";
import type { ReviewQueueItem } from "@/lib/domain/models/review";

export interface ReviewRepository {
  listQueue(): Promise<ReviewQueueItem[]>;
  enqueue(item: ReviewQueueItem): Promise<ReviewQueueItem>;
  saveFeedback(request: FeedbackRequest): Promise<FeedbackRecord>;
}
