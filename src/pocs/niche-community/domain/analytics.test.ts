import { describe, expect, it } from "vitest";
import {
  activeMemberCount,
  activityByDay,
  activityHeadline,
  channelHeadline,
  cohortRetention,
  membershipByMonth,
  membershipHeadline,
  monthlyChurn,
  mrrByMonth,
  mrrHeadline,
  nextMonthRetention,
  retentionHeadline,
  revenueByMonth,
} from "./analytics";

const at = (iso: string) => new Date(`${iso}+09:00`);
const months = ["2026-07", "2026-08", "2026-09"];
const now = at("2026-09-24T12:00:00");

const members = [
  { id: "op", role: "operator" as const, joinedAt: at("2026-03-01T09:00:00") },
  { id: "a", role: "member" as const, joinedAt: at("2026-06-10T09:00:00") },
  { id: "b", role: "member" as const, joinedAt: at("2026-08-05T09:00:00") },
  { id: "c", role: "member" as const, joinedAt: at("2026-09-02T09:00:00") },
];
const changes = [
  { memberId: "a", kind: "upgrade" as const, occurredAt: at("2026-07-15T10:00:00") },
  { memberId: "b", kind: "upgrade" as const, occurredAt: at("2026-08-20T10:00:00") },
  { memberId: "b", kind: "downgrade" as const, occurredAt: at("2026-09-10T10:00:00") },
];
const payments = [
  { memberId: "a", amountWon: 9900, periodStart: "2026-07-15", paidAt: at("2026-07-15T10:00:00") },
  { memberId: "a", amountWon: 9900, periodStart: "2026-08-15", paidAt: at("2026-08-15T09:00:00") },
  { memberId: "a", amountWon: 9900, periodStart: "2026-09-15", paidAt: at("2026-09-15T09:00:00") },
  { memberId: "b", amountWon: 9900, periodStart: "2026-08-20", paidAt: at("2026-08-20T10:00:00") },
];

describe("dashboard analytics", () => {
  it("sums collected revenue per Seoul month", () => {
    expect(revenueByMonth(payments, months)).toEqual([
      { month: "2026-07", amount: 9900 },
      { month: "2026-08", amount: 19800 },
      { month: "2026-09", amount: 9900 },
    ]);
  });

  it("rebuilds members and premium members at each month end (operator excluded)", () => {
    const series = membershipByMonth(members, changes, months, now);
    expect(series).toEqual([
      { month: "2026-07", members: 1, premium: 1, free: 0 },
      { month: "2026-08", members: 2, premium: 2, free: 0 },
      { month: "2026-09", members: 3, premium: 1, free: 2 },
    ]);
    expect(mrrByMonth(series).map((point) => point.amount)).toEqual([9900, 19800, 9900]);
    expect(membershipHeadline(series.at(-1), 1)).toBe("멤버 3명 중 1명이 프리미엄입니다 · 이번 달 새로 1명 합류");
  });

  it("measures churn within the current month", () => {
    expect(monthlyChurn(members, changes, now)).toEqual({ premiumAtStart: 2, lost: 1, rate: 0.5 });
  });

  it("groups paying members into cohorts by first payment month", () => {
    const cohorts = cohortRetention(payments, months);
    expect(cohorts).toEqual([
      { month: "2026-07", size: 1, retained: [1, 1, 1] },
      { month: "2026-08", size: 1, retained: [1, 0] },
    ]);
    expect(nextMonthRetention(cohorts)).toBe(0.5);
    expect(nextMonthRetention([])).toBeNull();
    expect(retentionHeadline(0.5)).toBe("첫 결제 다음 달에도 결제한 멤버는 50%입니다");
  });

  it("counts activity per day and active members", () => {
    const days = ["2026-09-23", "2026-09-24"];
    const series = activityByDay([at("2026-09-23T23:30:00"), at("2026-09-24T00:10:00")], [at("2026-09-24T08:00:00")], days);
    expect(series).toEqual([
      { day: "2026-09-23", posts: 1, comments: 0 },
      { day: "2026-09-24", posts: 1, comments: 1 },
    ]);
    expect(activityHeadline(series)).toBe("최근 2일 동안 글 2개, 댓글 1개가 올라왔습니다");
    const activity = [
      { memberId: "a", at: at("2026-09-20T10:00:00") },
      { memberId: "a", at: at("2026-09-21T10:00:00") },
      { memberId: "b", at: at("2026-08-01T10:00:00") },
    ];
    expect(activeMemberCount(activity, at("2026-09-01T00:00:00"))).toBe(1);
  });

  it("states each chart's takeaway as a sentence", () => {
    expect(mrrHeadline([{ month: "2026-07", amount: 9900 }, { month: "2026-08", amount: 19800 }, { month: "2026-09", amount: 29700 }])).toBe(
      "MRR이 2개월 동안 9,900원에서 29,700원으로 늘었습니다",
    );
    expect(mrrHeadline([{ month: "2026-08", amount: 19800 }, { month: "2026-09", amount: 9900 }])).toContain("줄었습니다");
    expect(mrrHeadline([{ month: "2026-09", amount: 0 }])).toBe("아직 프리미엄 멤버가 없습니다");
    expect(channelHeadline([{ name: "자유게시판", posts: 2 }, { name: "창업 이야기", posts: 5 }], 30)).toBe(
      "최근 30일 가장 활발한 채널은 창업 이야기입니다 (글 5개)",
    );
    expect(channelHeadline([], 30)).toContain("없습니다");
  });
});
