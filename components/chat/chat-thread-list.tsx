"use client";

import { useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { EmptyState } from "@/components/ui/empty-state";
import type { ChatThread } from "@/lib/domain/models/chat";
import { cn, formatDate } from "@/lib/utils";

export function ChatThreadList({
  threads,
  activeThreadId,
  onSelect,
  onCreateNew,
  onDelete,
}: {
  threads: ChatThread[];
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
  onCreateNew: () => void;
  onDelete: (threadId: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string>();
  const [confirmId, setConfirmId] = useState<string>();

  async function handleDelete(e: React.MouseEvent, threadId: string) {
    e.stopPropagation();
    if (confirmId !== threadId) {
      setConfirmId(threadId);
      return;
    }
    setDeletingId(threadId);
    setConfirmId(undefined);
    await onDelete(threadId);
    setDeletingId(undefined);
  }

  function cancelConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmId(undefined);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[color:var(--line)]">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-[color:var(--background)] px-3 py-1.5">
          <AppIcon name="search" className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]" />
          <span className="text-xs text-[color:var(--muted)] select-none">Search</span>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand)] text-white transition-colors hover:opacity-90"
          aria-label="New conversation"
        >
          <AppIcon name="plus" className="h-4 w-4" />
        </button>
      </div>

      {/* Thread items */}
      {!threads.length ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No conversations yet"
            description="Tap + to start your first HR conversation."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            const isActive = activeThreadId === thread.id;
            const isDeleting = deletingId === thread.id;
            const isConfirming = confirmId === thread.id;
            const preview = lastMessage?.content
              ? lastMessage.content.slice(0, 80)
              : "No messages yet.";

            return (
              <div
                key={thread.id}
                className={cn(
                  "relative flex items-stretch border-b border-[color:var(--line)] transition-colors",
                  isActive ? "bg-[color:var(--brand-soft)]" : "hover:bg-[color:var(--background)]",
                )}
              >
                {/* Main clickable row */}
                <button
                  type="button"
                  onClick={() => onSelect(thread.id)}
                  disabled={isDeleting}
                  className="flex flex-1 items-center gap-3 px-4 py-3 text-left min-w-0"
                >
                  {/* Avatar dot */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-[color:var(--brand)] text-white"
                        : "bg-[color:var(--brand-soft)] text-[color:var(--brand)]",
                    )}
                  >
                    <AppIcon name="chat" className="h-4 w-4" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="truncate text-[13px] font-semibold text-[color:var(--foreground)] leading-snug">
                        {thread.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-[color:var(--muted)] whitespace-nowrap">
                        {formatDate(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[color:var(--muted)]">
                      {preview}
                    </p>
                  </div>
                </button>

                {/* Delete / confirm area — always visible, subtle */}
                <div className="flex items-center pr-3 shrink-0">
                  {isConfirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => void handleDelete(e, thread.id)}
                        className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-500 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="rounded-md px-2 py-1 text-[11px] text-[color:var(--muted)] hover:bg-[color:var(--background)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => void handleDelete(e, thread.id)}
                      disabled={isDeleting}
                      aria-label="Delete conversation"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--muted)] transition-colors hover:bg-rose-50 hover:text-rose-500 opacity-40 hover:opacity-100"
                    >
                      {isDeleting ? (
                        <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <AppIcon name="x" className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
