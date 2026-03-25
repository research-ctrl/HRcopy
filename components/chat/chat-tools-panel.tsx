"use client";

import { useState, useTransition } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/client/api";
import type { TranslationLanguage, TranslationResult } from "@/lib/domain/models/translation";

export function ChatToolsPanel({
  draft,
  selectedAnswer,
  approvedDocuments,
  eligibleSources,
  translationReady,
  ocrReady,
  onUseInChat,
}: {
  draft: string;
  selectedAnswer?: string;
  approvedDocuments: number;
  eligibleSources: number;
  translationReady: boolean;
  ocrReady: boolean;
  onUseInChat: (value: string) => void;
}) {
  const [input, setInput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<TranslationLanguage>("pt-PT");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string>();
  const [submitting, startTransition] = useTransition();

  function handleTranslate() {
    if (!input.trim()) return;
    setError(undefined);
    startTransition(() => {
      void (async () => {
        try {
          const response = await apiRequest<TranslationResult>("/api/translate", {
            method: "POST",
            body: JSON.stringify({ text: input, targetLanguage }),
          });
          setResult(response);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to translate.");
        }
      })();
    });
  }

  return (
    <div className="space-y-4">
      {/* Corpus status */}
      <SectionCard title="Corpus" description="Knowledge base at a glance.">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[color:var(--brand)] px-4 py-3 text-white">
            <div className="flex items-center gap-1.5">
              <AppIcon name="document" className="h-3.5 w-3.5" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Docs</p>
            </div>
            <p className="mt-2 text-2xl font-semibold">{approvedDocuments}</p>
          </div>
          <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
            <div className="flex items-center gap-1.5">
              <AppIcon name="source" className="h-3.5 w-3.5 text-[color:var(--brand)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted)]">Sources</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{eligibleSources}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-xs text-[color:var(--muted)]">
            <span>Translation</span>
            <span className={translationReady ? "text-emerald-600 font-medium" : ""}>
              {translationReady ? "available" : "not configured"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-xs text-[color:var(--muted)]">
            <span>OCR uploads</span>
            <span className={ocrReady ? "text-emerald-600 font-medium" : ""}>
              {ocrReady ? "ready" : "not configured"}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Translator */}
      <SectionCard title="Translator" description="Convert notes or answers between English and Portuguese.">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setInput(draft)} disabled={!draft.trim()}>
            Use draft
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { if (selectedAnswer) setInput(selectedAnswer); }}
            disabled={!selectedAnswer}
          >
            Use answer
          </Button>
          <div className="ml-auto flex rounded-full border border-[color:var(--line)] bg-white p-0.5">
            {(["pt-PT", "en-GB"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setTargetLanguage(lang)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  targetLanguage === lang
                    ? "bg-[color:var(--brand)] text-white"
                    : "text-[color:var(--muted)]"
                }`}
              >
                {lang === "pt-PT" ? "PT" : "EN"}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a note, answer, or draft reply…"
          className="min-h-[100px]"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[color:var(--muted)]">Review before sending externally.</p>
          <Button onClick={handleTranslate} disabled={submitting || !input.trim()}>
            {submitting ? "Translating…" : "Translate"}
          </Button>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!result ? (
          <div className="mt-3">
            <EmptyState
              title="No translation yet"
              description="Load a draft or answer, then translate it."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Output</p>
                <Button size="sm" variant="secondary" onClick={() => onUseInChat(result.text)}>
                  Use in chat
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[color:var(--muted)]">
                {result.text}
              </p>
            </div>
            {result.notice ? (
              <p className="text-xs text-[color:var(--muted)]">{result.notice}</p>
            ) : null}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
