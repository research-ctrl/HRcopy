import type { SourceRepository } from "@/lib/repositories/interfaces/source-repository";
import type { SourceGovernanceService } from "@/lib/services/interfaces/source-governance-service";

export class LocalSourceGovernanceService implements SourceGovernanceService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async list() {
    return this.sourceRepository.list();
  }

  async getById(id: string) {
    return this.sourceRepository.getById(id);
  }

  async upsert(request: Parameters<SourceRepository["upsert"]>[0]) {
    return this.sourceRepository.upsert(request);
  }

  async remove(id: string) {
    return this.sourceRepository.remove(id);
  }
}

