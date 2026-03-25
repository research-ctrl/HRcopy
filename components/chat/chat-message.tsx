"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { ChatMessage } from "@/lib/domain/models/chat";
import { cn, formatDate } from "@/lib/utils";

export function ChatMessageCard({
  message,
  selected,
  onSelect,
}: {
  message: ChatMessage;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const assistant = message.role === "assistant";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "block w-full rounded-[28px] border px-5 py-4 text-left transition",
        assistant
          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        selected && "ring-2 ring-[color:var(--accent)]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-[0.24em]", assistant ? "text-slate-300" : "text-slate-500")}>
            {message.role}
          </span>
          {assistant && message.qc ? <StatusBadge value={message.qc.status} /> : null}
          {assistant && typeof message.confidence === "number" ? (
            <span className={cn("text-xs font-medium", assistant ? "text-slate-200" : "text-slate-500")}>
              Confidence {(message.confidence * 100).toFixed(0)}%
            </span>
          ) : null}
        </div>
        <span className={cn("text-xs", assistant ? "text-slate-300" : "text-slate-500")}>{formatDate(message.createdAt)}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
      {message.notice ? (
        <p className={cn("mt-3 text-xs leading-6", assistant ? "text-amber-200" : "text-slate-500")}>{message.notice}</p>
      ) : null}
    </button>
  );
}

