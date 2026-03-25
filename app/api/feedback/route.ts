import { NextResponse } from "next/server";
import type { FeedbackRequest } from "@/lib/domain/models/chat";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<FeedbackRequest>;

  if (!body.threadId || !body.messageId || !body.signal) {
    return NextResponse.json({ error: "threadId, messageId and signal are required" }, { status: 400 });
  }

  const result = await localContainer.services.chatService.saveFeedback({
    threadId: body.threadId,
    messageId: body.messageId,
    signal: body.signal,
    comment: body.comment,
  });

  return NextResponse.json(result, { status: 200 });
}

