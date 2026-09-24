import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { getDb, platformSchema } from "@/core/db";
import { FALLBACK_WORKSPACE_ID, WORKSPACE_COOKIE, isWorkspaceId } from "./constants";

export { WORKSPACE_COOKIE } from "./constants";

/** The current visitor's workspace id (the tenant every module scopes its data to). */
export const getWorkspaceId = cache(async (): Promise<string> => {
  const value = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  return isWorkspaceId(value) ? value.toLowerCase() : FALLBACK_WORKSPACE_ID;
});

/**
 * Makes sure the workspace row exists and refreshes `last_seen_at` at most once
 * an hour (so idle workspaces can be purged without a write on every request).
 */
export const ensureWorkspace = cache(async (): Promise<string> => {
  const workspaceId = await getWorkspaceId();
  const db = await getDb(platformSchema);
  const { workspaces } = platformSchema;
  await db
    .insert(workspaces)
    .values({ id: workspaceId })
    .onConflictDoUpdate({
      target: workspaces.id,
      set: { lastSeenAt: sql`now()` },
      setWhere: sql`${workspaces.lastSeenAt} < now() - interval '1 hour'`,
    });
  return workspaceId;
});
