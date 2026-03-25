import type { DocumentChunkRecord } from "@/lib/domain/models/document";
import { tokenize } from "@/lib/utils/text";

export function cosineSimilarity(left: number[], right: number[]) {
  const dimensions = Math.max(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < dimensions; index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    dot += a * b;
    leftMagnitude += a * a;
    rightMagnitude += b * b;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator ? dot / denominator : 0;
}

export function keywordOverlapScore(question: string, chunk: DocumentChunkRecord) {
  const questionTokens = new Set(tokenize(question));
  const chunkTokens = tokenize(chunk.normalizedText);

  if (!questionTokens.size || !chunkTokens.length) {
    return 0;
  }

  const overlap = chunkTokens.filter((token) => questionTokens.has(token)).length;
  const overlapRatio = overlap / questionTokens.size;
  const sectionBonus =
    chunk.sectionTitle && tokenize(chunk.sectionTitle).some((token) => questionTokens.has(token)) ? 0.1 : 0;

  return overlapRatio + sectionBonus;
}
