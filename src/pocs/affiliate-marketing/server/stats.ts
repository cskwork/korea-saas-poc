import "server-only";
import { and, desc, eq, gte, lt, lte, ne, sql, type SQL } from "drizzle-orm";
import { clicks, conversions, links, programs } from "../db/schema";
import type { Channel, Device } from "../domain/catalog";
import { seoulRange } from "../domain/dates";
import type { Db } from "./db";

/**
 * Aggregations over click and order rows for a Seoul day range [from, to].
 * Revenue is commission from orders that were not cancelled.
 */

export interface Range {
  from: string;
  to: string;
  linkId?: string;
}

const count = sql<number>`count(*)::int`.mapWith(Number);
const revenue = sql<number>`coalesce(sum(${conversions.commissionWon}), 0)::bigint`.mapWith(Number);
const clickDay = sql<string>`to_char(${clicks.clickedAt} at time zone 'Asia/Seoul', 'YYYY-MM-DD')`;
const clickHour = sql<number>`extract(hour from ${clicks.clickedAt} at time zone 'Asia/Seoul')::int`.mapWith(Number);

function clickWhere(workspaceId: string, range: Range): SQL {
  const { start, end } = seoulRange(range.from, range.to);
  return and(
    eq(clicks.workspaceId, workspaceId),
    gte(clicks.clickedAt, start),
    lt(clicks.clickedAt, end),
    range.linkId ? eq(clicks.linkId, range.linkId) : undefined,
  )!;
}

function conversionWhere(workspaceId: string, range: Range): SQL {
  return and(
    eq(conversions.workspaceId, workspaceId),
    gte(conversions.orderedOn, range.from),
    lte(conversions.orderedOn, range.to),
    ne(conversions.status, "cancelled"),
    range.linkId ? eq(conversions.linkId, range.linkId) : undefined,
  )!;
}

export async function clicksByDay(db: Db, workspaceId: string, range: Range) {
  return db.select({ day: clickDay, clicks: count }).from(clicks).where(clickWhere(workspaceId, range)).groupBy(clickDay);
}

export async function conversionsByDay(db: Db, workspaceId: string, range: Range) {
  return db
    .select({ day: conversions.orderedOn, conversions: count, revenue })
    .from(conversions)
    .where(conversionWhere(workspaceId, range))
    .groupBy(conversions.orderedOn);
}

export async function clicksByLink(db: Db, workspaceId: string, range: Range) {
  return db
    .select({ key: clicks.linkId, clicks: count })
    .from(clicks)
    .where(clickWhere(workspaceId, range))
    .groupBy(clicks.linkId);
}

export async function conversionsByLink(db: Db, workspaceId: string, range: Range) {
  return db
    .select({ key: conversions.linkId, conversions: count, revenue })
    .from(conversions)
    .where(conversionWhere(workspaceId, range))
    .groupBy(conversions.linkId);
}

export async function clicksByChannel(db: Db, workspaceId: string, range: Range) {
  return db
    .select({ key: sql<Channel>`${clicks.channel}`, clicks: count })
    .from(clicks)
    .where(clickWhere(workspaceId, range))
    .groupBy(clicks.channel);
}

/** Orders by the channel the marketer attributed them to (unattributed orders are skipped). */
export async function conversionsByChannel(db: Db, workspaceId: string, range: Range) {
  const rows = await db
    .select({ key: conversions.channel, conversions: count, revenue })
    .from(conversions)
    .where(conversionWhere(workspaceId, range))
    .groupBy(conversions.channel);
  return rows.filter((r): r is { key: Channel; conversions: number; revenue: number } => r.key != null);
}

export async function clicksByHour(db: Db, workspaceId: string, range: Range) {
  return db.select({ hour: clickHour, clicks: count }).from(clicks).where(clickWhere(workspaceId, range)).groupBy(clickHour);
}

export async function clicksByDevice(db: Db, workspaceId: string, range: Range) {
  return db
    .select({ key: sql<Device>`${clicks.device}`, clicks: count })
    .from(clicks)
    .where(clickWhere(workspaceId, range))
    .groupBy(clicks.device);
}

/** Link metadata for joining breakdowns by link, program and category. */
export async function linkIndex(db: Db, workspaceId: string) {
  return db
    .select({
      id: links.id,
      code: links.code,
      productName: links.productName,
      category: links.category,
      status: links.status,
      programId: links.programId,
      programName: programs.name,
    })
    .from(links)
    .leftJoin(programs, eq(programs.id, links.programId))
    .where(eq(links.workspaceId, workspaceId));
}

export type LinkIndexRow = Awaited<ReturnType<typeof linkIndex>>[number];

/** Latest clicks with their product (the "scan tape"). */
export async function recentClicks(db: Db, workspaceId: string, limit = 10, linkId?: string) {
  return db
    .select({
      id: clicks.id,
      clickedAt: clicks.clickedAt,
      channel: clicks.channel,
      device: clicks.device,
      referrerHost: clicks.referrerHost,
      linkId: clicks.linkId,
      productName: links.productName,
      code: links.code,
    })
    .from(clicks)
    .innerJoin(links, eq(links.id, clicks.linkId))
    .where(and(eq(clicks.workspaceId, workspaceId), linkId ? eq(clicks.linkId, linkId) : undefined))
    .orderBy(desc(clicks.clickedAt))
    .limit(limit);
}

export type RecentClick = Awaited<ReturnType<typeof recentClicks>>[number];
