import { SettingsPanel } from "@/components/admin/settings-panel";
import { PageIntro } from "@/components/layout/page-intro";

export default function SettingsPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Settings"
        title="Runtime configuration"
        description="Inspect provider availability, environment posture, and future external wiring boundaries."
      />
      <SettingsPanel />
    </main>
  );
}
