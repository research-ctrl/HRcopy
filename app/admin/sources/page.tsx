import { SourcesManager } from "@/components/admin/sources-manager";
import { PageIntro } from "@/components/layout/page-intro";

export default function SourcesPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Sources"
        title="Allowlist governance"
        description="Create, edit, and deactivate governed source entries with parser, refresh, priority, and allowlist controls."
      />
      <SourcesManager />
    </main>
  );
}
