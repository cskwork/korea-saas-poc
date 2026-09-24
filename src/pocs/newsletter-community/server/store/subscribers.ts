import { and, asc, count, desc, eq, ilike, inArray, lte, max, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { postLikes, sends, subscribers } from "../../db/schema";
import type { SubscriberImportRow } from "../../domain/csv";
import { isPaidTier, type SubscriberStatus, type Tier } from "../../domain/tiers";
import { isUniqueViolation, type Db } from "./db";

export const SUBSCRIBER_SORTS = ["recent", "name", "opened"] as const;
export type SubscriberSort = (typeof SUBSCRIBER_SORTS)[number];

export interface SubscriberFilter {
  q?: string;
  tier?: Tier;
  status?: SubscriberStatus;
  sort?: SubscriberSort;
}

export const SUBSCRIBER_PAGE_SIZE = 50;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function filterWhere(workspaceId: string, filter: SubscriberFilter): SQL | undefined {
  const conditions: (SQL | undefined)[] = [eq(subscribers.workspaceId, workspaceId)];
  if (filter.tier) conditions.push(eq(subscribers.tier, filter.tier));
  if (filter.status) conditions.push(eq(subscribers.status, filter.status));
  const q = filter.q?.trim();
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push(or(ilike(subscribers.name, pattern), ilike(subscribers.email, pattern)));
  }
  return and(...conditions);
}

/** Subscribers matching a filter, with their latest (simulated) open, one page at a time. */
export async function listSubscribers(db: Db, workspaceId: string, filter: SubscriberFilter, now: Date, page = 1) {
  const lastOpened = db
    .select({ subscriberId: sends.subscriberId, openedAt: max(sends.openedAt).as("last_opened_at") })
    .from(sends)
    .where(and(eq(sends.workspaceId, workspaceId), lte(sends.openedAt, now)))
    .groupBy(sends.subscriberId)
    .as("last_opened");

  const where = filterWhere(workspaceId, filter);
  const order =
    filter.sort === "name"
      ? [asc(subscribers.name)]
      : filter.sort === "opened"
        ? [sql`${lastOpened.openedAt} desc nulls last`, asc(subscribers.name)]
        : [desc(subscribers.joinedOn), desc(subscribers.createdAt)];

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: subscribers.id,
        name: subscribers.name,
        email: subscribers.email,
        tier: subscribers.tier,
        status: subscribers.status,
        source: subscribers.source,
        joinedOn: subscribers.joinedOn,
        paidSince: subscribers.paidSince,
        unsubscribedOn: subscribers.unsubscribedOn,
        lastOpenedAt: lastOpened.openedAt,
      })
      .from(subscribers)
      .leftJoin(lastOpened, eq(lastOpened.subscriberId, subscribers.id))
      .where(where)
      .orderBy(...order)
      .limit(SUBSCRIBER_PAGE_SIZE)
      .offset((page - 1) * SUBSCRIBER_PAGE_SIZE),
    db.select({ total: count() }).from(subscribers).where(where),
  ]);
  return { rows, total };
}

export type SubscriberRow = Awaited<ReturnType<typeof listSubscribers>>["rows"][number];

export interface SubscriberCounts {
  total: number;
  active: number;
  unsubscribed: number;
  byTier: Record<Tier, number>;
}

/** Counts of the whole list; tier counts cover active subscribers only. */
export async function subscriberCounts(db: Db, workspaceId: string): Promise<SubscriberCounts> {
  const rows = await db
    .select({ tier: subscribers.tier, status: subscribers.status, n: count() })
    .from(subscribers)
    .where(eq(subscribers.workspaceId, workspaceId))
    .groupBy(subscribers.tier, subscribers.status);
  const counts: SubscriberCounts = { total: 0, active: 0, unsubscribed: 0, byTier: { free: 0, basic: 0, pro: 0 } };
  for (const row of rows) {
    counts.total += row.n;
    counts[row.status] += row.n;
    if (row.status === "active") counts.byTier[row.tier] += row.n;
  }
  return counts;
}

export async function subscribersForExport(db: Db, workspaceId: string, filter: SubscriberFilter) {
  return db
    .select({
      name: subscribers.name,
      email: subscribers.email,
      tier: subscribers.tier,
      status: subscribers.status,
      joinedOn: subscribers.joinedOn,
    })
    .from(subscribers)
    .where(filterWhere(workspaceId, filter))
    .orderBy(desc(subscribers.joinedOn), asc(subscribers.name));
}

export async function getSubscriber(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.id, id)))
    .limit(1);
  return row ?? null;
}

export interface SubscriberInput {
  name: string;
  email: string;
  tier: Tier;
}

export async function createSubscriber(
  db: Db,
  workspaceId: string,
  input: SubscriberInput & { source: "manual" | "signup" },
  today: string,
) {
  try {
    const [row] = await db
      .insert(subscribers)
      .values({
        workspaceId,
        name: input.name,
        email: input.email.toLowerCase(),
        tier: input.tier,
        source: input.source,
        joinedOn: today,
        paidSince: isPaidTier(input.tier) ? today : null,
      })
      .returning();
    return row;
  } catch (error) {
    if (isUniqueViolation(error)) throw new UserError("이미 명부에 있는 이메일이에요.");
    throw error;
  }
}

