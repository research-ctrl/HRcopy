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
    return () => { cancelled = true; };
  }, []);

  const pendingDocuments = documents.filter((d) => d.approvalStatus !== "approved");

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <SectionCard title="Pending documents" description="Not yet eligible for retrieval.">
        {loading ? (
          <LoadingState label="Loading approvals" />
        ) : !pendingDocuments.length ? (
          <EmptyState title="No pending documents" description="All current documents are approved." />
        ) : (
          <div className="space-y-2">
            {pendingDocuments.map((doc) => (
              <article key={doc.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--foreground)] truncate">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-[color:var(--muted)] truncate">{doc.fileName}</p>
                  </div>
                  <StatusBadge value={doc.approvalStatus} />
                </div>
                <p className="mt-2 text-xs text-[color:var(--muted)]">
                  {doc.chunkCount} chunks · Updated {formatDate(doc.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="QC escalations" description="Answers that need a human review.">
        {loading ? (
          <LoadingState label="Loading review queue" />
        ) : !reviews.length ? (
          <EmptyState title="No flagged answers" description="QC escalations appear here when grounding drops below the threshold." />
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--background)] px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[color:var(--foreground)] line-clamp-2">{review.question}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)] line-clamp-2">{review.answerPreview}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge value={review.verdict} />
                    <StatusBadge value={review.priority} />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-[color:var(--muted)]">
                  Tags: {review.issueTags.join(", ")} · {formatDate(review.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
