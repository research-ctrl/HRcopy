"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ChatMessage } from "@/lib/domain/models/chat";

export function ChatCitationPanel({ message }: { message?: ChatMessage }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Evidence" description="Select an assistant answer to inspect citations.">
        {!message?.citations?.length ? (
          <EmptyState
            title="No answer selected"
            description="Tap an assistant message to inspect its citations and QA notes."
          />
        ) : (
          <div className="space-y-2">
            {message.citations.map((citation) => (
              <article
                key={citation.id}
                className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{citation.title}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[color:var(--muted)]">
                      {citation.formatted}
                    </p>
                  </div>
                  <StatusBadge value={citation.kind} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{citation.excerpt}</p>
                <p className="mt-2 text-xs font-medium text-[color:var(--muted)]">
                  Confidence {(citation.confidence * 100).toFixed(0)}%
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="QC" description="Grounding posture for the selected answer.">
        {!message?.qc ? (
          <EmptyState
            title="No QC result yet"
            description="QC appears after the assistant produces an answer."
          />
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">Grounded claims</p>
                  <p className="mt-0.5 text-sm text-[color:var(--muted)]">
                    {message.qc.groundedClaims} of {message.qc.totalClaims}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge value={message.qc.status} />
                  <p className="mt-1.5 text-xs font-medium text-[color:var(--muted)]">
                    Score {message.qc.score.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {message.qc.notes.map((note) => (
              <div
                key={note}
                className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--muted)]"
              >
                {note}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
