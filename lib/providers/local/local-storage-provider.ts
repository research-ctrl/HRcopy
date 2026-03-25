import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { getLocalPaths } from "@/lib/config/local-paths";
import { ensureDirectory } from "@/lib/persistence/json-file-store";
import type { StorageProvider } from "@/lib/providers/interfaces/storage-provider";

export class LocalStorageProvider implements StorageProvider {
  readonly family = "local" as const;
  readonly name = "local-storage";

  constructor(private readonly root?: string) {}

  async healthCheck() {
    return "healthy" as const;
  }

  private resolvePath(relativePath: string) {
    const uploadsDir = getLocalPaths(this.root).uploadsDir;
    return path.join(uploadsDir, relativePath);
  }

  async storeObject(relativePath: string, data: Buffer) {
    const absolutePath = this.resolvePath(relativePath);
    await ensureDirectory(path.dirname(absolutePath));
    await writeFile(absolutePath, data);
    return { path: relativePath.replace(/\\/g, "/") };
  }

  async readObject(relativePath: string) {
    return readFile(this.resolvePath(relativePath));
  }
}

