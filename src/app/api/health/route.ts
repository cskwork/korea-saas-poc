import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getConnection, getDb } from "@/core/db";
import { aiStatus } from "@/core/ai";
import { serializeError, logger } from "@/core/logger";

export const dynamic = "force-dynamic";

/** Liveness + dependency check for uptime monitors. */
export async function GET() {
  const startedAt = Date.now();
  try {
    const connection = await getConnection();
    const db = await getDb();
    await db.select({ ok: sql<number>`1` }).from(sql`(select 1) as probe`);
    return NextResponse.json({
      status: "ok",
      database: { driver: connection.kind, target: connection.target, persistent: connection.kind === "postgres" || !process.env.VERCEL },
      ai: aiStatus(),
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    logger.error("health", "database check failed", serializeError(error));
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
