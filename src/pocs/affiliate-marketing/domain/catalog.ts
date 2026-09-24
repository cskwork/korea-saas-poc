/**
 * Vocabulary shared by the UI, actions and seeds: enum values and their Korean labels.
 * Kept free of drizzle imports so client components can use it.
 */

export const LINK_STATUSES = ["active", "paused", "expired"] as const;
export type LinkStatus = (typeof LINK_STATUSES)[number];
export const LINK_STATUS_LABEL: Record<LinkStatus, string> = {
  active: "판매 중",
  paused: "일시중지",
  expired: "판매 종료",
};
export const LINK_STATUS_HINT: Record<LinkStatus, string> = {
  active: "클릭을 기록하고 이동시켜요.",
  paused: "이동은 되지만 클릭을 기록하지 않아요.",
  expired: "방문자에게 종료 안내를 보여줘요.",
};

/** Orders are listed in pages of this size ("더 보기" adds a page). */
export const CONVERSION_PAGE_SIZE = 40;

export const CONVERSION_STATUSES = ["pending", "confirmed", "cancelled"] as const;
export type ConversionStatus = (typeof CONVERSION_STATUSES)[number];
export const CONVERSION_STATUS_LABEL: Record<ConversionStatus, string> = {
  pending: "확정 대기",
  confirmed: "구매 확정",
  cancelled: "취소·반품",
};

export const COMMISSION_MODELS = ["cps", "cpa", "cpc"] as const;
export type CommissionModel = (typeof COMMISSION_MODELS)[number];
export const COMMISSION_MODEL_LABEL: Record<CommissionModel, string> = {
  cps: "판매 수수료 (CPS)",
  cpa: "건당 고정 (CPA)",
  cpc: "클릭·광고 수익 (CPC)",
};

export const COMMISSION_TYPES = ["percent", "fixed"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export const CATEGORIES = ["전자기기", "생활용품", "뷰티", "식품·건강", "패션", "도서", "유아·키즈", "기타"] as const;

export const CHANNELS = [
  "naver_blog",
  "tistory",
  "instagram",
  "threads",
  "x",
  "youtube",
  "kakao",
  "direct",
  "other",
] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABEL: Record<Channel, string> = {
  naver_blog: "네이버 블로그",
  tistory: "티스토리",
  instagram: "인스타그램",
  threads: "스레드",
  x: "X",
  youtube: "유튜브",
  kakao: "카카오톡",
  direct: "직접 방문",
  other: "기타 사이트",
};

/** Short query tags appended to a short link to attribute clicks (`/go/abc?c=ig`). */
export const CHANNEL_TAGS: Partial<Record<Channel, string>> = {
  naver_blog: "nb",
  tistory: "ts",
  instagram: "ig",
  threads: "th",
  x: "x",
  youtube: "yt",
  kakao: "kt",
};

export const DEVICES = ["mobile", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];
export const DEVICE_LABEL: Record<Device, string> = { mobile: "모바일", tablet: "태블릿", desktop: "PC" };

export const ARTICLE_KINDS = ["comparison", "ranking", "review"] as const;
export type ArticleKind = (typeof ARTICLE_KINDS)[number];
export const ARTICLE_KIND_LABEL: Record<ArticleKind, string> = {
  comparison: "비교 리뷰",
  ranking: "추천 리스트",
  review: "상세 리뷰",
};
export const ARTICLE_KIND_HINT: Record<ArticleKind, string> = {
  comparison: "2~4개 제품을 표로 나란히 비교해요.",
  ranking: "최대 10개 제품을 순위로 추천해요.",
  review: "제품 하나를 장단점까지 깊게 다뤄요.",
};
export const ARTICLE_ITEM_LIMITS: Record<ArticleKind, { min: number; max: number }> = {
  comparison: { min: 2, max: 4 },
  ranking: { min: 1, max: 10 },
  review: { min: 1, max: 1 },
};

export const SOCIAL_PLATFORMS = ["instagram", "blog", "x", "threads"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export const SOCIAL_PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "인스타그램",
  blog: "블로그",
  x: "X",
  threads: "스레드",
};
/** The channel each platform's post links with, so its clicks are attributed. */
export const SOCIAL_PLATFORM_CHANNEL: Record<SocialPlatform, Channel> = {
  instagram: "instagram",
  blog: "naver_blog",
  x: "x",
  threads: "threads",
};

export type ContentSource = "claude" | "template";
export const CONTENT_SOURCE_LABEL: Record<ContentSource, string> = {
  claude: "Claude 작성",
  template: "기본 템플릿",
};

/** Korean advertising disclosure (공정위 추천·보증 심사지침) appended to every generated post. */
export function disclosureLine(programName: string | null): string {
  const program = programName?.trim() || "제휴 마케팅";
  return `이 포스팅은 ${program} 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`;
}
