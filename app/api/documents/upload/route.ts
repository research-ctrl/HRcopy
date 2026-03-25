import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

const supportedContentTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"] as const;

function isSupportedUpload(contentType: string) {
  return supportedContentTypes.includes(contentType as (typeof supportedContentTypes)[number]);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim() || undefined;
    const category = String(formData.get("category") ?? "");
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const effectiveDate = String(formData.get("effectiveDate") ?? "").trim() || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!isSupportedUpload(file.type)) {
      return NextResponse.json({ error: "supported uploads are PDF, PNG, JPG, and WebP" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    const result = await localContainer.services.documentIngestionService.ingestUpload({
      fileName: file.name,
      contentType: file.type,
      bytes: Buffer.from(await file.arrayBuffer()),
      title,
      category: category as "employment-code" | "policy" | "contract-template" | "case-note",
      tags,
      effectiveDate,
    });

    return NextResponse.json(result, { status: 201 });
  }

  const body = (await request.json()) as {
    title?: string;
    fileName?: string;
    category?: "employment-code" | "policy" | "contract-template" | "case-note";
    tags?: string[];
    effectiveDate?: string;
    base64File?: string;
    contentType?: string;
  };

  if (!body.fileName || !body.category || !body.base64File || !body.contentType) {
    return NextResponse.json(
      { error: "multipart/form-data with file or JSON with fileName, category, contentType, and base64File is required" },
      { status: 400 },
    );
  }

  if (!isSupportedUpload(body.contentType)) {
    return NextResponse.json({ error: "supported uploads are PDF, PNG, JPG, and WebP" }, { status: 400 });
  }

  const result = await localContainer.services.documentIngestionService.ingestUpload({
    fileName: body.fileName,
    contentType: body.contentType,
    bytes: Buffer.from(body.base64File, "base64"),
    title: body.title,
    category: body.category,
    tags: body.tags ?? [],
    effectiveDate: body.effectiveDate,
  });

  return NextResponse.json(result, { status: 201 });
}
