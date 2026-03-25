import type { FeedbackRecord, FeedbackRequest } from "@/lib/domain/models/chat";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import type { ReviewRepository } from "@/lib/repositories/interfaces/review-repository";

async function notImplemented<T>(): Promise<T> {
  throw new Error(
    "Supabase review repository is not implemented. Use local adapters for now."
  );
}

export class SupabaseReviewRepository implements ReviewRepository {
  async listQueue(): Promise<ReviewQueueItem[]> {
    return notImplemented<ReviewQueueItem[]>();
  }

  async enqueue(_item: ReviewQueueItem): Promise<ReviewQueueItem> {
    return notImplemented<ReviewQueueItem>();
  }

  async saveFeedback(_request: FeedbackRequest): Promise<FeedbackRecord> {
    return notImplemented<FeedbackRecord>();
  }
}
