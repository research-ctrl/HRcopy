import type { DashboardMetric } from "@/lib/domain/models/dashboard";
import { AppIcon } from "@/components/ui/app-icon";

const icons = ["document", "source", "monitor", "review"] as const;

export function StatGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, i) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-[color:var(--line)] bg-white p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[color:var(--muted)]">{metric.label}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
              <AppIcon name={icons[i] ?? "dashboard"} className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {metric.value}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">{metric.delta}</p>
        </article>
      ))}
    </div>
  );
}
