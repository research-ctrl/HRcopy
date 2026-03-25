import type { HealthState } from "@/lib/domain/types/common";

export interface StorageProvider {
  readonly family: "local" | "supabase";
  readonly name: string;
  healthCheck(): Promise<HealthState>;
  storeObject(path: string, data: Buffer): Promise<{ path: string }>;
  readObject(path: string): Promise<Buffer>;
}
