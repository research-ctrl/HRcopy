"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ChatMessage } from "@/lib/domain/models/chat";

export function ChatCitationPanel({ message }: { message?: ChatMessage }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Approved-source notice"
        description="Answers are grounded only in approved documents and approved active allowlisted sources."
      >
        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          If no approved evidence is retrieved, the assistant returns a cautious development fallback instead of inventing legal guidance.
        </div>
      </SectionCard>

      <SectionCard title="Citations" description="Select an assistant answer to inspect its citations and QC posture.">
        {!message?.citations?.length ? (
          <EmptyState
            title="No citations selected"
            description="Click an assistant response to inspect the retrieved chunk citations and grounded evidence references."
          />
        ) : (
          <div className="space-y-3">
            {message.citations.map((citation) => (
              <article key={citation.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{citation.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{citation.formatted}</p>
                  </div>
                  <StatusBadge value={citation.kind} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{citation.excerpt}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">Confidence {(citation.confidence * 100).toFixed(0)}%</p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Quality control" description="Grounding checks over retrieved chunks.">
        {!message?.qc ? (
          <EmptyState title="No QC result yet" description="QC will appear after the assistant generates an answer." />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Grounded claims</p>
                <p className="text-sm text-slate-600">
                  {message.qc.groundedClaims} of {message.qc.totalClaims} claims supported
                </p>
              </div>
              <div className="text-right">
                <StatusBadge value={message.qc.status} />
                <p className="mt-2 text-sm font-medium text-slate-700">Score {message.qc.score.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-2">
              {message.qc.notes.map((note) => (
                <div key={note} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

