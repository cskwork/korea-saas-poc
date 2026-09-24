import "server-only";
import { and, eq, ne, sql } from "drizzle-orm";
import { conversions, links } from "../db/schema";
import { CATEGORIES, DEVICES, type Channel, type Device } from "../domain/catalog";
import { addDays, daysInMonth, monthStart, shiftMonth } from "../domain/dates";
import {
  breakdown,
  conversionRate,
  delta,
  earningsPerClick,
  fillDailySeries,
  goalProgress,
  hourlyBuckets,
  peakWindow,
  sumSeries,
  type Breakdown,
  type Totals,
} from "../domain/metrics";
import { conversionSummary, listConversions } from "./conversions";
import type { Db } from "./db";
import { getLink } from "./links";
import { listPrograms } from "./programs";
import { getMonthlyGoal } from "./settings";
import {
  clicksByChannel,
  clicksByDay,
  clicksByDevice,
  clicksByHour,
  clicksByLink,
  conversionsByChannel,
  conversionsByDay,
  conversionsByLink,
  linkIndex,
  recentClicks,
  type LinkIndexRow,
  type Range,
} from "./stats";

/**
 * Screen-level reports assembled from row aggregates and the pure metrics in
 * `domain/metrics`. Every function takes `today` (a Seoul day key) so tests can pin it.
 */

async function series(db: Db, workspaceId: string, range: Range) {
  const [clickRows, conversionRows] = await Promise.all([clicksByDay(db, workspaceId, range), conversionsByDay(db, workspaceId, range)]);
  return fillDailySeries(clickRows, conversionRows, range.from, range.to);
}

function withRates(totals: Totals) {
  return { ...totals, cvr: conversionRate(totals.conversions, totals.clicks), epc: earningsPerClick(totals.revenue, totals.clicks) };
}

async function linkBreakdown(db: Db, workspaceId: string, range: Range, index: LinkIndexRow[]) {
  const [clickRows, conversionRows] = await Promise.all([clicksByLink(db, workspaceId, range), conversionsByLink(db, workspaceId, range)]);
  const meta = new Map(index.map((l) => [l.id, l]));
  return breakdown(clickRows, conversionRows)
    .filter((row) => meta.has(row.key))
    .map((row) => ({ ...row, link: meta.get(row.key)! }));
}

export type LinkPerformance = Awaited<ReturnType<typeof linkBreakdown>>[number];

/** Rolls per-link rows up to any attribute of the link (program, category). */
function rollUp<K extends string>(rows: LinkPerformance[], keyOf: (row: LinkPerformance) => K, keys: readonly K[] = []): Breakdown<K>[] {
  return breakdown(
    rows.map((r) => ({ key: keyOf(r), clicks: r.clicks })),
    rows.map((r) => ({ key: keyOf(r), conversions: r.conversions, revenue: r.revenue })),
    keys,
  );
}

/** Label for links without a program (charts give it the neutral slot). */
export const UNASSIGNED = "프로그램 미지정";

export async function dashboardReport(db: Db, workspaceId: string, today: string) {
  const monthFrom = monthStart(today);
  const day = Number(today.slice(8, 10));
  const prevFrom = shiftMonth(today, -1);
  const prevTo = addDays(prevFrom, Math.min(day, daysInMonth(prevFrom)) - 1);
  const seriesFrom = addDays(today, -29);

  const index = await linkIndex(db, workspaceId);
  const [points, prevPoints, month, goal, top, recent, programRows] = await Promise.all([
    series(db, workspaceId, { from: seriesFrom < monthFrom ? seriesFrom : monthFrom, to: today }),
    series(db, workspaceId, { from: prevFrom, to: prevTo }),
    conversionSummary(db, workspaceId, monthFrom, today),
    getMonthlyGoal(db, workspaceId),
    linkBreakdown(db, workspaceId, { from: monthFrom, to: today }, index),
    recentClicks(db, workspaceId, 8),
    listPrograms(db, workspaceId),
  ]);

  const monthPoints = points.filter((p) => p.day >= monthFrom);
  const totals = withRates(sumSeries(monthPoints));
  const prev = withRates(sumSeries(prevPoints));
  const todayPoint = points.at(-1)!;

  return {
    today,
    monthFrom,
    totals,
    previous: prev,
    deltas: {
      revenue: delta(totals.revenue, prev.revenue),
      clicks: delta(totals.clicks, prev.clicks),
      conversions: delta(totals.conversions, prev.conversions),
      cvr: delta(totals.cvr, prev.cvr),
    },
    status: month,
    goal: goalProgress(totals.revenue, goal, today),
    series: points.filter((p) => p.day >= seriesFrom),
    todayTotals: withRates(todayPoint),
    topLinks: top.slice(0, 5),
    programs: rollUp(top, (r) => r.link.programName ?? UNASSIGNED, programRows.map((p) => p.name)),
    programOrder: programRows.map((p) => p.name),
    recent,
    linkCount: index.length,
    activeLinkCount: index.filter((l) => l.status === "active").length,
  };
}

