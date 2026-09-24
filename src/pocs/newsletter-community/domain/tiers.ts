/** Subscription tiers and who may read what. */

export const TIERS = ["free", "basic", "pro"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABEL: Record<Tier, string> = { free: "무료", basic: "베이직", pro: "프로" };

export const AUDIENCES = ["everyone", "paid", "pro"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<Audience, string> = {
  everyone: "모든 구독자",
  paid: "유료 구독자",
  pro: "프로 구독자",
};

/** Short form for tags and table cells. */
export const AUDIENCE_SHORT: Record<Audience, string> = { everyone: "전체 공개", paid: "유료", pro: "프로 전용" };

const AUDIENCE_TIERS: Record<Audience, readonly Tier[]> = {
  everyone: TIERS,
  paid: ["basic", "pro"],
  pro: ["pro"],
};

export function isPaidTier(tier: Tier): boolean {
  return tier !== "free";
}

/** Tiers that receive (and may read) an issue meant for `audience`. */
export function audienceTiers(audience: Audience): readonly Tier[] {
  return AUDIENCE_TIERS[audience];
}

/** Whether a reader of `tier` (null: not a subscriber) can read an issue for `audience` in full. */
export function canRead(tier: Tier | null, audience: Audience): boolean {
  if (audience === "everyone") return true;
  return tier !== null && AUDIENCE_TIERS[audience].includes(tier);
}

/** The cheapest tier that unlocks `audience`. */
export function unlockingTier(audience: Audience): Tier {
  return AUDIENCE_TIERS[audience][0];
}

export const SUBSCRIBER_STATUS_LABEL = { active: "구독 중", unsubscribed: "해지" } as const;
export type SubscriberStatus = keyof typeof SUBSCRIBER_STATUS_LABEL;

export const SUBSCRIBER_SOURCE_LABEL = { manual: "직접 추가", signup: "구독 신청", import: "CSV 가져오기" } as const;
