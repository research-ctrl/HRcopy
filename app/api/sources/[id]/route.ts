import { NextResponse } from "next/server";
import type { UpsertSourceRequest } from "@/lib/domain/models/source";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const source = await localContainer.services.sourceGovernanceService.getById(id);

  if (!source) {
    return NextResponse.json({ error: "source not found" }, { status: 404 });
  }

  return NextResponse.json(source);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const removed = await localContainer.services.sourceGovernanceService.remove(id);

  if (!removed) {
    return NextResponse.json({ error: "source not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const existing = await localContainer.services.sourceGovernanceService.getById(id);

  if (!existing) {
    return NextResponse.json({ error: "source not found" }, { status: 404 });
  }

  const body = (await request.json()) as Partial<UpsertSourceRequest>;
  const updated = await localContainer.services.sourceGovernanceService.upsert({
    id,
    name: body.name ?? existing.name,
    url: body.url ?? existing.url,
    sourceType: body.sourceType ?? existing.sourceType,
    parserType: body.parserType ?? existing.parserType,
    refreshFrequency: body.refreshFrequency ?? existing.refreshFrequency,
    priority: body.priority ?? existing.priority,
    digestEnabled: body.digestEnabled ?? existing.digestEnabled,
    status: body.status ?? existing.status,
    approvalStatus: body.approvalStatus ?? existing.approvalStatus,
    allowlisted: body.allowlisted ?? existing.allowlisted,
    notes: body.notes ?? existing.notes,
  });

  return NextResponse.json(updated);
}
