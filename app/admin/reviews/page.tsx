import { ReviewsManager } from "@/components/admin/reviews-manager";
import { PageIntro } from "@/components/layout/page-intro";

export default function ReviewsPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Reviews"
        title="Answer quality control queue"
        description="Review pending document approvals and QC-flagged answers requiring escalation."
      />
      <ReviewsManager />
    </main>
  );
}
