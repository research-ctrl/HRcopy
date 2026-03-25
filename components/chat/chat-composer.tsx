"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  "What should HR verify before ending a probationary contract in Portugal?",
  "What evidence should be kept when refusing an exceptional leave request?",
  "What should HR check before assuming a fixed-term contract can be renewed?",
];

export function ChatComposer({
  onSubmit,
  loading,
}: {
  onSubmit: (question: string) => Promise<void> | void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question) {
      return;
    }

    await onSubmit(question);
    setValue("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-panel">
        <label className="sr-only" htmlFor="chat-question">
          Ask a question
        </label>
        <Textarea
          id="chat-question"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a question grounded in approved HR and legal materials..."
          className="min-h-[132px] border-0 px-0 py-0 shadow-none focus:ring-0"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-slate-500">Only approved sources are used for retrieval. Low-grounding answers are flagged into review.</p>
          <Button type="submit" disabled={loading || !value.trim()}>
            {loading ? "Generating..." : "Ask assistant"}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setValue(suggestion)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

