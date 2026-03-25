import { SyncManager } from "@/components/admin/sync-manager";

export default function SyncPage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Sync</h1>
        <p className="mt-1.5 text-[color:var(--muted)] leading-relaxed max-w-2xl">
          Check official sources for changes and update the knowledge base. Run manually or let the
          daily schedule handle it. Each source is checked for content changes — updated pages are
          flagged for review.
        </p>
      </div>
      <SyncManager />
    </main>
  );
}