export type DashboardReport = Awaited<ReturnType<typeof dashboardReport>>;

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

export async function analyticsReport(db: Db, workspaceId: string, today: string, days: Period) {
  const range = { from: addDays(today, -(days - 1)), to: today };
  const previous = { from: addDays(range.from, -days), to: addDays(range.from, -1) };
  const index = await linkIndex(db, workspaceId);

  const [points, prevPoints, byLink, channelClicks, channelConversions, hourRows, deviceRows, programRows] = await Promise.all([
    series(db, workspaceId, range),
    series(db, workspaceId, previous),
    linkBreakdown(db, workspaceId, range, index),
    clicksByChannel(db, workspaceId, range),
    conversionsByChannel(db, workspaceId, range),
    clicksByHour(db, workspaceId, range),
    clicksByDevice(db, workspaceId, range),
    listPrograms(db, workspaceId),
  ]);

  const totals = withRates(sumSeries(points));
  const prev = withRates(sumSeries(prevPoints));
  const hours = hourlyBuckets(hourRows);
  const deviceTotal = deviceRows.reduce((s, r) => s + r.clicks, 0);

  return {
    range,
    days,
    totals,
    previous: prev,
    deltas: {
      revenue: delta(totals.revenue, prev.revenue),
      clicks: delta(totals.clicks, prev.clicks),
      conversions: delta(totals.conversions, prev.conversions),
      cvr: delta(totals.cvr, prev.cvr),
    },
    series: points,
    byLink,
    byProgram: rollUp(byLink, (r) => r.link.programName ?? UNASSIGNED, programRows.map((p) => p.name)),
    programOrder: programRows.map((p) => p.name),
    byCategory: rollUp(byLink, (r) => r.link.category),
    byChannel: breakdown<Channel>(channelClicks, channelConversions).filter((row) => row.clicks > 0 || row.conversions > 0),
    hours,
    peak: peakWindow(hours),
    devices: DEVICES.map((device: Device) => {
      const clicks = deviceRows.find((r) => r.key === device)?.clicks ?? 0;
      return { device, clicks, share: deviceTotal ? clicks / deviceTotal : 0 };
    }),
  };
}

export type AnalyticsReport = Awaited<ReturnType<typeof analyticsReport>>;

export async function linkReport(db: Db, workspaceId: string, id: string, today: string) {
  const link = await getLink(db, workspaceId, id);
  if (!link) return null;
  const range = { from: addDays(today, -29), to: today, linkId: id };
  const lifetime = { from: "2000-01-01", to: today, linkId: id };
  const [points, lifetimePoints, channelClicks, channelConversions, orders, recent, summary] = await Promise.all([
    series(db, workspaceId, range),
    Promise.all([clicksByLink(db, workspaceId, lifetime), conversionsByLink(db, workspaceId, lifetime)]),
    clicksByChannel(db, workspaceId, range),
    conversionsByChannel(db, workspaceId, range),
    listConversions(db, workspaceId, { linkId: id, limit: 10 }),
    recentClicks(db, workspaceId, 12, id),
    db
      .select({
        status: conversions.status,
        commission: sql<number>`coalesce(sum(${conversions.commissionWon}), 0)::bigint`.mapWith(Number),
      })
      .from(conversions)
      .where(and(eq(conversions.workspaceId, workspaceId), eq(conversions.linkId, id)))
      .groupBy(conversions.status),
  ]);
  const [clickRows, conversionRows] = lifetimePoints;
  const total = withRates({
    clicks: clickRows[0]?.clicks ?? 0,
    conversions: conversionRows[0]?.conversions ?? 0,
    revenue: conversionRows[0]?.revenue ?? 0,
  });
  return {
    link,
    lifetime: total,
    confirmed: summary.find((s) => s.status === "confirmed")?.commission ?? 0,
    pending: summary.find((s) => s.status === "pending")?.commission ?? 0,
    series: points,
    last30: withRates(sumSeries(points)),
    byChannel: breakdown<Channel>(channelClicks, channelConversions).filter((row) => row.clicks > 0 || row.conversions > 0),
    orders,
    recent,
  };
}

