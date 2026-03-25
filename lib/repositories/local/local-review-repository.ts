import type { FeedbackRecord, FeedbackRequest } from "@/lib/domain/models/chat";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedFeedback, seedReviews } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import { createId } from "@/lib/utils/id";
import type { ReviewRepository } from "@/lib/repositories/interfaces/review-repository";

export class LocalReviewRepository implements ReviewRepository {
  constructor(private readonly root?: string) {}

  private get reviewPath() {
    return getDbFilePaths(this.root).reviews;
  }

  private get feedbackPath() {
    return getDbFilePaths(this.root).feedback;
  }

  async listQueue() {
    return readJsonFile<ReviewQueueItem[]>(this.reviewPath, seedReviews);
  }

  async enqueue(item: ReviewQueueItem) {
    const queue = await this.listQueue();
    queue.unshift(item);
    await writeJsonFile(this.reviewPath, queue);
    return item;
  }

  async saveFeedback(request: FeedbackRequest) {
    const records = await readJsonFile<FeedbackRecord[]>(this.feedbackPath, seedFeedback);
    const now = new Date().toISOString();
    const created: FeedbackRecord = {
      id: createId("fb"),
      ...request,
      createdAt: now,
      updatedAt: now,
    };

    records.unshift(created);
    await writeJsonFile(this.feedbackPath, records);
    return created;
  }
}

