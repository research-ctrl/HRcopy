import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const reviews = await localContainer.repositories.reviewRepository.listQueue();
  return NextResponse.json(reviews);
}

