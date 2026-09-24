import { formatPercent, formatWon } from "@/core/format";
import { tierAt, type TierChangeEvent } from "./billing";
import { PREMIUM_PRICE_WON } from "./rules";
import { monthEnd, monthStart, seoulDateKey, seoulMonthKey } from "./time";

/**
 * Operator dashboard metrics, computed from rows. Every chart on the dashboard
 * carries an "action title": a sentence stating what the numbers say.
 */

export interface MemberRow {
  id: string;
  role: "operator" | "member";
  joinedAt: Date;
}

export interface ChangeRow extends TierChangeEvent {
  memberId: string;
}

export interface PaymentRow {
  memberId: string;
  amountWon: number;
  periodStart: string;
  paidAt: Date;
}

/** Collected membership revenue per Seoul month (by payment date). */
export function revenueByMonth(payments: readonly PaymentRow[], months: readonly string[]) {
  const totals = new Map(months.map((month) => [month, 0]));
  for (const payment of payments) {
    const month = seoulMonthKey(payment.paidAt);
    if (totals.has(month)) totals.set(month, (totals.get(month) ?? 0) + payment.amountWon);
  }
  return months.map((month) => ({ month, amount: totals.get(month) ?? 0 }));
}

/** Members (operator excluded) and premium members at the end of each month (or `now` for the current one). */
export function membershipByMonth(
  members: readonly MemberRow[],
  changes: readonly ChangeRow[],
  months: readonly string[],
  now: Date,
) {
  const byMember = groupBy(changes, (change) => change.memberId);
  const regular = members.filter((member) => member.role === "member");
  return months.map((month) => {
    const end = monthEnd(month);
    const at = end.getTime() > now.getTime() ? now : new Date(end.getTime() - 1);
    const joined = regular.filter((member) => member.joinedAt.getTime() <= at.getTime());
    const premium = joined.filter((member) => tierAt(byMember.get(member.id) ?? [], at) === "premium").length;
    return { month, members: joined.length, premium, free: joined.length - premium };
  });
}

/** Posts and comments per Seoul day. */
export function activityByDay(postDates: readonly Date[], commentDates: readonly Date[], days: readonly string[]) {
  const posts = countByKey(postDates.map((date) => seoulDateKey(date)));
  const comments = countByKey(commentDates.map((date) => seoulDateKey(date)));
  return days.map((day) => ({ day, posts: posts.get(day) ?? 0, comments: comments.get(day) ?? 0 }));
}

export interface ActivityRow {
  memberId: string;
  at: Date;
}

/** Distinct members with any activity since `since`. */
export function activeMemberCount(activity: readonly ActivityRow[], since: Date): number {
  return new Set(activity.filter((row) => row.at.getTime() >= since.getTime()).map((row) => row.memberId)).size;
}

export interface CohortRow {
  /** Month of the cohort's first payment. */
  month: string;
  size: number;
  /** Share of the cohort that paid again k months later (k = 0 is always 1), up to the last month. */
  retained: number[];
}

/** Paid-membership cohort retention: members grouped by the month of their first payment. */
export function cohortRetention(payments: readonly PaymentRow[], months: readonly string[]): CohortRow[] {
  const paidMonths = new Map<string, Set<string>>();
  for (const payment of payments) {
    const set = paidMonths.get(payment.memberId) ?? new Set<string>();
    set.add(payment.periodStart.slice(0, 7));
    paidMonths.set(payment.memberId, set);
  }
  const cohorts = groupBy([...paidMonths.values()], (set) => [...set].sort()[0]);
  return months.flatMap((month, index) => {
    const members = cohorts.get(month);
    if (!members) return [];
    const retained = months
      .slice(index)
      .map((target) => members.filter((set) => set.has(target)).length / members.length);
    return [{ month, size: members.length, retained }];
  });
}

