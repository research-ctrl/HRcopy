import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const runs = await localContainer.services.monitoringService.listRuns();
  return NextResponse.json(runs);
}

export async function POST() {
  const run = await localContainer.services.monitoringService.runNow();
  return NextResponse.json(run, { status: 201 });
}
