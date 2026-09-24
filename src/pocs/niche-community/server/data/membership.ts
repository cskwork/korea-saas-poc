import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { members, membershipChanges, payments } from "../../db/schema";
import { chargesFor, currentPeriod } from "../../domain/billing";
import { PREMIUM_PRICE_WON, tierChangeProblem, type TierChange, type Viewer } from "../../domain/rules";
import { seoulDateKey } from "../../domain/time";
import type { Db } from "./db";

/**
 * Simulated billing. Nothing is charged: an upgrade writes a payment row for its first
 * period, and renewals are settled lazily (idempotently) whenever billing data is read.
 */
export async function settleRenewals(db: Db, workspaceId: string, now: Date): Promise<number> {
  const premium = await db
    .select({ id: members.id, premiumSince: members.premiumSince })
    .from(members)
    .where(
      and(
        eq(members.workspaceId, workspaceId),
        eq(members.role, "member"),
        eq(members.tier, "premium"),
        isNotNull(members.premiumSince),
      ),
    );
  const today = seoulDateKey(now);
  const rows = premium.flatMap((member) =>
    member.premiumSince
      ? chargesFor(member.premiumSince, today, now).map((charge) => ({
          workspaceId,
          memberId: member.id,
          amountWon: PREMIUM_PRICE_WON,
          ...charge,
        }))
      : [],
  );
  if (rows.length === 0) return 0;
  const inserted = await db
    .insert(payments)
    .values(rows)
    .onConflictDoNothing({ target: [payments.memberId, payments.periodStart] })
    .returning({ id: payments.id });
  return inserted.length;
}

/** Upgrades or downgrades the acting member and records the change (and the first charge). */
export async function changeTier(db: Db, workspaceId: string, viewer: Viewer, change: TierChange, now: Date) {
  const problem = tierChangeProblem(viewer, change);
  if (problem) throw new UserError(problem);
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(members)
      .set(change === "upgrade" ? { tier: "premium", premiumSince: now } : { tier: "free", premiumSince: null })
      .where(and(eq(members.id, viewer.id), eq(members.workspaceId, workspaceId)))
      .returning({ id: members.id });
    if (updated.length === 0) throw new UserError("멤버를 찾을 수 없어요.");
    await tx.insert(membershipChanges).values({ workspaceId, memberId: viewer.id, kind: change, occurredAt: now });
    if (change === "upgrade") {
      const [first] = chargesFor(now, seoulDateKey(now), now);
      await tx
        .insert(payments)
        .values({ workspaceId, memberId: viewer.id, amountWon: PREMIUM_PRICE_WON, ...first })
        .onConflictDoNothing({ target: [payments.memberId, payments.periodStart] });
    }
  });
}

export async function loadMembership(db: Db, workspaceId: string, memberId: string, now: Date) {
  await settleRenewals(db, workspaceId, now);
  const [member] = await db
    .select({ tier: members.tier, role: members.role, premiumSince: members.premiumSince })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.workspaceId, workspaceId)))
    .limit(1);
  if (!member) return null;
  const [history, changes] = await Promise.all([
    db
      .select({
        id: payments.id,
        amountWon: payments.amountWon,
        periodStart: payments.periodStart,
        periodEnd: payments.periodEnd,
        paidAt: payments.paidAt,
      })
      .from(payments)
      .where(and(eq(payments.memberId, memberId), eq(payments.workspaceId, workspaceId)))
      .orderBy(desc(payments.paidAt)),
    db
      .select({ id: membershipChanges.id, kind: membershipChanges.kind, occurredAt: membershipChanges.occurredAt })
      .from(membershipChanges)
      .where(and(eq(membershipChanges.memberId, memberId), eq(membershipChanges.workspaceId, workspaceId)))
      .orderBy(desc(membershipChanges.occurredAt)),
  ]);
  const period =
    member.tier === "premium" && member.premiumSince ? currentPeriod(seoulDateKey(member.premiumSince), seoulDateKey(now)) : null;
  return { ...member, period, payments: history, changes };
}

/** The operator's ledger: latest tier changes and payments across the community. */
export async function loadLedger(db: Db, workspaceId: string, limit = 12) {
  const [changes, charges] = await Promise.all([
    db
      .select({
        id: membershipChanges.id,
        kind: membershipChanges.kind,
        at: membershipChanges.occurredAt,
        memberId: members.id,
        nickname: members.nickname,
      })
      .from(membershipChanges)
      .innerJoin(members, eq(members.id, membershipChanges.memberId))
      .where(eq(membershipChanges.workspaceId, workspaceId))
      .orderBy(desc(membershipChanges.occurredAt))
      .limit(limit),
    db
      .select({
        id: payments.id,
        amountWon: payments.amountWon,
        at: payments.paidAt,
        periodStart: payments.periodStart,
        memberId: members.id,
        nickname: members.nickname,
      })
      .from(payments)
      .innerJoin(members, eq(members.id, payments.memberId))
      .where(eq(payments.workspaceId, workspaceId))
      .orderBy(desc(payments.paidAt))
      .limit(limit),
  ]);
  return { changes, charges };
}
