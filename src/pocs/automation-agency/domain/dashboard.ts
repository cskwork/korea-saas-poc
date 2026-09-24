import type { MaintenanceStatus, QuoteStatus, Stage } from "../db/schema";
import { quoteTotals, type QuoteLine } from "./quote";
import { STAGES } from "./stages";

/**
 * Dashboard figures, computed from the workspace's rows (never from constants).
 * All inputs are plain objects so the functions stay pure and testable.
 */

export interface ProjectRow {
  id: string;
  clientName: string;
  stage: Stage;
  progress: number;
  dueDate: string | null;
  setupFee: number;
  monthlyFee: number;
  maintenanceStatus: MaintenanceStatus;
  maintenanceStartedOn: string | null;
  maintenanceEndedOn: string | null;
}

export interface QuoteRow {
  id: string;
  number: string;
  clientName: string;
  status: QuoteStatus;
  issuedOn: string;
  validUntil: string;
  lines: QuoteLine[];
}

export interface StationSummary {
  stage: Stage;
  projects: { id: string; clientName: string; progress: number; overdue: boolean }[];
}

/** Projects grouped by delivery station, in line order. */
export function stationSummaries(projects: readonly ProjectRow[], today: string): StationSummary[] {
  return STAGES.filter((stage) => stage !== "maintenance").map((stage) => ({
    stage,
    projects: projects
      .filter((p) => p.stage === stage)
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
      .map((p) => ({ id: p.id, clientName: p.clientName, progress: p.progress, overdue: isOverdue(p, today) })),
  }));
}

function isOverdue(project: ProjectRow, today: string): boolean {
  return project.stage !== "maintenance" && project.dueDate !== null && project.dueDate < today;
}

/** Monthly recurring revenue: maintenance fees of subscriptions currently running. */
export function monthlyRecurringRevenue(projects: readonly ProjectRow[]): number {
  return projects.filter((p) => p.maintenanceStatus === "active").reduce((sum, p) => sum + p.monthlyFee, 0);
}

export interface LoopRider {
  id: string;
  clientName: string;
  monthlyFee: number;
  status: MaintenanceStatus;
  since: string | null;
}

/** Clients on the maintenance circle line: running first, then paused. */
export function loopRiders(projects: readonly ProjectRow[]): LoopRider[] {
  return projects
    .filter((p) => p.maintenanceStatus === "active" || p.maintenanceStatus === "paused")
    .sort((a, b) =>
      a.maintenanceStatus === b.maintenanceStatus
        ? b.monthlyFee - a.monthlyFee
        : a.maintenanceStatus === "active"
          ? -1
          : 1,
    )
    .map((p) => ({
      id: p.id,
      clientName: p.clientName,
      monthlyFee: p.monthlyFee,
      status: p.maintenanceStatus,
      since: p.maintenanceStartedOn,
    }));
}

/** "2026-09" keys for the last `count` months ending with `today`'s month. */
export function lastMonths(today: string, count: number): string[] {
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const offset = month - 1 - (count - 1 - i);
    const y = year + Math.floor(offset / 12);
    const m = ((offset % 12) + 12) % 12;
    return `${y}-${String(m + 1).padStart(2, "0")}`;
  });
}

function monthEnd(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${monthKey}-${String(last).padStart(2, "0")}`;
}

export interface MrrPoint {
  month: string;
  mrr: number;
}

/**
 * MRR at the end of each month, reconstructed from maintenance start/end dates.
 * Paused subscriptions are left out of every month: when they paused is not recorded,
 * so counting them in the past would show a drop that never happened this month.
 */
export function mrrHistory(projects: readonly ProjectRow[], today: string, months = 6): MrrPoint[] {
  const keys = lastMonths(today, months);
  return keys.map((month, index) => {
    const cutoff = index === keys.length - 1 ? today : monthEnd(month);
    const mrr = projects
      .filter((p) => p.maintenanceStatus === "active" || p.maintenanceStatus === "ended")
      .filter((p) => p.maintenanceStartedOn !== null && p.maintenanceStartedOn <= cutoff)
      .filter((p) => p.maintenanceEndedOn === null || p.maintenanceEndedOn > cutoff)
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    return { month, mrr };
  });
}

export interface Pipeline {
  openCount: number;
  /** Build fees (supply) of quotes sent and awaiting an answer. */
  setupValue: number;
  /** Monthly maintenance (supply) those quotes would add to MRR if accepted. */
  monthlyValue: number;
  draftCount: number;
  /** Accepted ÷ decided (accepted + declined); null before any decision. */
  winRate: number | null;
}

export function pipeline(quotes: readonly QuoteRow[], today: string): Pipeline {
  const open = quotes.filter((q) => q.status === "sent" && q.validUntil >= today);
  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const declined = quotes.filter((q) => q.status === "declined").length;
  const totals = open.map((q) => quoteTotals(q.lines));
  return {
    openCount: open.length,
    setupValue: totals.reduce((sum, t) => sum + t.setup.supply, 0),
    monthlyValue: totals.reduce((sum, t) => sum + t.monthly.supply, 0),
    draftCount: quotes.filter((q) => q.status === "draft").length,
    winRate: accepted + declined > 0 ? accepted / (accepted + declined) : null,
  };
}

export interface Arrival {
  id: string;
  clientName: string;
  stage: Stage;
  dueDate: string;
  /** Days from today (negative when overdue). */
  days: number;
}

/** Delivery deadlines coming up (and overdue ones), soonest first. */
export function upcomingArrivals(projects: readonly ProjectRow[], today: string, horizonDays = 21): Arrival[] {
  return projects
    .filter((p) => p.stage !== "maintenance" && p.dueDate !== null)
    .map((p) => ({
      id: p.id,
      clientName: p.clientName,
      stage: p.stage,
      dueDate: p.dueDate as string,
      days: daysBetween(today, p.dueDate as string),
    }))
    .filter((a) => a.days <= horizonDays)
    .sort((a, b) => a.days - b.days);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** "D-3", "D-DAY", "D+2" */
export function dDay(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

export interface PackageUsage {
  packageId: string;
  projects: number;
  quotes: number;
}

/** Ranks packages by how often they were sold (projects) or quoted. */
export function rankPackages(usage: readonly PackageUsage[], limit = 5): PackageUsage[] {
  return [...usage]
    .filter((u) => u.projects + u.quotes > 0)
    .sort((a, b) => b.projects * 2 + b.quotes - (a.projects * 2 + a.quotes))
    .slice(0, limit);
}
