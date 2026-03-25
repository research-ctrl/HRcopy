import type { AnswerQcResult, QcClaimResult } from "@/lib/domain/models/chat";
import type { RetrievedChunk } from "@/lib/domain/models/retrieval";
import { splitIntoSentences, tokenize } from "@/lib/utils/text";

function claimScore(claim: string, chunkText: string) {
  const claimTokens = new Set(tokenize(claim));
  const chunkTokens = new Set(tokenize(chunkText));

  if (!claimTokens.size || !chunkTokens.size) {
    return 0;
  }

  let overlap = 0;
  for (const token of claimTokens) {
    if (chunkTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / claimTokens.size;
}

export function evaluateGrounding(answer: string, retrievedChunks: RetrievedChunk[]): AnswerQcResult {
  const candidateClaims = splitIntoSentences(answer).filter((sentence) => tokenize(sentence).length >= 5);

  if (!retrievedChunks.length) {
    return {
      status: "fail",
      groundedClaims: 0,
      totalClaims: candidateClaims.length || 1,
      score: 0,
      notes: ["No retrieved evidence was available for grounding checks."],
      claims: candidateClaims.map((claim) => ({
        claim,
        supported: false,
        supportingChunkIds: [],
        score: 0,
      })),
    };
  }

  const claims: QcClaimResult[] = candidateClaims.map((claim) => {
    const scored = retrievedChunks
      .map((chunk) => ({
        chunkId: chunk.chunk.id,
        score: claimScore(claim, chunk.chunk.text),
      }))
      .sort((left, right) => right.score - left.score);

    const winners = scored.filter((item) => item.score >= 0.33);
    const topScore = scored[0]?.score ?? 0;

    return {
      claim,
      supported: topScore >= 0.33,
      supportingChunkIds: winners.map((item) => item.chunkId),
      score: Number(topScore.toFixed(3)),
    };
  });

  const groundedClaims = claims.filter((claim) => claim.supported).length;
  const totalClaims = claims.length || 1;
  const score = groundedClaims / totalClaims;

  return {
    status: score >= 0.8 ? "pass" : score >= 0.5 ? "review" : "fail",
    groundedClaims,
    totalClaims,
    score: Number(score.toFixed(3)),
    notes:
      score >= 0.8
        ? ["Claims are substantially grounded in retrieved approved chunks."]
        : score >= 0.5
          ? ["Some answer claims are weakly grounded and should be reviewed."]
          : ["Most answer claims could not be matched to retrieved approved chunks."],
    claims,
  };
}
