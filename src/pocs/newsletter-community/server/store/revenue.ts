import { and, asc, desc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { issues, membershipSales, sponsorships, subscribers } from "../../db/schema";
import { monthOf, recentMonths } from "../../domain/dates";
import {
  averageRevenuePerPaid,
  countsAsRevenue,
  goalProgress,
  monthlyRecurringRevenue,
  paidChurnRate,
  paidConversion,
  revenueByMonth,
  type SponsorshipStatus,
  type SubscriberFacts,
} from "../../domain/revenue";
import { getPlans, getPublication, priceTable } from "./publication";
import type { Db } from "./db";

export async function subscriberFacts(db: Db, workspaceId: string): Promise<SubscriberFacts[]> {
  return db
    .select({
      tier: subscribers.tier,
      status: subscribers.status,
      joinedOn: subscribers.joinedOn,
      paidSince: subscribers.paidSince,
      unsubscribedOn: subscribers.unsubscribedOn,
    })
    .from(subscribers)
    .where(eq(subscribers.workspaceId, workspaceId));
}

export async function listSponsorships(db: Db, workspaceId: string) {
  return db
    .select({
      id: sponsorships.id,
      sponsorName: sponsorships.sponsorName,
      message: sponsorships.message,
      amount: sponsorships.amount,
      runOn: sponsorships.runOn,
      status: sponsorships.status,
      issueId: sponsorships.issueId,
      issueNumber: issues.number,
    })
    .from(sponsorships)
    .leftJoin(issues, eq(issues.id, sponsorships.issueId))
    .where(eq(sponsorships.workspaceId, workspaceId))
    .orderBy(desc(sponsorships.runOn));
}

export type SponsorshipRow = Awaited<ReturnType<typeof listSponsorships>>[number];

export async function listMembershipSales(db: Db, workspaceId: string) {
  return db
    .select()
    .from(membershipSales)
    .where(eq(membershipSales.workspaceId, workspaceId))
    .orderBy(desc(membershipSales.soldOn), asc(membershipSales.buyerName));
}

export type MembershipSaleRow = Awaited<ReturnType<typeof listMembershipSales>>[number];

const MONTHS = 6;

/** Everything the revenue page (and the desk's colophon) computes from rows. */
export async function revenueOverview(db: Db, workspaceId: string, today: string) {
  const [publication, plans, facts, deals, sales] = await Promise.all([
    getPublication(db, workspaceId),
    getPlans(db, workspaceId),
    subscriberFacts(db, workspaceId),
    listSponsorships(db, workspaceId),
    listMembershipSales(db, workspaceId),
  ]);
  const prices = priceTable(plans);
  const months = recentMonths(today, MONTHS);
  const series = revenueByMonth({
    months,
    subscribers: facts,
    prices,
    sponsorships: deals.filter((d) => countsAsRevenue(d.status)).map((d) => ({ day: d.runOn, amount: d.amount })),
    memberships: sales.map((s) => ({ day: s.soldOn, amount: s.amount })),
  });
  const mrr = monthlyRecurringRevenue(facts, prices);
  const paidActive = facts.filter((s) => s.status === "active" && s.tier !== "free").length;
  const thisMonth = series[series.length - 1];
  const lastMonth = series[series.length - 2];
  return {
    publication,
    prices,
    series,
    mrr,
    paidActive,
    arpu: averageRevenuePerPaid(mrr, paidActive),
    churn: paidChurnRate(facts, today),
    conversion: paidConversion(facts),
    thisMonth,
    lastMonth,
    goals: {
      revenue: { value: thisMonth.total, goal: publication.revenueGoal, ratio: goalProgress(thisMonth.total, publication.revenueGoal) },
      paid: { value: paidActive, goal: publication.paidGoal, ratio: goalProgress(paidActive, publication.paidGoal) },
    },
    pipeline: deals
      .filter((d) => d.status === "proposed" || (d.status === "booked" && d.runOn >= today))
      .reduce((sum, d) => sum + d.amount, 0),
    deals,
    sales,
    currentMonth: monthOf(today),
  };
}

export type RevenueOverview = Awaited<ReturnType<typeof revenueOverview>>;

// ---- sponsorships ---------------------------------------------------------

export interface SponsorshipInput {
  sponsorName: string;
  message: string;
  amount: number;
  runOn: string;
  status: SponsorshipStatus;
}

export async function createSponsorship(db: Db, workspaceId: string, input: SponsorshipInput) {
  await db.insert(sponsorships).values({ workspaceId, ...input });
}

export async function setSponsorshipStatus(db: Db, workspaceId: string, id: string, status: SponsorshipStatus) {
  const updated = await db
    .update(sponsorships)
    .set({ status })
    .where(and(eq(sponsorships.workspaceId, workspaceId), eq(sponsorships.id, id)))
    .returning({ id: sponsorships.id });
  if (updated.length === 0) throw new UserError("광고 계약을 찾지 못했어요.");
}

export async function deleteSponsorship(db: Db, workspaceId: string, id: string) {
  const deleted = await db
    .delete(sponsorships)
    .where(and(eq(sponsorships.workspaceId, workspaceId), eq(sponsorships.id, id)))
    .returning({ id: sponsorships.id });
  if (deleted.length === 0) throw new UserError("광고 계약을 찾지 못했어요.");
}

// ---- membership sales -----------------------------------------------------

export interface MembershipSaleInput {
  item: string;
  buyerName: string;
  amount: number;
  soldOn: string;
}

export async function createMembershipSale(db: Db, workspaceId: string, input: MembershipSaleInput) {
  await db.insert(membershipSales).values({ workspaceId, ...input });
}

export async function deleteMembershipSale(db: Db, workspaceId: string, id: string) {
  const deleted = await db
    .delete(membershipSales)
    .where(and(eq(membershipSales.workspaceId, workspaceId), eq(membershipSales.id, id)))
    .returning({ id: membershipSales.id });
  if (deleted.length === 0) throw new UserError("멤버십 매출을 찾지 못했어요.");
}
