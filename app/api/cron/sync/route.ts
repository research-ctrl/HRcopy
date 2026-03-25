/**
 * GET /api/cron/sync
 *
 * Scheduled source scan endpoint.
 *
 * Call this from:
 *  - Vercel Cron:   add to vercel.json → "crons": [{"path": "/api/cron/sync", "schedule": "0 7 * * *"}]
 *  - External cron: curl https://your-domain/api/cron/sync
 *  - Admin UI:      the Sync page has a manual "Run now" button (uses /api/monitor/run directly)
 *
 * For production, protect this route with a shared secret:
 *   Set CRON_SECRET in .env.local, then callers must pass ?secret=<value>
 */
import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET(request: Request) {
  // Optional secret check — protects against unauthenticated external triggers
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const url = new URL(request.url);
    const provided = url.searchParams.get("secret") ?? request.headers.get("x-cron-secret");
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const run = await localContainer.services.monitorService.runNow("scheduled");
    return NextResponse.json({
      ok: true,
      runId: run.id,
      sourcesChecked: run.sourcesChecked,
      changesDetected: run.changesDetected,
      status: run.status,
      notes: run.notes,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync run failed" },
      { status: 500 },
    );
  }
}
