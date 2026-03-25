import type { RetrievedChunk } from "@/lib/domain/models/retrieval";
import { evaluateGrounding } from "@/lib/qc/check-grounding";
import type { QcService } from "@/lib/services/interfaces/qc-service";

export class LocalQcService implements QcService {
  async evaluate(answer: string, retrievedChunks: RetrievedChunk[]) {
    return evaluateGrounding(answer, retrievedChunks);
  }
}
