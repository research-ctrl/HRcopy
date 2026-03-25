import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const digest = await localContainer.services.monitoringService.getDigest();
  return NextResponse.json(digest);
}

