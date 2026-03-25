import type { ChatAnswer, ChatMessage, ChatRequest } from "@/lib/domain/models/chat";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import { formatCitation } from "@/lib/citations/format-citation";
import type { LlmProviderRouter } from "@/lib/providers/router/llm-provider-router";
import type { ConversationRepository } from "@/lib/repositories/interfaces/conversation-repository";
import type { ReviewRepository } from "@/lib/repositories/interfaces/review-repository";
import type { AnswerService } from "@/lib/services/interfaces/answer-service";
import type { QcService } from "@/lib/services/interfaces/qc-service";
import type { RetrievalService } from "@/lib/services/interfaces/retrieval-service";
import { createId } from "@/lib/utils/id";

export class LocalAnswerService implements AnswerService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly qcService: QcService,
    private readonly llmRouter: LlmProviderRouter,
    private readonly conversationRepository: ConversationRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  private buildSystemPrompt(language: "en-GB" | "pt-PT" = "pt-PT") {
    const langInstruction =
      language === "en-GB"
        ? "Always respond in English."
        : "Always respond in European Portuguese (pt-PT).";

    return [
      "You are an internal HR legal assistant for Portuguese workforce guidance.",
      "Use only retrieved approved material.",
      langInstruction,
      "Be cautious, explicit about uncertainty, and avoid unsupported claims.",
      "Do not invent legal citations.",
    ].join(" ");
  }

  async answer(request: ChatRequest): Promise<ChatAnswer> {
    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content: request.question,
      createdAt: now,
      updatedAt: now,
    };

    const existingThread = request.threadId
      ? await this.conversationRepository.getThreadById(request.threadId)
      : null;
    const thread =
      existingThread ?? (await this.conversationRepository.createThread(request.question.slice(0, 64), userMessage));

    if (existingThread) {
      existingThread.messages.push(userMessage);
      existingThread.updatedAt = now;
      await this.conversationRepository.saveThread(existingThread);
    }

    const retrieved = await this.retrievalService.retrieve(request.question, request.topK ?? 5);
    const citations = retrieved.map((entry) =>
      formatCitation({
        chunk: entry.chunk,
        document: entry.document,
        source: entry.source,
        confidence: entry.score,
      }),
    );

    const generation = await this.llmRouter.generate({
      question: request.question,
      retrievedChunks: retrieved,
      systemPrompt: this.buildSystemPrompt(request.language),
      preferredProvider: request.preferredProvider,
    });

    const qc = await this.qcService.evaluate(generation.content, retrieved);
    const confidence = Number(
      (
        (citations.reduce((sum, citation) => sum + citation.confidence, 0) / (citations.length || 1)) *
        (qc.score || 0.25)
      ).toFixed(3),
    );

    const assistantMessage: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      content: generation.content,
      citations,
      confidence,
      qc,
      notice: generation.notice,
      createdAt: now,
      updatedAt: now,
    };

    const nextThread = {
      ...thread,
      provider: generation.provider,
      citations,
      messages: [...thread.messages, assistantMessage],
      updatedAt: now,
    };

    await this.conversationRepository.saveThread(nextThread);

    if (qc.status !== "pass") {
      const reviewItem: ReviewQueueItem = {
        id: createId("review"),
        question: request.question,
        answerPreview: generation.content.slice(0, 220),
        verdict: qc.status === "fail" ? "flagged" : "needs-edits",
        reviewer: "Unassigned",
        priority: qc.status === "fail" ? "high" : "medium",
        issueTags: ["qc-grounding"],
        createdAt: now,
        updatedAt: now,
      };

      await this.reviewRepository.enqueue(reviewItem);
    }

    return {
      threadId: nextThread.id,
      message: assistantMessage,
      citations,
      provider: generation.provider,
      qualityLabel: qc.status === "pass" ? "reviewed" : "draft",
      confidence,
      qc,
      developmentNotice: generation.notice,
    };
  }
}
