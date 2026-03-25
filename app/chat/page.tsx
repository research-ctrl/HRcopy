import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { PageIntro } from "@/components/layout/page-intro";

export default function ChatPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-10">
      <PageIntro
        eyebrow="Assistant"
        title="Chat workspace"
        description="Enterprise chat workspace with approved-source-only retrieval, citation inspection, confidence indicators, and grounding-aware QC."
      />
      <ChatWorkspace />
    </main>
  );
}
