import { NextResponse } from "next/server";
import { getLocalPaths } from "@/lib/config/local-paths";
import { writeJsonFile, readJsonFile } from "@/lib/persistence/json-file-store";
import path from "node:path";

/** Quick round-trip write+read to confirm the data dir is writable. */
export async function GET() {
  const paths = getLocalPaths();
  const testFile = path.join(paths.dbDir, "_persistence_check.json");
  const testValue = { ok: true, ts: new Date().toISOString() };

  try {
    await writeJsonFile(testFile, testValue);
    const readBack = await readJsonFile<typeof testValue>(testFile, { ok: false, ts: "" });
    if (!readBack.ok) {
      return NextResponse.json(
        { writable: false, error: "Write succeeded but read-back returned wrong value", dataDir: paths.dbDir },
        { status: 500 },
      );
    }
    return NextResponse.json({ writable: true, dataDir: paths.dbDir, ts: readBack.ts });
  } catch (err) {
    return NextResponse.json(
      {
        writable: false,
        error: err instanceof Error ? err.message : String(err),
        dataDir: paths.dbDir,
        hint: "If running on Vercel or another serverless host the filesystem is read-only. Use Supabase instead — see supabase-schema.sql.",
      },
      { status: 500 },
    );
  }
}
