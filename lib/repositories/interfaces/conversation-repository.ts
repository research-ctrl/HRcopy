import type { ChatMessage, ChatThread } from "@/lib/domain/models/chat";

export interface ConversationRepository {
  listThreads(): Promise<ChatThread[]>;
  getThreadById(id: string): Promise<ChatThread | null>;
  saveThread(thread: ChatThread): Promise<ChatThread>;
  createThread(title: string, initialMessage: ChatMessage): Promise<ChatThread>;
}
