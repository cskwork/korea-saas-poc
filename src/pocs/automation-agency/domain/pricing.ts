/**
 * Maintenance plans offered to clients. Figures come from the legacy POC and are
 * the product's proposed plans, not market-validated prices.
 */

export type PlanId = "basic" | "pro" | "enterprise";
export type Billing = "monthly" | "annual";

/** Yearly billing discount (legacy POC: 20%). */
export const ANNUAL_DISCOUNT = 0.2;

export interface Plan {
  id: PlanId;
  name: string;
  code: string;
  audience: string;
  monthlyPrice: number;
  /** Automations included; `null` means unlimited. */
  automations: number | null;
  features: string[];
  recommended: boolean;
}

export const PLANS: readonly Plan[] = [
  {
    id: "basic",
    name: "기본",
    code: "B",
    audience: "소규모 자동화를 시작하는 기업",
    monthlyPrice: 490_000,
    automations: 3,
    features: [
      "자동화 최대 3개",
      "기본 워크플로 템플릿",
      "이메일 지원",
      "월 1회 리포트",
      "기본 모니터링",
      "업무 시간 내 대응",
    ],
    recommended: false,
  },
  {
    id: "pro",
    name: "프로",
    code: "P",
    audience: "본격적인 업무 자동화가 필요한 기업",
    monthlyPrice: 990_000,
    automations: 10,
    features: [
      "자동화 최대 10개",
      "커스텀 워크플로 설계",
      "전화 · 이메일 지원",
      "주간 리포트",
      "실시간 모니터링",
      "4시간 내 긴급 대응",
      "전담 매니저 배정",
      "분기별 최적화 컨설팅",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "엔터프라이즈",
    code: "E",
    audience: "전사적 자동화 도입이 필요한 기업",
    monthlyPrice: 1_990_000,
    automations: null,
    features: [
      "자동화 무제한",
      "완전 맞춤 설계 · 개발",
      "연중무휴 전담 지원",
      "실시간 대시보드",
      "고급 분석 리포트",
      "1시간 내 긴급 대응",
      "전담 팀 배정",
      "월간 전략 미팅",
      "API 연동 개발",
      "SLA 보장",
    ],
    recommended: false,
  },
];

export const PLAN_COMPARISON: readonly { feature: string; values: Record<PlanId, string | boolean> }[] = [
  { feature: "자동화 개수", values: { basic: "3개", pro: "10개", enterprise: "무제한" } },
  { feature: "워크플로 설계", values: { basic: "템플릿", pro: "커스텀", enterprise: "완전 맞춤" } },
  { feature: "리포트", values: { basic: "월 1회", pro: "주간", enterprise: "실시간" } },
  { feature: "지원 채널", values: { basic: "이메일", pro: "전화 · 이메일", enterprise: "연중무휴 전담" } },
  { feature: "긴급 대응", values: { basic: "업무 시간", pro: "4시간 이내", enterprise: "1시간 이내" } },
  { feature: "전담 매니저", values: { basic: false, pro: true, enterprise: "전담 팀" } },
  { feature: "최적화 컨설팅", values: { basic: false, pro: "분기별", enterprise: "월간" } },
  { feature: "API 연동 개발", values: { basic: false, pro: false, enterprise: true } },
  { feature: "SLA 보장", values: { basic: false, pro: false, enterprise: true } },
];

export function findPlan(id: string | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/** Monthly price for the billing cycle, rounded to 1,000 won. */
export function planMonthlyPrice(plan: Plan, billing: Billing): number {
  const price = billing === "annual" ? plan.monthlyPrice * (1 - ANNUAL_DISCOUNT) : plan.monthlyPrice;
  return Math.round(price / 1000) * 1000;
}

export function planYearlyPrice(plan: Plan, billing: Billing): number {
  return planMonthlyPrice(plan, billing) * 12;
}
