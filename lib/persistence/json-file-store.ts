import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDirectory(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

export async function ensureJsonFile<T>(filePath: string, seedValue: T) {
  try {
    await readFile(filePath, "utf8");
  } catch {
    await ensureDirectory(path.dirname(filePath));
    await writeJsonFile(filePath, seedValue);
  }
}

export async function readJsonFile<T>(filePath: string, seedValue: T): Promise<T> {
  await ensureJsonFile(filePath, seedValue);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureDirectory(path.dirname(filePath));
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}
