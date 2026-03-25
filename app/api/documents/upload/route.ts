import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

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

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "only PDF uploads are supported" }, { status: 400 });
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
    base64Pdf?: string;
  };

  if (!body.fileName || !body.category || !body.base64Pdf) {
    return NextResponse.json(
      { error: "multipart/form-data with file or JSON with fileName, category and base64Pdf is required" },
      { status: 400 },
    );
  }

  const result = await localContainer.services.documentIngestionService.ingestUpload({
    fileName: body.fileName,
    contentType: "application/pdf",
    bytes: Buffer.from(body.base64Pdf, "base64"),
    title: body.title,
    category: body.category,
    tags: body.tags ?? [],
    effectiveDate: body.effectiveDate,
  });

  return NextResponse.json(result, { status: 201 });
}
