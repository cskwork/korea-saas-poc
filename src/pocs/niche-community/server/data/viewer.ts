import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { members, posts, settings } from "../../db/schema";
import type { Db } from "./db";
import type { ViewerInfo } from "../types";

const viewerColumns = {
  id: members.id,
  nickname: members.nickname,
  headline: members.headline,
  bio: members.bio,
  role: members.role,
  tier: members.tier,
  joinedAt: members.joinedAt,
  premiumSince: members.premiumSince,
};

/**
 * The demo persona the visitor is acting as (their 명찰). Falls back to the operator
 * when nothing is set or the member was deleted.
 */
export async function loadViewer(db: Db, workspaceId: string): Promise<ViewerInfo> {
  const [acting] = await db
    .select(viewerColumns)
    .from(settings)
    .innerJoin(members, and(eq(members.id, settings.actingMemberId), eq(members.workspaceId, workspaceId)))
    .where(eq(settings.workspaceId, workspaceId))
    .limit(1);
  if (acting) return acting;

  const [operator] = await db
    .select(viewerColumns)
    .from(members)
    .where(and(eq(members.workspaceId, workspaceId), eq(members.role, "operator")))
    .orderBy(asc(members.joinedAt))
    .limit(1);
  if (!operator) throw new Error("niche-community: workspace has no operator");
  return operator;
}

/** Switches the demo persona. Only members of this workspace can be worn. */
export async function switchPersona(db: Db, workspaceId: string, memberId: string): Promise<ViewerInfo> {
  const [member] = await db
    .select(viewerColumns)
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.workspaceId, workspaceId)))
    .limit(1);
  if (!member) throw new UserError("해당 멤버를 찾을 수 없어요.");
  await db
    .insert(settings)
    .values({ workspaceId, actingMemberId: member.id })
    .onConflictDoUpdate({ target: settings.workspaceId, set: { actingMemberId: member.id, updatedAt: new Date() } });
  return member;
}

/** Name tags offered in the persona switch: the operator, then the most active sample members of each tier. */
export async function loadPersonaOptions(db: Db, workspaceId: string) {
  const rows = await db
    .select({ id: members.id, nickname: members.nickname, headline: members.headline, role: members.role, tier: members.tier })
    .from(members)
    .leftJoin(posts, eq(posts.authorId, members.id))
    .where(eq(members.workspaceId, workspaceId))
    .groupBy(members.id)
    .orderBy(desc(count(posts.id)), asc(members.joinedAt));
  const operator = rows.filter((row) => row.role === "operator");
  const premium = rows.filter((row) => row.role === "member" && row.tier === "premium").slice(0, 3);
  const free = rows.filter((row) => row.role === "member" && row.tier === "free").slice(0, 3);
  return [...operator, ...premium, ...free];
}
