import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await localContainer.services.documentService.approve(id);

  if (!record) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

