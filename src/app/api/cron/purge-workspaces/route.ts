import { lt, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getDb, platformSchema } from "@/core/db";
import { env } from "@/core/env";
import { logger } from "@/core/logger";

export const dynamic = "force-dynamic";

/**
 * Deletes anonymous workspaces idle for WORKSPACE_TTL_DAYS. Module rows go with
 * them through ON DELETE CASCADE. Scheduled in vercel.json.
 */
export async function GET(request: NextRequest) {
  const { CRON_SECRET, WORKSPACE_TTL_DAYS } = env();
  if (!CRON_SECRET || request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = await getDb(platformSchema);
  const { workspaces } = platformSchema;
  const deleted = await db
    .delete(workspaces)
    .where(lt(workspaces.lastSeenAt, sql`now() - make_interval(days => ${WORKSPACE_TTL_DAYS})`))
    .returning({ id: workspaces.id });

  logger.info("cron", `purged ${deleted.length} idle workspaces`);
  return NextResponse.json({ purged: deleted.length });
}
