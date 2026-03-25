"use client";

import { useEffect, useState, useTransition } from "react";
import { ChatCitationPanel } from "@/components/chat/chat-citation-panel";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageCard } from "@/components/chat/chat-message";
import { ChatThreadList } from "@/components/chat/chat-thread-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { apiRequest } from "@/lib/client/api";
import type { ChatAnswer, ChatMessage, ChatThread } from "@/lib/domain/models/chat";

export function ChatWorkspace() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>();
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string>();
  const [error, setError] = useState<string>();
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [submitting, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadThreads() {
      try {
        const data = await apiRequest<ChatThread[]>("/api/chat");
        if (cancelled) return;
        setThreads(data);
        const first = data[0];
        if (first) {
          setActiveThreadId(first.id);
          setActiveThread(first);
          const latestAssistant = [...first.messages].reverse().find((message) => message.role === "assistant");
          setSelectedMessageId(latestAssistant?.id);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load chat threads.");
        }
      } finally {
        if (!cancelled) {
          setLoadingThreads(false);
        }
      }
    }

    void loadThreads();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadThread(threadId: string) {
    const thread = await apiRequest<ChatThread>(`/api/chat?threadId=${encodeURIComponent(threadId)}`);
    setActiveThreadId(thread.id);
    setActiveThread(thread);
    const latestAssistant = [...thread.messages].reverse().find((message) => message.role === "assistant");
    setSelectedMessageId(latestAssistant?.id);
  }

  async function handleSubmit(question: string) {
    setError(undefined);

    const optimisticUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (activeThread) {
      setActiveThread({
        ...activeThread,
        messages: [...activeThread.messages, optimisticUserMessage],
      });
    }

    startTransition(() => {
      void (async () => {
        try {
          const answer = await apiRequest<ChatAnswer>("/api/chat", {
            method: "POST",
            body: JSON.stringify({
              question,
              threadId: activeThreadId,
              topK: 5,
            }),
          });

          await loadThread(answer.threadId);
          const updatedThreads = await apiRequest<ChatThread[]>("/api/chat");
          setThreads(updatedThreads);
        } catch (caughtError) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to generate an answer.");
        }
      })();
    });
  }

  const selectedMessage =
    activeThread?.messages.find((message) => message.id === selectedMessageId) ??
    [...(activeThread?.messages ?? [])].reverse().find((message) => message.role === "assistant");

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1.6fr)_360px]">
      <div className="space-y-6">
        <SectionCard title="Conversations" description="Recent questions and answer history.">
          {loadingThreads ? (
            <LoadingState label="Loading conversations" />
          ) : (
            <ChatThreadList threads={threads} activeThreadId={activeThreadId} onSelect={(threadId) => void loadThread(threadId)} />
          )}
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title={activeThread?.title ?? "Start a new conversation"}
          eyebrow="Assistant Workspace"
          description="Ask questions against approved HR and legal sources. Each answer includes citations, confidence, and QC output."
        >
          {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          {!activeThread?.messages.length ? (
            <EmptyState
              title="No conversation yet"
              description="Use the composer below to ask a question. The assistant will only cite approved documents and approved active allowlisted sources."
            />
          ) : (
            <div className="space-y-4">
              {activeThread.messages.map((message) => (
                <ChatMessageCard
                  key={message.id}
                  message={message}
                  selected={message.id === selectedMessageId}
                  onSelect={message.role === "assistant" ? () => setSelectedMessageId(message.id) : undefined}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <ChatComposer onSubmit={handleSubmit} loading={submitting} />
      </div>

      <ChatCitationPanel message={selectedMessage} />
    </div>
  );
}
