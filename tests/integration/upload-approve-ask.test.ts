import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { afterEach, describe, expect, it } from "vitest";
import { createLocalContainer } from "@/lib/services/shared/local-service-container";

async function createPdf(lines: string[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let y = 780;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: 12, font });
    y -= 18;
  }

  return Buffer.from(await pdf.save({ useObjectStreams: false }));
}

describe("local backend integration", () => {
  const roots: string[] = [];

  afterEach(async () => {
    await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
    roots.length = 0;
  });

  it("supports upload -> process -> approve -> ask question", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "hr-legal-assistant-"));
    roots.push(root);

    const container = createLocalContainer(root);
    container.providers.pdfExtractor.extract = async () => ({
      text: [
        "1. Evidence Ledger",
        "Managers must record every probation termination in the dismissal ledger.",
        "2. Review",
        "HR must review the dismissal ledger before action.",
      ].join("\n"),
      pages: [
        [
          "1. Evidence Ledger",
          "Managers must record every probation termination in the dismissal ledger.",
          "2. Review",
          "HR must review the dismissal ledger before action.",
        ].join("\n"),
      ],
      pageCount: 1,
      method: "pdf-text",
    });
    const pdfBytes = await createPdf([
      "1. Evidence Ledger",
      "Managers must record every probation termination in the dismissal ledger.",
      "2. Review",
      "HR must review the dismissal ledger before action.",
    ]);

    const ingestion = await container.services.documentIngestionService.ingestUpload({
      fileName: "dismissal-ledger.pdf",
      contentType: "application/pdf",
      bytes: pdfBytes,
      title: "Dismissal Ledger Policy",
      category: "policy",
      tags: ["dismissal", "probation"],
    });

    expect(ingestion.document.processingStatus).toBe("ready");
    expect(ingestion.chunksCreated).toBeGreaterThan(0);

    const approved = await container.services.documentIngestionService.approveDocument(
      ingestion.document.id,
      "Test Reviewer",
    );

    expect(approved?.approvalStatus).toBe("approved");

    const answer = await container.services.answerService.answer({
      question: "What must managers record before HR reviews a probation termination?",
      topK: 3,
    });

    expect(answer.citations.length).toBeGreaterThan(0);
    expect(answer.message.content).toContain("Modo local");
    expect(answer.qc.status).not.toBe("fail");
  });

  it("supports image upload through the OCR path", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "hr-legal-assistant-"));
    roots.push(root);

    const container = createLocalContainer(root);
    container.providers.ocrProvider.extract = async () => ({
      text: "Gestor deve guardar prova documental antes da revisao final.",
      method: "ocr-fallback",
    });

    const ingestion = await container.services.documentIngestionService.ingestUpload({
      fileName: "disciplinary-note.png",
      contentType: "image/png",
      bytes: Buffer.from("fake-image"),
      title: "Disciplinary note",
      category: "case-note",
      tags: ["ocr", "disciplinary"],
    });

    expect(ingestion.version.extractionMethod).toBe("ocr-fallback");
    expect(ingestion.document.mimeType).toBe("image/png");
    expect(ingestion.document.summary).toContain("Gestor deve guardar prova documental");
  });
});
