"use client";

import { useRef, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onAttachFile,
  loading,
  attachmentLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => Promise<void> | void;
  onAttachFile: (file: File) => Promise<void> | void;
  loading: boolean;
  attachmentLoading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q || loading) return;
    await onSubmit(q);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const canSend = Boolean(value.trim()) && !loading;

  return (
    <div className="space-y-2">
      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl border border-[color:var(--line)] bg-white px-2.5 py-2 shadow-sm focus-within:border-[color:var(--brand)] focus-within:shadow-[0_0_0_3px_rgba(15,93,86,0.08)] transition-all"
      >
        {/* File attach */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onAttachFile(file);
            e.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachmentLoading}
          aria-label="Attach file"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--muted)] transition-colors hover:bg-[color:var(--background)] hover:text-[color:var(--brand)] disabled:opacity-40 mb-0.5"
        >
          {attachmentLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-[color:var(--brand)] border-t-transparent animate-spin" />
          ) : (
            <AppIcon name="paperclip" className="h-[17px] w-[17px]" />
          )}
        </button>

        {/* Textarea */}
        <label className="sr-only" htmlFor="chat-input">Ask a question</label>
        <textarea
          id="chat-input"
          rows={1}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
          }}
          onKeyDown={handleKey}
          placeholder="Ask an HR or labour law question…"
          disabled={loading}
          className="flex-1 resize-none bg-transparent py-0.5 text-[12px] leading-snug text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:outline-none max-h-28 disabled:opacity-60"
          style={{ minHeight: "1.5rem" }}
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-all hover:opacity-90 disabled:bg-[color:var(--background)] disabled:text-[color:var(--muted)] mb-0.5"
          aria-label="Send message"
        >
          {loading ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-[16px] w-[16px] fill-current" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </form>

      {attachmentLoading ? (
        <p className="text-xs text-[color:var(--muted)] px-1">Scanning and extracting text…</p>
      ) : null}
    </div>
  );
}
