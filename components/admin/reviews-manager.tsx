"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiRequest } from "@/lib/client/api";
import type { DocumentRecord } from "@/lib/domain/models/document";
import type { ReviewQueueItem } from "@/lib/domain/models/review";
import { formatDate } from "@/lib/utils";

export function ReviewsManager() {
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [reviewsData, documentsData] = await Promise.all([
        apiRequest<ReviewQueueItem[]>("/api/reviews"),
        apiRequest<DocumentRecord[]>("/api/documents"),
      ]);

      if (!cancelled) {
        setReviews(reviewsData);
        setDocuments(documentsData);
        setLoading(false);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingDocuments = documents.filter((document) => document.approvalStatus !== "approved");

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Pending document approvals" description="Documents excluded from retrieval until approved.">
        {loading ? (
          <LoadingState label="Loading approvals" />
        ) : !pendingDocuments.length ? (
          <EmptyState title="No pending documents" description="All local documents are currently approved for retrieval." />
        ) : (
          <div className="space-y-3">
            {pendingDocuments.map((document) => (
              <article key={document.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{document.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{document.fileName}</p>
                  </div>
                  <StatusBadge value={document.approvalStatus} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Chunks: {document.chunkCount} • Updated {formatDate(document.updatedAt)}</p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="QC-flagged answers" description="Answers escalated because their grounded support was not strong enough.">
        {loading ? (
          <LoadingState label="Loading review queue" />
        ) : !reviews.length ? (
          <EmptyState title="No flagged answers" description="QC escalations will appear here when answer grounding drops below the review threshold." />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{review.question}</p>
                    <p className="mt-2 text-sm text-slate-600">{review.answerPreview}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={review.verdict} />
                    <StatusBadge value={review.priority} />
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Escalation reasons: {review.issueTags.join(", ")} • updated {formatDate(review.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

