"use client";

import { cn, formatDate } from "@/lib/utils";
import type { ChatThread } from "@/lib/domain/models/chat";

export function ChatThreadList({
  threads,
  activeThreadId,
  onSelect,
}: {
  threads: ChatThread[];
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelect(thread.id)}
          className={cn(
            "w-full rounded-2xl border px-4 py-3 text-left transition",
            activeThreadId === thread.id
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
          )}
        >
          <p className="truncate text-sm font-semibold">{thread.title}</p>
          <p className={cn("mt-1 text-xs", activeThreadId === thread.id ? "text-slate-300" : "text-slate-500")}>
            {thread.messages.length} messages • {formatDate(thread.updatedAt)}
          </p>
        </button>
      ))}
    </div>
  );
}

