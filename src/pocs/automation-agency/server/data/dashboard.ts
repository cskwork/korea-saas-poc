import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import { diagnoses, packages, projects } from "../../db/schema";
import type { Db } from "../../db/types";
import { addDays } from "../../domain/dates";
import {
  loopRiders,
  monthlyRecurringRevenue,
  mrrHistory,
  pipeline,
  rankPackages,
  stationSummaries,
  upcomingArrivals,
} from "../../domain/dashboard";
import { packageUsage } from "./catalog";
import { listQuotes } from "./quotes";

/** Everything the 운행 현황 (dashboard) shows, computed from the workspace's rows. */
export async function getDashboard(db: Db, workspaceId: string, today: string) {
  const [projectRows, quoteRows, usage, packageRows, recentLeads] = await Promise.all([
    db.select().from(projects).where(eq(projects.workspaceId, workspaceId)),
    listQuotes(db, workspaceId),
    packageUsage(db, workspaceId),
    db
      .select({ id: packages.id, name: packages.name, monthlyHoursSaved: packages.monthlyHoursSaved })
      .from(packages)
      .where(eq(packages.workspaceId, workspaceId)),
    db
      .select({ id: diagnoses.id })
      .from(diagnoses)
      .where(
        and(
          eq(diagnoses.workspaceId, workspaceId),
          gte(diagnoses.createdAt, new Date(`${addDays(today, -30)}T00:00:00+09:00`)),
        ),
      )
      .orderBy(desc(diagnoses.createdAt)),
  ]);

  const quoteRowsForMetrics = quoteRows.map((q) => ({ ...q, lines: q.items }));
  const names = new Map(packageRows.map((p) => [p.id, p]));
  const topPackages = rankPackages(
    [...usage.entries()].map(([packageId, u]) => ({ packageId, ...u })),
    5,
  ).flatMap((u) => {
    const pkg = names.get(u.packageId);
    return pkg ? [{ ...u, name: pkg.name, monthlyHoursSaved: pkg.monthlyHoursSaved }] : [];
  });

  const riders = loopRiders(projectRows);
  const history = mrrHistory(projectRows, today, 6);
  const mrr = monthlyRecurringRevenue(projectRows);

  return {
    stations: stationSummaries(projectRows, today),
    riders,
    mrr,
    mrrHistory: history,
    /** MRR change against the end of last month. */
    mrrDelta: history.length >= 2 ? mrr - history[history.length - 2].mrr : 0,
    activeSubscriptions: riders.filter((r) => r.status === "active").length,
    pausedSubscriptions: riders.filter((r) => r.status === "paused").length,
    inDelivery: projectRows.filter((p) => p.stage !== "maintenance").length,
    deliverySetupValue: projectRows.filter((p) => p.stage !== "maintenance").reduce((sum, p) => sum + p.setupFee, 0),
    pipeline: pipeline(quoteRowsForMetrics, today),
    arrivals: upcomingArrivals(projectRows, today, 21).slice(0, 6),
    openQuotes: quoteRows
      .filter((q) => q.status === "sent" || q.status === "draft")
      .slice(0, 5)
      .map((q) => ({
        id: q.id,
        number: q.number,
        clientName: q.clientName,
        status: q.status,
        validUntil: q.validUntil,
        setup: q.totals.setup.supply,
        monthly: q.totals.monthly.supply,
      })),
    topPackages,
    newLeads: recentLeads.length,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
