import { NextResponse } from "next/server";
import type { UpsertSourceRequest } from "@/lib/domain/models/source";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const sources = await localContainer.services.sourceGovernanceService.list();
  return NextResponse.json(sources);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<UpsertSourceRequest>;

  if (!body.name || !body.url || !body.status) {
    return NextResponse.json({ error: "name, url and status are required" }, { status: 400 });
  }

  const source = await localContainer.services.sourceGovernanceService.upsert({
    id: body.id,
    name: body.name,
    url: body.url,
    sourceType: body.sourceType,
    parserType: body.parserType,
    refreshFrequency: body.refreshFrequency,
    priority: body.priority,
    digestEnabled: body.digestEnabled ?? true,
    status: body.status,
    approvalStatus: body.approvalStatus,
    allowlisted: body.allowlisted,
    notes: body.notes ?? "",
  });

  return NextResponse.json(source, { status: 201 });
}
