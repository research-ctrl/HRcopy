import { getSupabaseClient } from "@/lib/database/supabase";
import type { StorageProvider } from "@/lib/providers/interfaces/storage-provider";

export class SupabaseStorageProvider implements StorageProvider {
  readonly family = "supabase" as const;
  readonly name = "supabase-storage";

  private readonly bucketName = "documents";

  async healthCheck() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.storage.from(this.bucketName).list("", { limit: 1 });
      if (error) return "offline" as const;
      return "healthy" as const;
    } catch {
      return "offline" as const;
    }
  }

  async storeObject(path: string, data: Buffer): Promise<{ path: string }> {
    const client = getSupabaseClient();

    const { error } = await client.storage
      .from(this.bucketName)
      .upload(path, data, {
        upsert: true,
        contentType: path.endsWith(".pdf") ? "application/pdf" : "text/plain",
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    return { path };
  }

  async readObject(path: string): Promise<Buffer> {
    const client = getSupabaseClient();

    const { data, error } = await client.storage.from(this.bucketName).download(path);

    if (error) {
      throw new Error(`Failed to download from Supabase: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }
}
