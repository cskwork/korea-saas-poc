import { addDays, monthOf, monthRange, type DateKey, type MonthKey } from "../../domain/dates";
import { isEstimateExpired, overdueDays } from "../../domain/documents";
import {
  clientShares,
  effectiveHourlyRate,
  goalProgress,
  monthlyRevenue,
  receivables,
  taxSummary,
  type ClientShare,
  type GoalProgress,
  type MonthRevenue,
  type Receivables,
  type TaxSummary,
} from "../../domain/revenue";
import { buildWorkCalendar, type WorkCalendar } from "../../domain/time";
import type { Db } from "../db";
import { listEstimates, listInvoices, toRevenueInvoice, type EstimateSummary, type InvoiceSummary } from "./documents-read";
import { getProfile } from "./profile";
import { loadBoard, type BoardProject } from "./projects";
import { minutesByDay } from "./time";

/** Dashboards: the overview (개요) and revenue (수익) pages, computed from real rows. */

export interface OpenInvoice extends InvoiceSummary {
  overdue: number;
}

export interface OpenEstimate extends EstimateSummary {
  expired: boolean;
}

export interface Overview {
  today: DateKey;
  calendar: WorkCalendar;
  todayMinutes: number;
  weekMinutes: number;
  open: OpenInvoice[];
  receivables: Receivables;
  month: {
    key: MonthKey;
    paidSupply: number;
    payout: number;
    minutes: number;
    goal: GoalProgress;
  };
  /** Budget ÷ tracked hours over finished projects. */
  finishedRate: number | null;
  active: BoardProject[];
  pendingEstimates: OpenEstimate[];
}

export async function workCalendar(db: Db, workspaceId: string, today: DateKey, weeks: number, invoices?: InvoiceSummary[]) {
  const from = addDays(today, -7 * weeks);
  const [minutes, allInvoices] = await Promise.all([
    minutesByDay(db, workspaceId, from),
    invoices ? Promise.resolve(invoices) : listInvoices(db, workspaceId),
  ]);
  const deposits = new Map<DateKey, number>();
  for (const invoice of allInvoices) {
    if (invoice.status === "paid" && invoice.paidOn) deposits.set(invoice.paidOn, (deposits.get(invoice.paidOn) ?? 0) + invoice.totals.payout);
  }
  return { calendar: buildWorkCalendar(today, weeks, minutes, deposits), minutes };
}

export async function loadOverview(db: Db, workspaceId: string, today: DateKey): Promise<Overview> {
  const [profile, invoices, estimates, board] = await Promise.all([
    getProfile(db, workspaceId),
    listInvoices(db, workspaceId),
    listEstimates(db, workspaceId),
    loadBoard(db, workspaceId),
  ]);
  const { calendar, minutes } = await workCalendar(db, workspaceId, today, 26, invoices);

  const month = monthOf(today);
  const paidThisMonth = invoices.filter((i) => i.status === "paid" && i.paidOn && monthOf(i.paidOn) === month);
  const paidSupply = paidThisMonth.reduce((s, i) => s + i.totals.supply, 0);
  let monthMinutes = 0;
  let weekMinutes = 0;
  for (const [day, value] of minutes) {
    if (monthOf(day) === month) monthMinutes += value;
    if (day > addDays(today, -7)) weekMinutes += value;
  }

  const finished = board.filter((p) => p.status === "done" && p.trackedMinutes > 0);
  const finishedRate = effectiveHourlyRate(
    finished.reduce((s, p) => s + p.budget, 0),
    finished.reduce((s, p) => s + p.trackedMinutes, 0),
  );

  const open = invoices
    .filter((i) => i.status !== "paid")
    .map((i) => ({ ...i, overdue: overdueDays(i, today) }))
    .sort((a, b) => b.overdue - a.overdue || a.dueOn.localeCompare(b.dueOn));

  const active = board
    .filter((p) => p.status === "progress" || p.status === "review")
    .sort((a, b) => (a.dueOn ?? "9999").localeCompare(b.dueOn ?? "9999"));

  return {
    today,
    calendar,
    todayMinutes: minutes.get(today) ?? 0,
    weekMinutes,
    open,
    receivables: receivables(invoices.map(toRevenueInvoice), today),
    month: {
      key: month,
      paidSupply,
      payout: paidThisMonth.reduce((s, i) => s + i.totals.payout, 0),
      minutes: monthMinutes,
      goal: goalProgress(paidSupply, profile.monthlyGoal),
    },
    finishedRate,
    active,
    pendingEstimates: estimates
      .filter((e) => e.status === "sent")
      .map((e) => ({ ...e, expired: isEstimateExpired(e, today) })),
  };
}

export interface ProjectProfit {
  id: string;
  title: string;
  status: BoardProject["status"];
  clientName: string | null;
  budget: number;
  paid: number;
  trackedMinutes: number;
  rate: number | null;
}

export interface RevenueReport {
  today: DateKey;
  year: number;
  months: MonthRevenue[];
  yearPaid: number;
  monthlyAverage: number;
  receivables: Receivables;
  open: OpenInvoice[];
  tax: TaxSummary;
  shares: ClientShare[];
  projects: ProjectProfit[];
  yearMinutes: number;
  yearRate: number | null;
  goal: number;
}

export async function loadRevenue(db: Db, workspaceId: string, today: DateKey): Promise<RevenueReport> {
  const [profile, invoices, board] = await Promise.all([
    getProfile(db, workspaceId),
    listInvoices(db, workspaceId),
    loadBoard(db, workspaceId),
  ]);
  const year = Number(today.slice(0, 4));
  const revenueInvoices = invoices.map(toRevenueInvoice);
  const months = monthlyRevenue(revenueInvoices, monthRange(monthOf(today), 12));
  const yearMinutesMap = await minutesByDay(db, workspaceId, `${year}-01-01`);
  const yearMinutes = [...yearMinutesMap.values()].reduce((s, v) => s + v, 0);
  const tax = taxSummary(revenueInvoices, year);
  const monthsThisYear = Number(today.slice(5, 7));

  const paidByProject = new Map<string, number>();
  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.projectId) {
      paidByProject.set(invoice.projectId, (paidByProject.get(invoice.projectId) ?? 0) + invoice.totals.supply);
    }
  }

  return {
    today,
    year,
    months,
    yearPaid: tax.paidSupply,
    monthlyAverage: Math.round(tax.paidSupply / monthsThisYear),
    receivables: receivables(revenueInvoices, today),
    open: invoices
      .filter((i) => i.status !== "paid")
      .map((i) => ({ ...i, overdue: overdueDays(i, today) }))
      .sort((a, b) => b.overdue - a.overdue),
    tax,
    shares: clientShares(revenueInvoices, year),
    projects: board
      .filter((p) => p.trackedMinutes > 0 || paidByProject.has(p.id))
      .map((p) => {
        const paid = paidByProject.get(p.id) ?? 0;
        return {
          id: p.id,
          title: p.title,
          status: p.status,
          clientName: p.clientCompany || p.clientName,
          budget: p.budget,
          paid,
          trackedMinutes: p.trackedMinutes,
          rate: effectiveHourlyRate(paid, p.trackedMinutes),
        };
      })
      .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1)),
    yearMinutes,
    yearRate: effectiveHourlyRate(tax.paidSupply, yearMinutes),
    goal: profile.monthlyGoal,
  };
}