/**
 * Tier and status changes keep revenue history consistent: becoming paid starts
 * a paid stint today, becoming free ends it, and unsubscribing records the day.
 */
export function nextSubscriptionFacts(
  current: { tier: Tier; status: SubscriberStatus; paidSince: string | null; unsubscribedOn: string | null },
  next: { tier: Tier; status: SubscriberStatus },
  today: string,
) {
  const reactivated = current.status === "unsubscribed" && next.status === "active";
  const becamePaid = isPaidTier(next.tier) && (!isPaidTier(current.tier) || reactivated);
  const paidSince = !isPaidTier(next.tier) ? null : becamePaid ? today : current.paidSince ?? today;
  const unsubscribedOn =
    next.status === "active" ? null : current.status === "unsubscribed" ? current.unsubscribedOn ?? today : today;
  return { tier: next.tier, status: next.status, paidSince, unsubscribedOn };
}

export async function updateSubscriber(
  db: Db,
  workspaceId: string,
  id: string,
  input: SubscriberInput & { status: SubscriberStatus },
  today: string,
) {
  const current = await getSubscriber(db, workspaceId, id);
  if (!current) throw new UserError("구독자를 찾지 못했어요.");
  try {
    await db
      .update(subscribers)
      .set({
        name: input.name,
        email: input.email.toLowerCase(),
        ...nextSubscriptionFacts(current, input, today),
      })
      .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.id, id)));
  } catch (error) {
    if (isUniqueViolation(error)) throw new UserError("이미 명부에 있는 이메일이에요.");
    throw error;
  }
}

/** Quick tier/status change from the list (keeps name and email). */
export async function changeSubscription(
  db: Db,
  workspaceId: string,
  id: string,
  next: { tier?: Tier; status?: SubscriberStatus },
  today: string,
) {
  const current = await getSubscriber(db, workspaceId, id);
  if (!current) throw new UserError("구독자를 찾지 못했어요.");
  const facts = nextSubscriptionFacts(
    current,
    { tier: next.tier ?? current.tier, status: next.status ?? current.status },
    today,
  );
  await db
    .update(subscribers)
    .set(facts)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.id, id)));
  return { ...current, ...facts };
}

export async function deleteSubscriber(db: Db, workspaceId: string, id: string) {
  await db.transaction(async (tx) => {
    const deleted = await tx
      .delete(subscribers)
      .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.id, id)))
      .returning({ id: subscribers.id });
    if (deleted.length === 0) throw new UserError("구독자를 찾지 못했어요.");
    await tx.delete(postLikes).where(and(eq(postLikes.workspaceId, workspaceId), eq(postLikes.likerKey, id)));
  });
}

/** Adds imported rows; emails already on the list are skipped, never overwritten. */
export async function importSubscribers(db: Db, workspaceId: string, rows: readonly SubscriberImportRow[], today: string) {
  if (rows.length === 0) return { added: 0, skipped: 0 };
  const existing = await db
    .select({ email: subscribers.email })
    .from(subscribers)
    .where(
      and(
        eq(subscribers.workspaceId, workspaceId),
        inArray(
          subscribers.email,
          rows.map((row) => row.email),
        ),
      ),
    );
  const known = new Set(existing.map((row) => row.email));
  const fresh = rows.filter((row) => !known.has(row.email));
  if (fresh.length > 0) {
    await db
      .insert(subscribers)
      .values(
        fresh.map((row) => {
          const joinedOn = row.joinedOn && row.joinedOn <= today ? row.joinedOn : today;
          return {
            workspaceId,
            name: row.name,
            email: row.email,
            tier: row.tier,
            status: row.status,
            source: "import" as const,
            joinedOn,
            paidSince: isPaidTier(row.tier) ? joinedOn : null,
            unsubscribedOn: row.status === "unsubscribed" ? today : null,
          };
        }),
      )
      .onConflictDoNothing();
  }
  return { added: fresh.length, skipped: rows.length - fresh.length };
}

/**
 * The public subscribe form. A new email joins the list; a known email is
 * reactivated and moved to the chosen tier when that is an upgrade.
 */
export async function signUp(db: Db, workspaceId: string, input: SubscriberInput, today: string) {
  const email = input.email.toLowerCase();
  const [existing] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.email, email)))
    .limit(1);
  if (!existing) {
    const created = await createSubscriber(db, workspaceId, { ...input, email, source: "signup" }, today);
    return { subscriber: created, created: true };
  }
  const rank: Record<Tier, number> = { free: 0, basic: 1, pro: 2 };
  const tier = rank[input.tier] > rank[existing.tier] || existing.status === "unsubscribed" ? input.tier : existing.tier;
  const facts = nextSubscriptionFacts(existing, { tier, status: "active" }, today);
  await db
    .update(subscribers)
    .set(facts)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.id, existing.id)));
  return { subscriber: { ...existing, ...facts }, created: false };
}

/** The earliest-joined active subscriber of a tier (the demo's "read as a member" shortcut). */
export async function longestStandingMember(db: Db, workspaceId: string, tier: Tier) {
  const [row] = await db
    .select({ id: subscribers.id, name: subscribers.name })
    .from(subscribers)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.tier, tier), eq(subscribers.status, "active")))
    .orderBy(asc(subscribers.joinedOn), asc(subscribers.name))
    .limit(1);
  return row ?? null;
}
