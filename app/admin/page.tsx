import { DashboardOverview } from "@/components/admin/dashboard-overview";

export default function AdminPage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Overview</h1>
        <p className="mt-1.5 text-[color:var(--muted)] leading-relaxed">
          Portugal HR legal assistant — system status, recent activity, and setup guide.
        </p>
      </div>
      <DashboardOverview />
    </main>
  );
}
