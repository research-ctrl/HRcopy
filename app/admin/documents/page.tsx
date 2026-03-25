import { DocumentsManager } from "@/components/admin/documents-manager";
import { PageIntro } from "@/components/layout/page-intro";

export default function DocumentsPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Documents"
        title="Document ingestion and approval"
        description="Upload PDFs, inspect ingestion output, approve documents, and review chunk and version metadata."
      />
      <DocumentsManager />
    </main>
  );
}
