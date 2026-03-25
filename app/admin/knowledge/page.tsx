import { KnowledgeManager } from "@/components/admin/knowledge-manager";

export default function KnowledgePage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Knowledge</h1>
        <p className="mt-1.5 text-[color:var(--muted)] leading-relaxed max-w-2xl">
          Upload and approve the official documents the assistant uses. Only approved documents
          are included in answers. Unapproved answers needing review also appear here.
        </p>
      </div>
      <KnowledgeManager />
    </main>
  );
}
