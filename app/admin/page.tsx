import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { PageIntro } from "@/components/layout/page-intro";

export default function AdminPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Admin Dashboard"
        title="Governed operations overview"
        description="Operational home for ingestion, source governance, monitoring, reviews, and runtime health."
      />
      <DashboardOverview />
    </main>
  );
}
