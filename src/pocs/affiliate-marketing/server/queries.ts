import "server-only";
import { cache } from "react";
import { siteUrl } from "@/core/env";
import { seoulDateKey } from "@/core/format";
import { getModuleContext } from "@/core/modules/context";
import { affiliateMarketing } from "../module";
import { CONVERSION_PAGE_SIZE, type ConversionStatus, type LinkStatus } from "../domain/catalog";
import { addDays, monthEnd, monthStart } from "../domain/dates";
import { getArticle, listArticles, listSocialPosts } from "./content";
import { conversionSummary, listConversions } from "./conversions";
import { getLink, linkCounts, linkOptions, listLinks, type LinkSort } from "./links";
import { getProgram, listPrograms } from "./programs";
import { analyticsReport, dashboardReport, linkReport, programReport, type Period } from "./reports";

/** Reads for the route files. Each resolves the visitor's workspace (seeding it on first visit). */

const context = cache(() => getModuleContext(affiliateMarketing));

/** Absolute origin for tracked short links shown in the UI. */
export const shortLinkOrigin = () => siteUrl();

export async function getDashboard() {
  const { db, workspaceId } = await context();
  return dashboardReport(db, workspaceId, seoulDateKey());
}

export async function getAnalytics(days: Period) {
  const { db, workspaceId } = await context();
  return analyticsReport(db, workspaceId, seoulDateKey(), days);
}

export async function getLinks(filters: { q?: string; programId?: string; status?: LinkStatus; category?: string; sort?: LinkSort }) {
  const { db, workspaceId } = await context();
  const [rows, programs, counts] = await Promise.all([listLinks(db, workspaceId, filters), listPrograms(db, workspaceId), linkCounts(db, workspaceId)]);
  return { rows, programs, ...counts };
}

export async function getLinkDetail(id: string) {
  const { db, workspaceId } = await context();
  const [report, programs] = await Promise.all([linkReport(db, workspaceId, id, seoulDateKey()), listPrograms(db, workspaceId)]);
  return report ? { ...report, programs, today: seoulDateKey() } : null;
}

export async function getLinkName(id: string) {
  const { db, workspaceId } = await context();
  return (await getLink(db, workspaceId, id))?.productName ?? null;
}

export async function getNewLinkForm() {
  const { db, workspaceId } = await context();
  return { programs: await listPrograms(db, workspaceId) };
}

export async function getConversions(filters: { status?: ConversionStatus; month: string; programId?: string; linkId?: string; pages: number }) {
  const { db, workspaceId } = await context();
  const from = monthStart(filters.month);
  const to = monthEnd(filters.month);
  const limit = CONVERSION_PAGE_SIZE * filters.pages;
  const scope = { linkId: filters.linkId, programId: filters.programId };
  const [rows, summary, options, programs] = await Promise.all([
    listConversions(db, workspaceId, { status: filters.status, from, to, ...scope, limit: limit + 1 }),
    conversionSummary(db, workspaceId, from, to, scope),
    linkOptions(db, workspaceId),
    listPrograms(db, workspaceId),
  ]);
  return { rows: rows.slice(0, limit), hasMore: rows.length > limit, summary, options, programs, today: seoulDateKey() };
}

export async function getContentHome() {
  const { db, workspaceId } = await context();
  const [articles, options] = await Promise.all([listArticles(db, workspaceId), linkOptions(db, workspaceId)]);
  return { articles, options };
}

export const getArticleDetail = cache(async (id: string) => {
  const { db, workspaceId } = await context();
  return getArticle(db, workspaceId, id);
});

export async function getSocialHome() {
  const { db, workspaceId } = await context();
  const [posts, options] = await Promise.all([listSocialPosts(db, workspaceId), linkOptions(db, workspaceId)]);
  return { posts, options };
}

export async function getProgramComparison() {
  const { db, workspaceId } = await context();
  return programReport(db, workspaceId, seoulDateKey());
}

export const getProgramDetail = cache(async (id: string) => {
  const { db, workspaceId } = await context();
  return getProgram(db, workspaceId, id);
});

/** Month keys ("YYYY-MM-01") for the last `count` months, newest first. */
export function recentMonths(count = 6): string[] {
  const today = seoulDateKey();
  const months: string[] = [];
  let cursor = monthStart(today);
  for (let i = 0; i < count; i += 1) {
    months.push(cursor);
    cursor = monthStart(addDays(cursor, -1));
  }
  return months;
}
