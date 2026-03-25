import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const documents = await localContainer.services.documentService.list();
  return NextResponse.json(documents);
}

