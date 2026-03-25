import type { ChatMessage, ChatThread } from "@/lib/domain/models/chat";
import { getSupabaseClient } from "@/lib/database/supabase";
import { createId } from "@/lib/utils/id";
import type { ConversationRepository } from "@/lib/repositories/interfaces/conversation-repository";

function rowToThread(thread: Record<string, unknown>, messages: Record<string, unknown>[]): ChatThread {
  return {
    id: thread.id as string,
    title: thread.title as string,
    provider: (thread.provider as ChatThread["provider"]) ?? "local",
    citations: [],
    messages: messages.map((m) => ({
      id: m.id as string,
      role: m.role as ChatMessage["role"],
      content: m.content as string,
      citations: (m.citations as ChatMessage["citations"]) ?? [],
      confidence: m.confidence as number | undefined,
      qc: m.qc as ChatMessage["qc"],
      notice: m.notice as string | undefined,
      createdAt: m.created_at as string,
      updatedAt: m.updated_at as string,
    })),
    createdAt: thread.created_at as string,
    updatedAt: thread.updated_at as string,
  };
}

export class SupabaseConversationRepository implements ConversationRepository {
  private get db() {
    return getSupabaseClient();
  }

  async listThreads(): Promise<ChatThread[]> {
    const { data: threads, error } = await this.db
      .from("chat_threads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Supabase listThreads: ${error.message}`);
    if (!threads?.length) return [];

    const threadIds = threads.map((t) => t.id as string);
    const { data: messages, error: msgErr } = await this.db
      .from("chat_messages")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: true });

    if (msgErr) throw new Error(`Supabase listMessages: ${msgErr.message}`);

    return threads.map((t) =>
      rowToThread(
        t,
        (messages ?? []).filter((m) => m.thread_id === t.id),
      ),
    );
  }

  async getThreadById(id: string): Promise<ChatThread | null> {
    const { data: thread, error } = await this.db
      .from("chat_threads")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !thread) return null;

    const { data: messages } = await this.db
      .from("chat_messages")
      .select("*")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });

    return rowToThread(thread, messages ?? []);
  }

  async saveThread(thread: ChatThread): Promise<ChatThread> {
    const now = new Date().toISOString();

    // Upsert thread row
    const { error: threadErr } = await this.db.from("chat_threads").upsert({
      id: thread.id,
      title: thread.title,
      provider: thread.provider,
      created_at: thread.createdAt,
      updated_at: now,
    });
    if (threadErr) throw new Error(`Supabase saveThread: ${threadErr.message}`);

    // Upsert each message
    if (thread.messages.length > 0) {
      const rows = thread.messages.map((m) => ({
        id: m.id,
        thread_id: thread.id,
        role: m.role,
        content: m.content,
        citations: m.citations ?? [],
        confidence: m.confidence ?? null,
        qc: m.qc ?? null,
        notice: m.notice ?? null,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
      }));
      const { error: msgErr } = await this.db.from("chat_messages").upsert(rows);
      if (msgErr) throw new Error(`Supabase saveMessages: ${msgErr.message}`);
    }

    return thread;
  }

  async createThread(title: string, initialMessage: ChatMessage): Promise<ChatThread> {
    const thread: ChatThread = {
      id: createId("thread"),
      title,
      provider: "local",
      citations: [],
      messages: [initialMessage],
      createdAt: initialMessage.createdAt,
      updatedAt: initialMessage.updatedAt,
    };
    return this.saveThread(thread);
  }

  async deleteThread(id: string): Promise<void> {
    const { error } = await this.db.from("chat_threads").delete().eq("id", id);
    if (error) throw new Error(`Supabase deleteThread: ${error.message}`);
  }
}
