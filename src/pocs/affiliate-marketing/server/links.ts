import "server-only";
import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { clicks, conversions, links, programs } from "../db/schema";
import type { LinkStatus } from "../domain/catalog";
import { generateCode } from "../domain/codes";
import type { CreateLinkInput, UpdateLinkInput } from "../domain/inputs";
import { conversionRate, earningsPerClick } from "../domain/metrics";
import { isUniqueViolation, type Db } from "./db";

/** Links: list with lifetime totals, lookup, and mutations. All scoped by workspace. */

export const LINK_SORTS = ["revenue", "clicks", "cvr", "epc", "newest", "name"] as const;
export type LinkSort = (typeof LINK_SORTS)[number];

export interface LinkFilters {
  q?: string;
  programId?: string;
  status?: LinkStatus;
  category?: string;
  sort?: LinkSort;
}

const linkColumns = {
  id: links.id,
  code: links.code,
  productName: links.productName,
  category: links.category,
  destinationUrl: links.destinationUrl,
  priceWon: links.priceWon,
  commissionType: links.commissionType,
  commissionRateBp: links.commissionRateBp,
  commissionFixedWon: links.commissionFixedWon,
  status: links.status,
  memo: links.memo,
  createdAt: links.createdAt,
  updatedAt: links.updatedAt,
  programId: links.programId,
  programName: programs.name,
  programModel: programs.model,
};

export async function getLink(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .select(linkColumns)
    .from(links)
    .leftJoin(programs, eq(programs.id, links.programId))
    .where(and(eq(links.workspaceId, workspaceId), eq(links.id, id)))
    .limit(1);
  return row ?? null;
}

/** Lifetime clicks, orders and commission per link (cancelled orders excluded). */
async function lifetimeTotals(db: Db, workspaceId: string) {
  const [clickRows, conversionRows] = await Promise.all([
    db
      .select({ linkId: clicks.linkId, clicks: sql<number>`count(*)::int`.mapWith(Number) })
      .from(clicks)
      .where(eq(clicks.workspaceId, workspaceId))
      .groupBy(clicks.linkId),
    db
      .select({
        linkId: conversions.linkId,
        conversions: sql<number>`count(*)::int`.mapWith(Number),
        revenue: sql<number>`coalesce(sum(${conversions.commissionWon}), 0)::bigint`.mapWith(Number),
      })
      .from(conversions)
      .where(and(eq(conversions.workspaceId, workspaceId), ne(conversions.status, "cancelled")))
      .groupBy(conversions.linkId),
  ]);
  return {
    clicks: new Map(clickRows.map((r) => [r.linkId, r.clicks])),
    conversions: new Map(conversionRows.map((r) => [r.linkId, r])),
  };
}

export async function listLinks(db: Db, workspaceId: string, filters: LinkFilters = {}) {
  const conditions = [eq(links.workspaceId, workspaceId)];
  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(or(ilike(links.productName, pattern), ilike(links.code, pattern), ilike(links.memo, pattern))!);
  }
  if (filters.programId) conditions.push(eq(links.programId, filters.programId));
  if (filters.status) conditions.push(eq(links.status, filters.status));
  if (filters.category) conditions.push(eq(links.category, filters.category));

  const [rows, totals] = await Promise.all([
    db
      .select(linkColumns)
      .from(links)
      .leftJoin(programs, eq(programs.id, links.programId))
      .where(and(...conditions))
      .orderBy(desc(links.createdAt)),
    lifetimeTotals(db, workspaceId),
  ]);

  const enriched = rows.map((row) => {
    const clickCount = totals.clicks.get(row.id) ?? 0;
    const conv = totals.conversions.get(row.id);
    const revenue = conv?.revenue ?? 0;
    const orders = conv?.conversions ?? 0;
    return { ...row, clicks: clickCount, conversions: orders, revenue, cvr: conversionRate(orders, clickCount), epc: earningsPerClick(revenue, clickCount) };
  });

  const sort = filters.sort ?? "revenue";
  const compare: Record<LinkSort, (a: (typeof enriched)[number], b: (typeof enriched)[number]) => number> = {
    revenue: (a, b) => b.revenue - a.revenue || b.clicks - a.clicks,
    clicks: (a, b) => b.clicks - a.clicks,
    cvr: (a, b) => b.cvr - a.cvr || b.clicks - a.clicks,
    epc: (a, b) => b.epc - a.epc || b.clicks - a.clicks,
    newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    name: (a, b) => a.productName.localeCompare(b.productName, "ko"),
  };
  return enriched.sort(compare[sort]);
}

