import { describe, expect, it } from "vitest";
import { buildChunkDrafts } from "@/lib/ingestion/chunker";

describe("buildChunkDrafts", () => {
  it("prefers headings and keeps page metadata", () => {
    const drafts = buildChunkDrafts({
      pages: [
        [
          "1. Probation Termination",
          "HR must verify the probation period.",
          "Protected status must be checked.",
          "",
          "2. Evidence Trail",
          "Managers should retain a written record.",
        ].join("\n"),
      ],
      maxChars: 500,
    });

    expect(drafts).toHaveLength(2);
    expect(drafts[0]?.sectionTitle).toBe("1. Probation Termination");
    expect(drafts[0]?.pageStart).toBe(1);
    expect(drafts[1]?.sectionTitle).toBe("2. Evidence Trail");
  });

  it("falls back to length-based chunking for oversized sections", () => {
    const longParagraph = Array.from({ length: 80 }, (_, index) => `sentence ${index} about approved evidence.`).join(" ");
    const drafts = buildChunkDrafts({
      pages: [`General\n${longParagraph}`],
      maxChars: 240,
    });

    expect(drafts.length).toBeGreaterThan(1);
    expect(drafts.every((draft) => draft.text.length <= 260)).toBe(true);
  });
});
