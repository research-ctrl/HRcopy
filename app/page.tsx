import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { SectionCard } from "@/components/ui/section-card";
import { localContainer } from "@/lib/services/shared/local-service-container";

export default async function HomePage() {
  const snapshot = await localContainer.services.dashboardService.getSnapshot();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 lg:px-10">
      <PageIntro
        eyebrow="Repository Scaffold"
        title="HR legal assistant foundation for governed internal use"
        description="This mock-first Next.js scaffold ships a clean dashboard, chat workspace, typed backend contracts, route handlers, and placeholder adapters so local development can start before Supabase and provider integrations are connected."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SectionCard
          title="What is ready"
          description="Pages, API routes, interfaces, local adapters, docs, and repository conventions are all scaffolded."
          className="subtle-grid"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {snapshot.metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/80 bg-white/85 p-5">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-600">{metric.delta}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Open the app" description="Use the seeded local experience to validate the shell and route structure.">
          <div className="space-y-3">
            <Link href="/chat" className="block rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              Open assistant chat
            </Link>
            <Link href="/admin" className="block rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-medium text-white">
              Open admin dashboard
            </Link>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-slate-600">
            <li>App Router pages render against local services.</li>
            <li>API route placeholders return typed mock payloads.</li>
            <li>Supabase and provider integrations are intentionally deferred.</li>
          </ul>
        </SectionCard>
      </div>
    </main>
  );
}

