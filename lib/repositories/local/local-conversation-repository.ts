import type { ChatMessage, ChatThread } from "@/lib/domain/models/chat";
import { getDbFilePaths } from "@/lib/persistence/local-db";
import { seedThreads } from "@/lib/persistence/local-seeds";
import { readJsonFile, writeJsonFile } from "@/lib/persistence/json-file-store";
import { createId } from "@/lib/utils/id";
import type { ConversationRepository } from "@/lib/repositories/interfaces/conversation-repository";

export class LocalConversationRepository implements ConversationRepository {
  constructor(private readonly root?: string) {}

  private get filePath() {
    return getDbFilePaths(this.root).threads;
  }

  async listThreads() {
    return readJsonFile<ChatThread[]>(this.filePath, seedThreads);
  }

  async getThreadById(id: string) {
    const threads = await this.listThreads();
    return threads.find((thread) => thread.id === id) ?? null;
  }

  async saveThread(thread: ChatThread) {
    const threads = await this.listThreads();
    const index = threads.findIndex((entry) => entry.id === thread.id);
    if (index === -1) {
      threads.unshift(thread);
    } else {
      threads[index] = thread;
    }
    await writeJsonFile(this.filePath, threads);
    return thread;
  }

  async createThread(title: string, initialMessage: ChatMessage) {
    const thread: ChatThread = {
      id: createId("thread"),
      title,
      provider: "local",
      citations: [],
      messages: [initialMessage],
      createdAt: initialMessage.createdAt,
      updatedAt: initialMessage.updatedAt,
    };

    await this.saveThread(thread);
    return thread;
  }
}

