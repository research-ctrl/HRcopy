/**
 * POST /api/sources/bulk
 *
 * Receives a plain-text block body, parses it into source records,
 * then replaces all existing sources with the parsed set.
 *
 * Body: { text: string }
 * Returns: { sources: SourceRecord[]; warnings: string[]; errors: string[] }
 */
import { NextResponse } from "next/server";
import { parseBlockText } from "@/lib/sources/source-block-parser";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const { blocks, errors } = parseBlockText(body.text);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Parse errors in source blocks", details: errors.map((e) => e.message) },
      { status: 422 },
    );
  }

  // Delete all existing sources, then recreate from parsed blocks
  const existing = await localContainer.services.sourceGovernanceService.list();
  await Promise.all(existing.map((s) => localContainer.services.sourceGovernanceService.remove(s.id)));

  const warnings: string[] = [];
  const saved = await Promise.all(
    blocks.map(async (b) => {
      warnings.push(...b.warnings.map((w) => `[${b.source.name}] ${w}`));
      return localContainer.services.sourceGovernanceService.upsert(b.source);
    }),
  );

  return NextResponse.json({ sources: saved, warnings, errors: [] });
}
