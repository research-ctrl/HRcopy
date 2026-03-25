import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await localContainer.services.documentService.getById(id);

  if (!record) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }

  const [versions, chunks] = await Promise.all([
    localContainer.repositories.documentVersionRepository.listByDocumentId(id),
    localContainer.repositories.chunkRepository.listByDocumentId(id),
  ]);

  return NextResponse.json({
    document: record,
    versions,
    chunks,
  });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await localContainer.services.documentService.getById(id);

  if (!record) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }

  // Delete chunks, versions, and document record in parallel
  await Promise.all([
    localContainer.repositories.chunkRepository.deleteByDocumentId(id),
    localContainer.repositories.documentVersionRepository.deleteByDocumentId(id),
  ]);
  await localContainer.repositories.documentRepository.delete(id);

  return NextResponse.json({ deleted: id });
}
