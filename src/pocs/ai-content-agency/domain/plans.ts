import { KIND_LABEL, type ContentKind } from "./content";

/**
 * Monthly plans. Prices and quotas come from the legacy POC's pricing table; this is a
 * demo, so choosing a plan records the choice and no payment is taken.
 */
export const PLAN_IDS = ["starter", "pro", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in won; null means a custom quote. */
  priceWon: number | null;
  /** Orders per calendar month; null means unlimited. */
  monthlyQuota: number | null;
  kinds: readonly ContentKind[];
  audience: string;
  features: PlanFeature[];
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "스타터",
    priceWon: 290_000,
    monthlyQuota: 10,
    kinds: ["blog", "product"],
    audience: "블로그를 꾸준히 올리고 싶은 소규모 매장",
    features: [
      { label: "월 10건 의뢰", included: true },
      { label: "블로그 포스트·상품 설명", included: true },
      { label: "기본 검색 키워드 반영", included: true },
      { label: "이메일로 납품", included: true },
      { label: "광고 카피", included: false },
      { label: "전담 에디터", included: false },
    ],
  },
  pro: {
    id: "pro",
    name: "프로",
    priceWon: 790_000,
    monthlyQuota: 30,
    kinds: ["blog", "product", "ad"],
    audience: "상세페이지와 광고를 함께 돌리는 성장 중인 브랜드",
    features: [
      { label: "월 30건 의뢰", included: true },
      { label: "블로그·상품 설명·광고 카피", included: true },
      { label: "키워드 심화 반영", included: true },
      { label: "전담 에디터 배정", included: true },
      { label: "월간 납품 리포트", included: true },
      { label: "우선 검수", included: true },
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "엔터프라이즈",
    priceWon: null,
    monthlyQuota: null,
    kinds: ["blog", "product", "ad"],
    audience: "여러 브랜드·채널을 한꺼번에 맡기는 팀",
    features: [
      { label: "의뢰 건수 제한 없음", included: true },
      { label: "모든 콘텐츠 유형", included: true },
      { label: "브랜드 말투 가이드 반영", included: true },
      { label: "API 연동 상담", included: true },
      { label: "전담 에디터 팀", included: true },
      { label: "납기 약정(SLA) 협의", included: true },
    ],
  },
};

export const DEFAULT_PLAN: PlanId = "pro";

export type OrderAllowance = { ok: true; remaining: number | null } | { ok: false; reason: string };

/** Whether one more order of `kind` fits the plan this month. */
export function checkOrderAllowance(planId: PlanId, kind: ContentKind, usedThisMonth: number): OrderAllowance {
  const plan = PLANS[planId];
  if (!plan.kinds.includes(kind)) {
    return { ok: false, reason: `${plan.name} 요금제에는 ${KIND_LABEL[kind]}가 포함되지 않아요. 요금제를 바꾸면 의뢰할 수 있어요.` };
  }
  if (plan.monthlyQuota === null) return { ok: true, remaining: null };
  if (usedThisMonth >= plan.monthlyQuota) {
    return {
      ok: false,
      reason: `이번 달 ${plan.name} 요금제 의뢰 ${plan.monthlyQuota}건을 모두 썼어요. 요금제를 올리거나 다음 달에 접수해 주세요.`,
    };
  }
  return { ok: true, remaining: plan.monthlyQuota - usedThisMonth - 1 };
}

/** "29만원" / "맞춤 견적" */
export function planPriceLabel(plan: Plan): string {
  return plan.priceWon === null ? "맞춤 견적" : `${plan.priceWon / 10_000}만원`;
}
