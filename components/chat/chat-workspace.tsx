"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChatCitationPanel } from "@/components/chat/chat-citation-panel";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageCard } from "@/components/chat/chat-message";
import { ChatThreadList } from "@/components/chat/chat-thread-list";
import { ChatToolsPanel } from "@/components/chat/chat-tools-panel";
import { AppIcon } from "@/components/ui/app-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { apiRequest } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import type { ChatAnswer, ChatMessage, ChatRequest, ChatThread } from "@/lib/domain/models/chat";
import type { DocumentIngestionResult, DocumentRecord } from "@/lib/domain/models/document";
import type { AppSettings } from "@/lib/domain/models/settings";
import type { SourceRecord } from "@/lib/domain/models/source";

interface SettingsResponse {
  settings: AppSettings;
  environment: {
    localMode: boolean;
    supabaseConfigured: boolean;
    providers: { nvidia: boolean; mistral: boolean; compatible: boolean };
    features: { translation: boolean; ocr: boolean };
  };
}

type Language = "en-GB" | "pt-PT";
type Provider = "local" | "mistral" | "nvidia" | "compatible";

function latestAssistantMessage(thread: ChatThread | null) {
  return [...(thread?.messages ?? [])].reverse().find((m) => m.role === "assistant");
}

/** Three bouncing dots while the AI is generating */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 py-1">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-soft)]">
        <AppIcon name="spark" className="h-[18px] w-[18px] text-[color:var(--brand)]" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white border border-[color:var(--line)] px-4 py-3.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-[color:var(--muted)] animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function ChatWorkspace() {
  const [mobileView, setMobileView] = useState<"threads" | "chat">("threads");
  const [showTools, setShowTools] = useState(false);
  const [language, setLanguage] = useState<Language>("pt-PT");
  const [provider, setProvider] = useState<Provider>("local");

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>();
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string>();
  const [draft, setDraft] = useState("");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [error, setError] = useState<string>();
  const [attachmentNotice, setAttachmentNotice] = useState<string>();
  const [providerFallbackNotice, setProviderFallbackNotice] = useState<string>();
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [submitting, startSubmitTransition] = useTransition();
  const [attaching, startAttachTransition] = useTransition();
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      const [threadsResult, documentsResult, sourcesResult, settingsResult] = await Promise.allSettled([
        apiRequest<ChatThread[]>("/api/chat"),
        apiRequest<DocumentRecord[]>("/api/documents"),
        apiRequest<SourceRecord[]>("/api/sources"),
        apiRequest<SettingsResponse>("/api/settings"),
      ]);

      if (cancelled) return;

      if (threadsResult.status === "fulfilled") {
        setThreads(threadsResult.value);
        const first = threadsResult.value[0];
        if (first) {
          setActiveThreadId(first.id);
          setActiveThread(first);
          setSelectedMessageId(latestAssistantMessage(first)?.id);
        }
      } else {
        setError(
          threadsResult.reason instanceof Error
            ? threadsResult.reason.message
            : "Unable to load conversations.",
        );
      }

      if (documentsResult.status === "fulfilled") setDocuments(documentsResult.value);
      if (sourcesResult.status === "fulfilled") setSources(sourcesResult.value);
      if (settingsResult.status === "fulfilled") {
        setSettings(settingsResult.value);
        const env = settingsResult.value.environment;
        if (env.providers.mistral) setProvider("mistral");
        else if (env.providers.nvidia) setProvider("nvidia");
        else if (env.providers.compatible) setProvider("compatible");
        else setProvider("local");
      }

      setLoadingThreads(false);
      setLoadingWorkspace(false);
    }

    void loadWorkspace();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el || typeof el.scrollTo !== "function") return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [activeThread?.messages.length, submitting]);

  async function loadThread(threadId: string) {
    try {
      const thread = await apiRequest<ChatThread>(`/api/chat?threadId=${encodeURIComponent(threadId)}`);
      setActiveThreadId(thread.id);
      setActiveThread(thread);
      setSelectedMessageId(latestAssistantMessage(thread)?.id);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the selected conversation.");
    }
  }

  function handleSelectThread(threadId: string) {
    void loadThread(threadId);
    setMobileView("chat");
  }

  function handleStartNewChat() {
    setActiveThreadId(undefined);
    setActiveThread(null);
    setSelectedMessageId(undefined);
    setDraft("");
    setError(undefined);
    setMobileView("chat");
  }

  async function handleDeleteThread(threadId: string) {
    try {
      await apiRequest(`/api/chat?threadId=${encodeURIComponent(threadId)}`, { method: "DELETE" });
      const updated = threads.filter((t) => t.id !== threadId);
      setThreads(updated);
      if (activeThreadId === threadId) {
        setActiveThreadId(undefined);
        setActiveThread(null);
        setSelectedMessageId(undefined);
        setMobileView("threads");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete conversation.");
    }
  }

  async function handleSubmit(question: string) {
    setError(undefined);
    setAttachmentNotice(undefined);

    const now = new Date().toISOString();
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: now,
      updatedAt: now,
    };

    setDraft("");

    if (activeThread) {
      setActiveThread({ ...activeThread, messages: [...activeThread.messages, optimistic], updatedAt: now });
    } else {
      setActiveThread({
        id: `temp-thread-${Date.now()}`,
        title: question.slice(0, 64),
        provider: "local",
        citations: [],
        messages: [optimistic],
        createdAt: now,
        updatedAt: now,
      });
    }

    startSubmitTransition(() => {
      void (async () => {
        try {
          const req: Partial<ChatRequest> = {
            question,
            threadId: activeThreadId,
            topK: 5,
            language,
            preferredProvider: provider,
          };
          const answer = await apiRequest<ChatAnswer>("/api/chat", {
            method: "POST",
            body: JSON.stringify(req),
          });
          // Surface provider fallback
          if (answer.provider && answer.provider !== provider) {
            const labels: Record<string, string> = {
              mistral: "Mistral AI",
              nvidia: "NVIDIA NIM",
              compatible: "Custom API",
              local: "local demo",
            };
            const requested = labels[provider] ?? provider;
            const used = labels[answer.provider] ?? answer.provider;
            setProviderFallbackNotice(`Requested ${requested} — fell back to ${used}.`);
            setProvider(answer.provider as Provider);
          } else {
            setProviderFallbackNotice(undefined);
          }
          await loadThread(answer.threadId);
          const updated = await apiRequest<ChatThread[]>("/api/chat");
          setThreads(updated);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to generate an answer. Please try again.");
        }
      })();
    });
  }

  async function handleAttachFile(file: File) {
    setError(undefined);
    setAttachmentNotice(undefined);

    startAttachTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("category", "case-note");
          formData.append("title", file.name.replace(/\.[^.]+$/, ""));
          formData.append("tags", file.type.startsWith("image/") ? "chat-upload,ocr" : "chat-upload");

          const result = await apiRequest<DocumentIngestionResult>("/api/documents/upload", {
            method: "POST",
            body: formData,
          });

          setDocuments((cur) => [result.document, ...cur]);
          setAttachmentNotice(
            `"${result.document.title}" uploaded successfully. Go to Knowledge → Documents to approve it before the assistant can use it.`,
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to upload the attachment.");
        }
      })();
    });
  }

  const approvedDocuments = documents.filter((d) => d.approvalStatus === "approved").length;
  const pendingDocuments = documents.filter((d) => d.approvalStatus !== "approved").length;
  const eligibleSources = sources.filter(
    (s) => s.allowlisted && s.status === "active" && s.approvalStatus === "approved",
  ).length;
  const selectedMessage =
    activeThread?.messages.find((m) => m.id === selectedMessageId) ??
    latestAssistantMessage(activeThread);

  const providerOptions: { value: Provider; label: string; available: boolean }[] = [
    { value: "mistral",    label: "Mistral",      available: Boolean(settings?.environment.providers.mistral) },
    { value: "nvidia",     label: "NVIDIA NIM",   available: Boolean(settings?.environment.providers.nvidia) },
    { value: "compatible", label: "Custom API",   available: Boolean(settings?.environment.providers.compatible) },
    { value: "local",      label: "Local (demo)", available: true },
  ];
  const availableProviders = providerOptions.filter((p) => p.available);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[color:var(--background)]">

      {/* ── Thread list ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-col bg-white border-r border-[color:var(--line)]",
          "w-full lg:w-[240px] lg:shrink-0 lg:flex",
          mobileView === "chat" ? "hidden" : "flex",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)] text-white">
              <AppIcon name="shield" className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">HR Assistant</p>
              <p className="text-xs text-[color:var(--muted)]">Portugal Labour Law</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--background)] transition-colors"
            title="Admin panel"
          >
            <AppIcon name="settings" className="h-[17px] w-[17px]" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-6"><LoadingState label="Loading conversations" /></div>
          ) : (
            <ChatThreadList
              threads={threads}
              activeThreadId={activeThreadId}
              onSelect={handleSelectThread}
              onCreateNew={handleStartNewChat}
              onDelete={handleDeleteThread}
            />
          )}
        </div>
      </aside>

      {/* ── Chat area ─────────────────────────────────────────────── */}
      <section
        className={cn(
          "flex flex-col flex-1 min-w-0 bg-white",
          mobileView === "threads" ? "hidden lg:flex" : "flex",
        )}
      >
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--line)] bg-white">
          <div className="flex-1 flex items-center gap-2 min-w-0 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setMobileView("threads")}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--brand)] hover:bg-[color:var(--background)] transition-colors shrink-0"
              aria-label="Back to conversations"
            >
              <AppIcon name="arrow-left" className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-[0.9375rem] font-semibold text-[color:var(--foreground)] truncate">
                {activeThreadId ? (activeThread?.title ?? "Conversation") : "New conversation"}
              </p>
              {pendingDocuments > 0 ? (
                <p className="text-xs text-amber-600">
                  {pendingDocuments} doc{pendingDocuments === 1 ? "" : "s"} awaiting approval
                </p>
              ) : null}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
            {/* Language toggle */}
            <div className="flex rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] p-0.5">
              {(["pt-PT", "en-GB"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    language === lang
                      ? "bg-[color:var(--brand)] text-white"
                      : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
                  )}
                >
                  {lang === "pt-PT" ? "PT" : "EN"}
                </button>
              ))}
            </div>

            {/* Model selector */}
            {availableProviders.length > 1 ? (
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="h-8 rounded-lg border border-[color:var(--line)] bg-white px-2 text-xs text-[color:var(--foreground)] focus:outline-none focus:border-[color:var(--brand)] cursor-pointer"
                title="AI model"
              >
                {availableProviders.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            ) : (
              <span className="rounded-lg border border-[color:var(--line)] bg-[color:var(--background)] px-2.5 py-1.5 text-xs text-[color:var(--muted)]">
                {availableProviders[0]?.label ?? "Local"}
              </span>
            )}

            {/* Tools toggle */}
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                showTools
                  ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--background)]",
              )}
              title="Translator & sources"
            >
              <AppIcon name="translate" className="h-[17px] w-[17px]" />
            </button>
            </div>
          </div>
        </div>

        {/* Error / notice banners */}
        {error ? (
          <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(undefined)}
              className="shrink-0 text-rose-500 hover:text-rose-700"
            >
              <AppIcon name="x" className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {providerFallbackNotice ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
            <span>{providerFallbackNotice}</span>
            <button
              type="button"
              onClick={() => setProviderFallbackNotice(undefined)}
              className="shrink-0 text-amber-600 hover:text-amber-800"
            >
              <AppIcon name="x" className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {attachmentNotice ? (
          <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
            <span>
              {attachmentNotice}{" "}
              <Link href="/admin/knowledge" className="font-semibold underline">Go to Knowledge</Link>
            </span>
            <button
              type="button"
              onClick={() => setAttachmentNotice(undefined)}
              className="shrink-0 text-emerald-600 hover:text-emerald-800"
            >
              <AppIcon name="x" className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Message list */}
        <div ref={messageListRef} className="chat-canvas flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loadingThreads ? (
            <div className="flex h-full items-center justify-center">
              <LoadingState label="Loading chat" />
            </div>
          ) : !activeThread?.messages.length ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-sm mx-auto space-y-4">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[color:var(--brand-soft)]">
                  <AppIcon name="spark" className="h-8 w-8 text-[color:var(--brand)]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[color:var(--foreground)]">Portugal HR Legal Assistant</p>
                  <p className="mt-1.5 text-sm text-[color:var(--muted)] leading-relaxed">
                    Ask questions about labour law, HR procedures, contracts, dismissals, or social security.
                    Answers are based on your approved official documents.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-xl mx-auto">
              {activeThread.messages.map((message) => (
                <ChatMessageCard
                  key={message.id}
                  message={message}
                  selected={message.id === selectedMessageId}
                  onSelect={
                    message.role === "assistant" ? () => setSelectedMessageId(message.id) : undefined
                  }
                />
              ))}
              {submitting ? <TypingIndicator /> : null}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="bg-white border-t border-[color:var(--line)] px-4 py-3 sm:px-6">
          <div className="max-w-xl mx-auto">
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onAttachFile={handleAttachFile}
              loading={submitting}
              attachmentLoading={attaching}
            />
          </div>
        </div>
      </section>

      {/* ── Tools panel ──────────────────────────────────────────── */}
      {showTools ? (
        <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col bg-white shadow-xl sm:w-[360px] lg:relative lg:shrink-0 lg:shadow-none border-l border-[color:var(--line)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--line)]">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Tools & Citations</p>
            <button
              type="button"
              onClick={() => setShowTools(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--background)] transition-colors"
            >
              <AppIcon name="x" className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loadingWorkspace ? (
              <LoadingState label="Loading tools" />
            ) : (
              <ChatToolsPanel
                draft={draft}
                selectedAnswer={selectedMessage?.content}
                approvedDocuments={approvedDocuments}
                eligibleSources={eligibleSources}
                translationReady={Boolean(settings?.environment.features.translation)}
                ocrReady={Boolean(settings?.environment.features.ocr)}
                onUseInChat={setDraft}
              />
            )}
            <ChatCitationPanel message={selectedMessage} />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
