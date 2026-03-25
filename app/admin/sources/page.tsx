import { SourceBlockEditor } from "@/components/admin/source-block-editor";

export default function SourcesPage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Sources</h1>
        <p className="mt-1.5 text-[color:var(--muted)] leading-relaxed max-w-2xl">
          Define the official sources the assistant trusts. Edit the plain-text blocks below —
          each block is one source. Only allowlisted, approved sources are used in answers.
        </p>
      </div>
      <SourceBlockEditor />
    </main>
  );
}
