import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { conversions, links, programs } from "../db/schema";
import { CONVERSION_STATUSES, type ConversionStatus } from "../domain/catalog";
import { computeCommission } from "../domain/commission";
import type { RecordConversionInput } from "../domain/inputs";
import type { Db } from "./db";

/** Orders (conversions): manual entry, status workflow and monthly summaries. */

export interface ConversionFilters {
  status?: ConversionStatus;
  from?: string;
  to?: string;
  linkId?: string;
  programId?: string;
  limit?: number;
}

export async function listConversions(db: Db, workspaceId: string, filters: ConversionFilters = {}) {
  const conditions = [eq(conversions.workspaceId, workspaceId)];
  if (filters.status) conditions.push(eq(conversions.status, filters.status));
  if (filters.from) conditions.push(gte(conversions.orderedOn, filters.from));
  if (filters.to) conditions.push(lte(conversions.orderedOn, filters.to));
  if (filters.linkId) conditions.push(eq(conversions.linkId, filters.linkId));
  if (filters.programId) conditions.push(eq(links.programId, filters.programId));
  return db
    .select({
      id: conversions.id,
      linkId: conversions.linkId,
      orderedOn: conversions.orderedOn,
      orderAmountWon: conversions.orderAmountWon,
      commissionWon: conversions.commissionWon,
      commissionOverridden: conversions.commissionOverridden,
      status: conversions.status,
      channel: conversions.channel,
      note: conversions.note,
      productName: links.productName,
      code: links.code,
      programName: programs.name,
    })
    .from(conversions)
    .innerJoin(links, eq(links.id, conversions.linkId))
    .leftJoin(programs, eq(programs.id, links.programId))
    .where(and(...conditions))
    .orderBy(desc(conversions.orderedOn), desc(conversions.createdAt))
    .limit(filters.limit ?? 200);
}

export type ConversionRow = Awaited<ReturnType<typeof listConversions>>[number];

/** Count and commission per status over a day range (optionally one link or program). */
export async function conversionSummary(
  db: Db,
  workspaceId: string,
  from: string,
  to: string,
  scope: { linkId?: string; programId?: string } = {},
) {
  const rows = await db
    .select({
      status: conversions.status,
      count: sql<number>`count(*)::int`.mapWith(Number),
      commission: sql<number>`coalesce(sum(${conversions.commissionWon}), 0)::bigint`.mapWith(Number),
      orders: sql<number>`coalesce(sum(${conversions.orderAmountWon}), 0)::bigint`.mapWith(Number),
    })
    .from(conversions)
    .innerJoin(links, eq(links.id, conversions.linkId))
    .where(
      and(
        eq(conversions.workspaceId, workspaceId),
        gte(conversions.orderedOn, from),
        lte(conversions.orderedOn, to),
        scope.linkId ? eq(conversions.linkId, scope.linkId) : undefined,
        scope.programId ? eq(links.programId, scope.programId) : undefined,
      ),
    )
    .groupBy(conversions.status);
  return Object.fromEntries(
    CONVERSION_STATUSES.map((status) => {
      const row = rows.find((r) => r.status === status);
      return [status, { count: row?.count ?? 0, commission: row?.commission ?? 0, orders: row?.orders ?? 0 }];
    }),
  ) as Record<ConversionStatus, { count: number; commission: number; orders: number }>;
}

export async function recordConversion(db: Db, workspaceId: string, input: RecordConversionInput) {
  const [link] = await db
    .select({ id: links.id, commissionType: links.commissionType, commissionRateBp: links.commissionRateBp, commissionFixedWon: links.commissionFixedWon })
    .from(links)
    .where(and(eq(links.workspaceId, workspaceId), eq(links.id, input.linkId)))
    .limit(1);
  if (!link) throw new UserError("판매를 기록할 링크를 찾을 수 없어요.");

  const commissionWon = input.commissionOverride ?? computeCommission(link, input.orderAmount);
  const [row] = await db
    .insert(conversions)
    .values({
      workspaceId,
      linkId: link.id,
      orderedOn: input.orderedOn,
      orderAmountWon: input.orderAmount,
      commissionWon,
      commissionOverridden: input.commissionOverride != null,
      status: input.status,
      channel: input.channel,
      note: input.note,
    })
    .returning({ id: conversions.id, commissionWon: conversions.commissionWon });
  return row;
}

export async function setConversionStatus(db: Db, workspaceId: string, id: string, status: ConversionStatus) {
  const [row] = await db
    .update(conversions)
    .set({ status })
    .where(and(eq(conversions.workspaceId, workspaceId), eq(conversions.id, id)))
    .returning({ id: conversions.id });
  return row ?? null;
}

export async function deleteConversion(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .delete(conversions)
    .where(and(eq(conversions.workspaceId, workspaceId), eq(conversions.id, id)))
    .returning({ id: conversions.id });
  return row ?? null;
}
