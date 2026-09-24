import type { PlanTier } from "../db/schema";

/**
 * Plan ideas from the POC (not live prices). Limits are shown against the shop's real
 * usage on the pricing page; the demo does not enforce them.
 */

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  summary: string;
  /** null = unlimited */
  monthlyBookings: number | null;
  customers: number | null;
  features: { label: string; included: boolean }[];
}

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    summary: "시작하기 좋은 무료 플랜",
    monthlyBookings: 30,
    customers: 50,
    features: [
      { label: "월 30건 예약", included: true },
      { label: "기본 캘린더", included: true },
      { label: "고객 50명 관리", included: true },
      { label: "알림톡 발송", included: false },
      { label: "통계 분석", included: false },
      { label: "커스텀 예약 페이지", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 30_000,
    summary: "성장하는 매장에 딱 맞는 플랜",
    monthlyBookings: null,
    customers: 500,
    features: [
      { label: "무제한 예약", included: true },
      { label: "고급 캘린더", included: true },
      { label: "고객 500명 관리", included: true },
      { label: "알림톡 월 200건", included: true },
      { label: "기본 통계", included: true },
      { label: "직원 관리", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 80_000,
    summary: "다지점·대형 매장용",
    monthlyBookings: null,
    customers: null,
    features: [
      { label: "무제한 예약", included: true },
      { label: "고급 캘린더", included: true },
      { label: "무제한 고객 관리", included: true },
      { label: "알림톡 무제한", included: true },
      { label: "고급 통계·분석", included: true },
      { label: "직원 5명 관리", included: true },
    ],
  },
];

export const FEATURED_PLAN: PlanTier = "pro";

/** The comparison table as written in the POC; `null` cells read "없음". */
export const COMPARISON: readonly { feature: string; values: Record<PlanTier, string | null> }[] = [
  { feature: "예약 건수", values: { free: "30건/월", pro: "무제한", business: "무제한" } },
  { feature: "고객 관리", values: { free: "50명", pro: "500명", business: "무제한" } },
  { feature: "알림톡", values: { free: null, pro: "200건/월", business: "무제한" } },
  { feature: "통계/분석", values: { free: null, pro: "기본", business: "고급" } },
  { feature: "직원 관리", values: { free: null, pro: null, business: "5명" } },
  { feature: "커스텀 예약 페이지", values: { free: null, pro: "제공", business: "제공" } },
  { feature: "API 연동", values: { free: null, pro: null, business: "제공" } },
];

export function planById(id: PlanTier): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export interface UsageLine {
  label: string;
  used: number;
  limit: number | null;
  over: boolean;
}

/** This month's bookings and the customer count against a plan's limits. */
export function usageAgainst(plan: Plan, usage: { monthlyBookings: number; customers: number }): UsageLine[] {
  const line = (label: string, used: number, limit: number | null): UsageLine => ({
    label,
    used,
    limit,
    over: limit !== null && used > limit,
  });
  return [
    line("이번 달 예약", usage.monthlyBookings, plan.monthlyBookings),
    line("등록 고객", usage.customers, plan.customers),
  ];
}
