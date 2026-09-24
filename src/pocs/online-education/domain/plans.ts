import type { BillingCycle, PlanTier } from "../db/schema";

/**
 * 에듀마켓 subscription plans, as stated by the product's plan terms (legacy POC copy).
 * Choosing a plan is recorded on the school; nothing is billed.
 */

export interface PlanLimits {
  courses: number;
  students: number;
  products: number;
}

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  summary: string;
  monthlyPrice: number;
  limits: PlanLimits;
}

export const PLANS: readonly PlanDefinition[] = [
  {
    tier: "free",
    name: "무료",
    summary: "첫 강의를 올려 보는 단계",
    monthlyPrice: 0,
    limits: { courses: 1, students: 10, products: 0 },
  },
  {
    tier: "basic",
    name: "베이직",
    summary: "강의와 상품을 함께 파는 강사",
    monthlyPrice: 29_000,
    limits: { courses: 10, students: 500, products: 5 },
  },
  {
    tier: "pro",
    name: "프로",
    summary: "규모가 커진 전업 강사",
    monthlyPrice: 79_000,
    limits: { courses: Infinity, students: Infinity, products: Infinity },
  },
];

/** Feature matrix rows: which plans include each feature. */
export const PLAN_FEATURES: readonly { label: string; value: Record<PlanTier, string | boolean> }[] = [
  { label: "강의 등록", value: { free: "1개", basic: "10개", pro: "무제한" } },
  { label: "수강생", value: { free: "10명", basic: "500명", pro: "무제한" } },
  { label: "커리큘럼 빌더", value: { free: "기본", basic: "고급", pro: "고급" } },
  { label: "디지털 상품 판매", value: { free: false, basic: "5개", pro: "무제한" } },
  { label: "수익 분석", value: { free: "기본 리포트", basic: "상세 분석", pro: "상세 분석 + 내보내기" } },
  { label: "쿠폰·할인 코드", value: { free: false, basic: true, pro: true } },
  { label: "화이트라벨 브랜딩", value: { free: false, basic: false, pro: true } },
  { label: "API 접근", value: { free: false, basic: false, pro: true } },
  { label: "지원", value: { free: "이메일", basic: "우선 이메일", pro: "전담 매니저" } },
];

export const PLAN_FAQ: readonly { q: string; a: string }[] = [
  { q: "무료 플랜에서 유료로 업그레이드할 수 있나요?", a: "언제든지 바꿀 수 있어요. 강의·수강생·상품 데이터는 그대로 유지돼요." },
  { q: "환불 정책은 어떻게 되나요?", a: "결제 후 7일 이내에 환불할 수 있고, 사용한 기능에 따라 부분 환불될 수 있어요." },
  { q: "수수료가 있나요?", a: "강의와 디지털 상품 판매 금액에 결제 수수료 3.5%가 붙어요." },
  { q: "계약 기간이 있나요?", a: "월 단위 구독이라 언제든지 해지할 수 있어요. 연간 결제를 고르면 20% 할인돼요." },
];

export const YEARLY_DISCOUNT = 0.2;

export function planOf(tier: PlanTier): PlanDefinition {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) throw new Error(`Unknown plan: ${tier}`);
  return plan;
}

/** What the plan costs per month on the chosen cycle, and per year when billed yearly. */
export function planPrice(tier: PlanTier, billing: BillingCycle) {
  const { monthlyPrice } = planOf(tier);
  if (billing === "monthly") return { perMonth: monthlyPrice, perYear: monthlyPrice * 12 };
  const perYear = Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT));
  return { perMonth: Math.round(perYear / 12), perYear };
}

export type LimitedResource = keyof PlanLimits;

/** Noun with its object particle (을/를), and the counting unit. */
const RESOURCE_LABEL: Record<LimitedResource, { object: string; unit: string }> = {
  courses: { object: "강의를", unit: "개" },
  students: { object: "수강생을", unit: "명" },
  products: { object: "디지털 상품을", unit: "개" },
};

/** Null when one more `resource` fits the plan, otherwise a Korean explanation. */
export function limitProblem(tier: PlanTier, resource: LimitedResource, current: number): string | null {
  const plan = planOf(tier);
  const limit = plan.limits[resource];
  if (current < limit) return null;
  const { object, unit } = RESOURCE_LABEL[resource];
  if (limit === 0) return `${plan.name} 요금제에서는 ${object} 판매할 수 없어요. 요금제를 바꾼 뒤 다시 시도해 주세요.`;
  return `${plan.name} 요금제에서는 ${object} ${limit}${unit}까지 만들 수 있어요. 요금제를 올리거나 기존 ${object} 정리해 주세요.`;
}

/** Null when the current usage fits `tier`, otherwise why the switch is blocked. */
export function downgradeProblem(tier: PlanTier, usage: Pick<PlanLimits, "courses" | "products">): string | null {
  const plan = planOf(tier);
  if (usage.courses > plan.limits.courses) {
    return `강의가 ${usage.courses}개라서 ${plan.name} 요금제(${plan.limits.courses}개)로 바꿀 수 없어요. 강의를 정리한 뒤 다시 시도해 주세요.`;
  }
  if (usage.products > plan.limits.products) {
    return plan.limits.products === 0
      ? `디지털 상품이 ${usage.products}개 있어서 ${plan.name} 요금제로 바꿀 수 없어요. 상품을 삭제한 뒤 다시 시도해 주세요.`
      : `디지털 상품이 ${usage.products}개라서 ${plan.name} 요금제(${plan.limits.products}개)로 바꿀 수 없어요.`;
  }
  return null;
}

export function formatLimit(limit: number, unit: string): string {
  return Number.isFinite(limit) ? `${limit.toLocaleString("ko-KR")}${unit}` : "무제한";
}
