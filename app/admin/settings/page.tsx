import { SettingsPanel } from "@/components/admin/settings-panel";

export default function SettingsPage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Settings</h1>
        <p className="mt-1.5 text-[color:var(--muted)] leading-relaxed max-w-2xl">
          Configure AI providers, review thresholds, and default language. Changes are saved to
          the local settings file and take effect immediately.
        </p>
      </div>
      <SettingsPanel />
    </main>
  );
}
