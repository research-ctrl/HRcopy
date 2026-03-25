"use client";

import type { ChatMessage, ChatSourceCitation } from "@/lib/domain/models/chat";
import { cn, formatDate } from "@/lib/utils";

/* ── Lightweight markdown renderer ──────────────────────────────
 * Handles headings, bold/italic, bullet/numbered lists, horizontal
 * rules, inline code, and paragraph breaks.
 * ──────────────────────────────────────────────────────────────── */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  function flushList() {
    if (!listItems.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    nodes.push(
      <Tag key={key++} className={listType === "ol" ? "list-decimal" : "list-disc"}>
        {listItems}
      </Tag>,
    );
    listItems = [];
    listType = null;
  }

  function inlineFormat(str: string): React.ReactNode {
    const parts = str.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("***") && part.endsWith("***"))
        return <strong key={i}><em>{part.slice(3, -3)}</em></strong>;
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if ((part.startsWith("*") && part.endsWith("*") && part.length > 2) ||
          (part.startsWith("_") && part.endsWith("_") && part.length > 2))
        return <em key={i}>{part.slice(1, -1)}</em>;
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
        return <code key={i}>{part.slice(1, -1)}</code>;
      return part;
    });
  }

  for (const line of lines) {
    const trimmed = line.trimEnd();

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      nodes.push(<Tag key={key++}>{inlineFormat(headingMatch[2])}</Tag>);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushList();
      nodes.push(<hr key={key++} />);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(<li key={key++}>{inlineFormat(ulMatch[1])}</li>);
      continue;
    }

    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(<li key={key++}>{inlineFormat(olMatch[1])}</li>);
      continue;
    }

    if (trimmed === "") {
      flushList();
      continue;
    }

    flushList();
    nodes.push(<p key={key++}>{inlineFormat(trimmed)}</p>);
  }

  flushList();
  return nodes;
}

/* ── Source chips (no confidence %) ──────────────────────────── */
function SourceChips({ citations }: { citations: ChatSourceCitation[] }) {
  if (!citations.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-[color:var(--line)] pt-2.5">
      {citations.slice(0, 5).map((c) => (
        <div
          key={c.id}
          title={c.excerpt}
          className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--background)] px-2 py-0.5 text-[11px] text-[color:var(--muted)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)] shrink-0" />
          <span className="truncate max-w-[120px]">{c.title}</span>
        </div>
      ))}
      {citations.length > 5 && (
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--background)] px-2 py-0.5 text-[11px] text-[color:var(--muted)]">
          +{citations.length - 5}
        </span>
      )}
    </div>
  );
}

/* ── Main message card ────────────────────────────────────────── */
function MessageBody({ message, selected }: { message: ChatMessage; selected?: boolean }) {
  const isAssistant = message.role === "assistant";
  const hasCitations = isAssistant && (message.citations?.length ?? 0) > 0;

  return (
    <div className={cn("flex flex-col", isAssistant ? "items-start" : "items-end ml-auto", "max-w-[80%]")}>
      {/* Timestamp */}
      <span className="px-1 mb-1 text-[11px] text-[color:var(--muted)]">
        {formatDate(message.createdAt)}
      </span>

      {/* Bubble */}
      <div
        className={cn(
          "rounded-2xl shadow-sm",
          isAssistant
            ? "rounded-tl-sm bg-white border border-[color:var(--line)] text-[color:var(--foreground)] px-3.5 py-3"
            : "rounded-tr-sm bg-[color:var(--brand)] text-white px-3.5 py-2.5",
          selected && isAssistant
            ? "ring-2 ring-[color:var(--brand)] ring-offset-1 ring-offset-[color:var(--chat-wash)]"
            : "",
        )}
      >
        {isAssistant ? (
          <div className="prose-legal text-[13px] leading-relaxed">{renderMarkdown(message.content)}</div>
        ) : (
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        {message.notice ? (
          <p className={cn("mt-2 text-xs leading-5 border-t pt-2", isAssistant ? "text-[color:var(--muted)] border-[color:var(--line)]" : "text-white/70 border-white/20")}>
            {message.notice}
          </p>
        ) : null}

        {hasCitations && <SourceChips citations={message.citations!} />}
      </div>
    </div>
  );
}

export function ChatMessageCard({
  message,
  selected,
  onSelect,
}: {
  message: ChatMessage;
  selected?: boolean;
  onSelect?: () => void;
}) {
  if (!onSelect) {
    return <MessageBody message={message} selected={selected} />;
  }

  return (
    <button type="button" onClick={onSelect} className="block w-full text-left">
      <MessageBody message={message} selected={selected} />
    </button>
  );
}