/** Average share of paying members who paid again the following month (weighted by cohort size). */
export function nextMonthRetention(cohorts: readonly CohortRow[]): number | null {
  let paid = 0;
  let size = 0;
  for (const cohort of cohorts) {
    const next = cohort.retained[1];
    if (next === undefined) continue;
    paid += next * cohort.size;
    size += cohort.size;
  }
  return size === 0 ? null : paid / size;
}

/** Premium members lost this month over premium members at its start. */
export function monthlyChurn(members: readonly MemberRow[], changes: readonly ChangeRow[], now: Date) {
  const start = monthStart(seoulMonthKey(now));
  const byMember = groupBy(changes, (change) => change.memberId);
  const premiumAtStart = members.filter(
    (member) => member.role === "member" && tierAt(byMember.get(member.id) ?? [], start) === "premium",
  );
  const lost = premiumAtStart.filter((member) => tierAt(byMember.get(member.id) ?? [], now) === "free").length;
  return { premiumAtStart: premiumAtStart.length, lost, rate: premiumAtStart.length ? lost / premiumAtStart.length : 0 };
}

export const monthlyRecurringRevenue = (premiumMembers: number) => premiumMembers * PREMIUM_PRICE_WON;

/* ---- action titles ---- */

/** Month-end MRR: premium members at the end of each month × the monthly price. */
export function mrrByMonth(series: readonly { month: string; premium: number }[]) {
  return series.map((point) => ({ month: point.month, amount: monthlyRecurringRevenue(point.premium) }));
}

export function mrrHeadline(series: readonly { month: string; amount: number }[]): string {
  const first = series[0];
  const last = series.at(-1);
  if (!first || !last || series.every((point) => point.amount === 0)) return "아직 프리미엄 멤버가 없습니다";
  const span = `${series.length - 1}개월`;
  if (last.amount > first.amount) {
    return `MRR이 ${span} 동안 ${formatWon(first.amount)}에서 ${formatWon(last.amount)}으로 늘었습니다`;
  }
  if (last.amount < first.amount) {
    return `MRR이 ${span} 동안 ${formatWon(first.amount)}에서 ${formatWon(last.amount)}으로 줄었습니다`;
  }
  return `MRR이 ${span} 전과 같은 ${formatWon(last.amount)}입니다`;
}

export function membershipHeadline(point: { members: number; premium: number } | undefined, newThisMonth: number) {
  if (!point || point.members === 0) return "아직 멤버가 없습니다";
  return `멤버 ${point.members}명 중 ${point.premium}명이 프리미엄입니다 · 이번 달 새로 ${newThisMonth}명 합류`;
}

export function activityHeadline(days: readonly { day: string; posts: number; comments: number }[]): string {
  const posts = days.reduce((sum, day) => sum + day.posts, 0);
  const comments = days.reduce((sum, day) => sum + day.comments, 0);
  if (posts + comments === 0) return `최근 ${days.length}일 동안 새 글과 댓글이 없습니다`;
  return `최근 ${days.length}일 동안 글 ${posts}개, 댓글 ${comments}개가 올라왔습니다`;
}

export function retentionHeadline(rate: number | null): string {
  if (rate === null) return "재결제를 판단할 만큼 결제 기록이 쌓이지 않았습니다";
  return `첫 결제 다음 달에도 결제한 멤버는 ${formatPercent(rate, 0)}입니다`;
}

/* ---- helpers ---- */

function groupBy<T>(rows: readonly T[], key: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k) ?? [];
    list.push(row);
    map.set(k, list);
  }
  return map;
}

function countByKey(keys: readonly string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const key of keys) map.set(key, (map.get(key) ?? 0) + 1);
  return map;
}

export function channelHeadline(rows: readonly { name: string; posts: number }[], days: number): string {
  const top = [...rows].sort((a, b) => b.posts - a.posts)[0];
  if (!top || top.posts === 0) return `최근 ${days}일 동안 새 글이 올라온 채널이 없습니다`;
  return `최근 ${days}일 가장 활발한 채널은 ${top.name}입니다 (글 ${top.posts}개)`;
}