export type LinkReport = NonNullable<Awaited<ReturnType<typeof linkReport>>>;

/** Programs side by side: reference terms plus what this workspace actually measured. */
export async function programReport(db: Db, workspaceId: string, today: string) {
  const range = { from: addDays(today, -29), to: today };
  const categoryRange = { from: addDays(today, -89), to: today };
  const index = await linkIndex(db, workspaceId);
  const [programRows, recent, quarter, payouts] = await Promise.all([
    listPrograms(db, workspaceId),
    linkBreakdown(db, workspaceId, range, index),
    linkBreakdown(db, workspaceId, categoryRange, index),
    db
      .select({
        programId: links.programId,
        confirmed: sql<number>`coalesce(sum(${conversions.commissionWon}) filter (where ${conversions.status} = 'confirmed'), 0)::bigint`.mapWith(Number),
        pending: sql<number>`coalesce(sum(${conversions.commissionWon}) filter (where ${conversions.status} = 'pending'), 0)::bigint`.mapWith(Number),
      })
      .from(conversions)
      .innerJoin(links, eq(links.id, conversions.linkId))
      .where(and(eq(conversions.workspaceId, workspaceId), ne(conversions.status, "cancelled")))
      .groupBy(links.programId),
  ]);

  const byProgram = new Map(rollUp(recent, (r) => r.link.programId ?? "none").map((row) => [row.key, row]));
  const programs = programRows.map((program) => {
    const measured = byProgram.get(program.id);
    const payout = payouts.find((p) => p.programId === program.id);
    return {
      program,
      linkCount: index.filter((l) => l.programId === program.id).length,
      clicks: measured?.clicks ?? 0,
      conversions: measured?.conversions ?? 0,
      revenue: measured?.revenue ?? 0,
      cvr: measured?.cvr ?? 0,
      epc: measured?.epc ?? 0,
      confirmed: payout?.confirmed ?? 0,
      pending: payout?.pending ?? 0,
    };
  });

  // For each category, the program that earned the most per click over 90 days (needs 30+ clicks to count).
  const categoryPrograms = new Map<string, Map<string, { clicks: number; revenue: number; conversions: number }>>();
  for (const row of quarter) {
    if (!row.link.programId) continue;
    const perProgram = categoryPrograms.get(row.link.category) ?? new Map();
    const entry = perProgram.get(row.link.programId) ?? { clicks: 0, revenue: 0, conversions: 0 };
    entry.clicks += row.clicks;
    entry.revenue += row.revenue;
    entry.conversions += row.conversions;
    perProgram.set(row.link.programId, entry);
    categoryPrograms.set(row.link.category, perProgram);
  }
  const recommendations = CATEGORIES.map((category) => {
    const candidates = [...(categoryPrograms.get(category)?.entries() ?? [])]
      .filter(([, t]) => t.clicks >= 30)
      .map(([programId, t]) => ({ programId, ...t, epc: earningsPerClick(t.revenue, t.clicks), cvr: conversionRate(t.conversions, t.clicks) }))
      .sort((a, b) => b.epc - a.epc);
    const best = candidates[0];
    return {
      category,
      best: best ? { ...best, programName: programRows.find((p) => p.id === best.programId)?.name ?? "" } : null,
      compared: candidates.length,
    };
  });

  return { range, programs, recommendations };
}

export type ProgramReport = Awaited<ReturnType<typeof programReport>>;

