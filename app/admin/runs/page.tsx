import { RunsManager } from "@/components/admin/runs-manager";
import { PageIntro } from "@/components/layout/page-intro";

export default function RunsPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Monitoring"
        title="Daily monitoring runs"
        description="Inspect monitor run history, change counts, and run summaries, and trigger local runs on demand."
      />
      <RunsManager />
    </main>
  );
}
