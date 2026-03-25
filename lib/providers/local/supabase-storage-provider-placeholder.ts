import type { StorageProvider } from "@/lib/providers/interfaces/storage-provider";

async function notImplemented<T>(): Promise<T> {
  throw new Error("Supabase storage provider is not implemented. Use local storage provider for now.");
}

export class SupabaseStorageProviderPlaceholder implements StorageProvider {
  readonly family = "supabase" as const;
  readonly name = "supabase-storage-placeholder";

  async healthCheck() {
    return "offline" as const;
  }

  async storeObject(_path: string, _data: Buffer): Promise<{ path: string }> {
    return notImplemented<{ path: string }>();
  }

  async readObject(_path: string): Promise<Buffer> {
    return notImplemented<Buffer>();
  }
}
