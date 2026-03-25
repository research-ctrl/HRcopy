import { NextResponse } from "next/server";
import type { ChatRequest } from "@/lib/domain/models/chat";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");

  if (threadId) {
    const thread = await localContainer.repositories.conversationRepository.getThreadById(threadId);
    if (!thread) {
      return NextResponse.json({ error: "thread not found" }, { status: 404 });
    }
    return NextResponse.json(thread);
  }

  const threads = await localContainer.repositories.conversationRepository.listThreads();
  return NextResponse.json(threads);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ChatRequest>;

  if (!body.question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const answer = await localContainer.services.chatService.answer({
    question: body.question,
    threadId: body.threadId,
    topK: body.topK,
    language: body.language,
    preferredProvider: body.preferredProvider,
  });

  return NextResponse.json(answer, { status: 200 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  await localContainer.repositories.conversationRepository.deleteThread(threadId);
  return NextResponse.json({ ok: true });
}
