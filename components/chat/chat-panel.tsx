import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import type { ChatThread } from "@/lib/domain/models/chat";

export function ChatPanel({ thread }: { thread: ChatThread }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
      <SectionCard
        title={thread.title}
        eyebrow="Assistant Workspace"
        description="Mock conversation backed by local adapters. API scaffolding is ready for real provider routing."
      >
        <div className="space-y-4">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={message.role === "assistant" ? "ml-6 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-white" : "mr-6 rounded-3xl bg-slate-100 px-5 py-4 text-sm text-slate-900"}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{message.role}</p>
              <p className="leading-6">{message.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Composer scaffold</p>
          <p className="mt-1 text-sm text-slate-600">
            `POST /api/chat` is active with mock output. Connect this panel to a client component once the live orchestration flow is ready.
          </p>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title="Citations" description="Sources attached to the current assistant answer.">
          <div className="space-y-3">
            {thread.citations.map((citation) => (
              <article key={citation.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{citation.title}</p>
                  <Badge tone={citation.kind === "document" ? "info" : "warning"}>{citation.kind}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{citation.excerpt}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Confidence {(citation.confidence * 100).toFixed(0)}%
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Controls" description="Planned runtime controls for answer governance.">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Approved-only corpus toggle</div>
            <div className="rounded-2xl bg-slate-50 p-4">Provider routing policy selector</div>
            <div className="rounded-2xl bg-slate-50 p-4">Escalate low-confidence answers into review queue</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

