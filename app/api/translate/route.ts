import { NextResponse } from "next/server";
import type { TranslationRequest } from "@/lib/domain/models/translation";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<TranslationRequest>;

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (body.targetLanguage !== "pt-PT" && body.targetLanguage !== "en-GB") {
    return NextResponse.json({ error: "targetLanguage must be pt-PT or en-GB" }, { status: 400 });
  }

  const result = await localContainer.services.translationService.translate({
    text: body.text,
    targetLanguage: body.targetLanguage,
    sourceLanguage: body.sourceLanguage,
  });

  return NextResponse.json(result);
}
