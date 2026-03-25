import type { DashboardMetric } from "@/lib/domain/models/dashboard";

export function StatGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="panel p-5">
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
          <p className="mt-2 text-sm text-emerald-700">{metric.delta}</p>
        </article>
      ))}
    </div>
  );
}

