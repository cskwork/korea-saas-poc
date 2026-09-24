import { addDays, monthRange } from "./dates";
import { isPaidTier, type Tier } from "./tiers";

/**
 * Revenue computed from rows: subscription income from subscribers × plan
 * prices, plus sponsorship deals and membership sales. Money is integer won.
 */

export type PriceTable = Record<Tier, number>;

export const SPONSORSHIP_STATUSES = ["proposed", "booked", "paid"] as const;
export type SponsorshipStatus = (typeof SPONSORSHIP_STATUSES)[number];

export const SPONSORSHIP_STATUS_LABEL: Record<SponsorshipStatus, string> = {
  proposed: "협의 중",
  booked: "확정",
  paid: "정산 완료",
};

/** Sponsorship deals count as revenue once booked; proposals are pipeline only. */
export function countsAsRevenue(status: SponsorshipStatus): boolean {
  return status !== "proposed";
}

export interface SubscriberFacts {
  tier: Tier;
  status: "active" | "unsubscribed";
  joinedOn: string;
  paidSince: string | null;
  unsubscribedOn: string | null;
}

/** Whether the subscriber was on the list on `day`. */
export function wasSubscribed(s: SubscriberFacts, day: string): boolean {
  return s.joinedOn <= day && (s.unsubscribedOn === null || s.unsubscribedOn > day);
}

/** Whether the subscriber was paying on `day`. */
export function wasPaying(s: SubscriberFacts, day: string): boolean {
  return isPaidTier(s.tier) && s.paidSince !== null && s.paidSince <= day && (s.unsubscribedOn === null || s.unsubscribedOn > day);
}

/** Monthly recurring revenue: active paid subscribers × their plan price. */
export function monthlyRecurringRevenue(subscribers: readonly SubscriberFacts[], prices: PriceTable): number {
  return subscribers
    .filter((s) => s.status === "active" && isPaidTier(s.tier) && s.paidSince !== null)
    .reduce((sum, s) => sum + prices[s.tier], 0);
}

/**
 * Subscription income billed in a month: every subscriber paying at any point
 * of the month is billed once at the current price of their tier (an estimate:
 * past price changes are not tracked).
 */
export function subscriptionIncome(subscribers: readonly SubscriberFacts[], prices: PriceTable, month: string): number {
  const { start, end } = monthRange(month);
  return subscribers
    .filter(
      (s) =>
        isPaidTier(s.tier) &&
        s.paidSince !== null &&
        s.paidSince <= end &&
        (s.unsubscribedOn === null || s.unsubscribedOn > start),
    )
    .reduce((sum, s) => sum + prices[s.tier], 0);
}

export function sumInMonth(rows: readonly { day: string; amount: number }[], month: string): number {
  return rows.filter((row) => row.day.startsWith(month)).reduce((sum, row) => sum + row.amount, 0);
}

export interface MonthRevenue {
  month: string;
  subscription: number;
  sponsorship: number;
  membership: number;
  total: number;
}

export function revenueByMonth(input: {
  months: readonly string[];
  subscribers: readonly SubscriberFacts[];
  prices: PriceTable;
  sponsorships: readonly { day: string; amount: number }[];
  memberships: readonly { day: string; amount: number }[];
}): MonthRevenue[] {
  return input.months.map((month) => {
    const subscription = subscriptionIncome(input.subscribers, input.prices, month);
    const sponsorship = sumInMonth(input.sponsorships, month);
    const membership = sumInMonth(input.memberships, month);
    return { month, subscription, sponsorship, membership, total: subscription + sponsorship + membership };
  });
}

/** Average revenue per paying subscriber. */
export function averageRevenuePerPaid(mrr: number, paidCount: number): number {
  return paidCount > 0 ? Math.round(mrr / paidCount) : 0;
}

/** Share of paying subscribers 30 days ago who have since unsubscribed. */
export function paidChurnRate(subscribers: readonly SubscriberFacts[], today: string, windowDays = 30): number {
  const start = addDays(today, -windowDays);
  const base = subscribers.filter((s) => wasPaying(s, start));
  if (base.length === 0) return 0;
  const lost = base.filter((s) => s.unsubscribedOn !== null && s.unsubscribedOn > start && s.unsubscribedOn <= today);
  return lost.length / base.length;
}

/** Share of active subscribers who pay. */
export function paidConversion(subscribers: readonly SubscriberFacts[]): number {
  const active = subscribers.filter((s) => s.status === "active");
  if (active.length === 0) return 0;
  return active.filter((s) => isPaidTier(s.tier)).length / active.length;
}

export function goalProgress(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(1, Math.max(0, value / goal));
}

export interface CirculationPoint {
  day: string;
  total: number;
  paid: number;
}

/** Subscribers on the list (and paying) at the end of each of the last `weeks` weeks. */
export function circulation(subscribers: readonly SubscriberFacts[], today: string, weeks: number): CirculationPoint[] {
  return Array.from({ length: weeks }, (_, i) => {
    const day = addDays(today, -7 * (weeks - 1 - i));
    return {
      day,
      total: subscribers.filter((s) => wasSubscribed(s, day)).length,
      paid: subscribers.filter((s) => wasPaying(s, day)).length,
    };
  });
}