export type LinkListRow = Awaited<ReturnType<typeof listLinks>>[number];

export async function linkCounts(db: Db, workspaceId: string) {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`.mapWith(Number),
      active: sql<number>`count(*) filter (where ${links.status} = 'active')::int`.mapWith(Number),
    })
    .from(links)
    .where(eq(links.workspaceId, workspaceId));
  return { total: row?.total ?? 0, active: row?.active ?? 0 };
}

/** Minimal options for link pickers (content, SNS, order forms). */
export async function linkOptions(db: Db, workspaceId: string) {
  return db
    .select({
      id: links.id,
      code: links.code,
      productName: links.productName,
      category: links.category,
      priceWon: links.priceWon,
      status: links.status,
      commissionType: links.commissionType,
      commissionRateBp: links.commissionRateBp,
      commissionFixedWon: links.commissionFixedWon,
      programName: programs.name,
    })
    .from(links)
    .leftJoin(programs, eq(programs.id, links.programId))
    .where(eq(links.workspaceId, workspaceId))
    .orderBy(asc(links.productName));
}

export type LinkOption = Awaited<ReturnType<typeof linkOptions>>[number];

async function assertProgram(db: Db, workspaceId: string, programId: string | null) {
  if (!programId) return;
  const [row] = await db
    .select({ id: programs.id })
    .from(programs)
    .where(and(eq(programs.workspaceId, workspaceId), eq(programs.id, programId)))
    .limit(1);
  if (!row) throw new UserError("선택한 제휴 프로그램을 찾을 수 없어요.");
}

function termsFrom(input: Pick<CreateLinkInput, "commissionType" | "commissionRate" | "commissionFixed">) {
  return {
    commissionType: input.commissionType,
    commissionRateBp: input.commissionType === "percent" ? input.commissionRate : 0,
    commissionFixedWon: input.commissionType === "fixed" ? (input.commissionFixed ?? 0) : 0,
  };
}

export async function createLink(db: Db, workspaceId: string, input: CreateLinkInput, makeCode: () => string = generateCode) {
  await assertProgram(db, workspaceId, input.programId);
  const values = {
    workspaceId,
    programId: input.programId,
    productName: input.productName,
    category: input.category,
    destinationUrl: input.destinationUrl,
    priceWon: input.priceWon,
    memo: input.memo,
    ...termsFrom(input),
  };
  // Codes are global; a generated code collides rarely, so retry a few times.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = input.code ?? makeCode();
    try {
      const [row] = await db.insert(links).values({ ...values, code }).returning({ id: links.id, code: links.code });
      return row;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      if (input.code) throw new UserError("이미 사용 중인 코드예요. 다른 코드를 입력하거나 비워 두세요.");
    }
  }
  throw new UserError("짧은 코드를 만들지 못했어요. 다시 시도해 주세요.");
}

export async function updateLink(db: Db, workspaceId: string, input: UpdateLinkInput) {
  await assertProgram(db, workspaceId, input.programId);
  const [row] = await db
    .update(links)
    .set({
      programId: input.programId,
      productName: input.productName,
      category: input.category,
      destinationUrl: input.destinationUrl,
      priceWon: input.priceWon,
      memo: input.memo,
      status: input.status,
      ...termsFrom(input),
      updatedAt: new Date(),
    })
    .where(and(eq(links.workspaceId, workspaceId), eq(links.id, input.id)))
    .returning({ id: links.id });
  return row ?? null;
}

export async function setLinkStatus(db: Db, workspaceId: string, id: string, status: LinkStatus) {
  const [row] = await db
    .update(links)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(links.workspaceId, workspaceId), eq(links.id, id)))
    .returning({ id: links.id });
  return row ?? null;
}

/** Deletes the link with its clicks and orders (cascade). */
export async function deleteLink(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .delete(links)
    .where(and(eq(links.workspaceId, workspaceId), eq(links.id, id)))
    .returning({ id: links.id, productName: links.productName });
  return row ?? null;
}
