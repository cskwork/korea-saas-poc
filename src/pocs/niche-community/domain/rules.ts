/**
 * Community rules: who may read, write and manage what, and the free tier's limits.
 * Pure functions of plain values so every rule is unit-tested.
 */

/** The legacy POC's premium price (월 9,900원). */
export const PREMIUM_PRICE_WON = 9_900;

/** Free members may publish this many posts per Seoul day (legacy pricing rule "일 3회"). */
export const FREE_DAILY_POST_LIMIT = 3;

export type Role = "operator" | "member";
export type Tier = "free" | "premium";
export type Access = "open" | "premium";

export interface Viewer {
  id: string;
  role: Role;
  tier: Tier;
}

export const isOperator = (viewer: Viewer) => viewer.role === "operator";

/** Operators see everything; members need the premium tier for 대외비 floors. */
export const hasPremiumAccess = (viewer: Viewer) => isOperator(viewer) || viewer.tier === "premium";

export function canReadPost(viewer: Viewer, post: { authorId: string; premiumOnly: boolean }): boolean {
  return !post.premiumOnly || hasPremiumAccess(viewer) || post.authorId === viewer.id;
}

export function canPostIn(viewer: Viewer, channel: { access: Access }): boolean {
  return channel.access === "open" || hasPremiumAccess(viewer);
}

/** A post in a premium channel is always premium-only; elsewhere the author decides. */
export function resolvePremiumOnly(channel: { access: Access }, requested: boolean): boolean {
  return channel.access === "premium" || requested;
}

export const canEditPost = (viewer: Viewer, post: { authorId: string }) => post.authorId === viewer.id;

export const canDeletePost = (viewer: Viewer, post: { authorId: string }) =>
  post.authorId === viewer.id || isOperator(viewer);

export const canDeleteComment = (viewer: Viewer, comment: { authorId: string }) =>
  comment.authorId === viewer.id || isOperator(viewer);

export interface PostingAllowance {
  /** null = unlimited */
  limit: number | null;
  used: number;
  left: number | null;
  allowed: boolean;
}

export function postingAllowance(viewer: Viewer, postsToday: number): PostingAllowance {
  if (hasPremiumAccess(viewer)) return { limit: null, used: postsToday, left: null, allowed: true };
  const left = Math.max(0, FREE_DAILY_POST_LIMIT - postsToday);
  return { limit: FREE_DAILY_POST_LIMIT, used: postsToday, left, allowed: left > 0 };
}

export type TierChange = "upgrade" | "downgrade";

/** Validates a tier change for the acting member; returns a Korean reason when it is not allowed. */
export function tierChangeProblem(viewer: Viewer, change: TierChange): string | null {
  if (isOperator(viewer)) return "운영자 명찰은 멤버십 대상이 아니에요. 멤버 명찰로 바꿔서 해 보세요.";
  if (change === "upgrade" && viewer.tier === "premium") return "이미 프리미엄 멤버예요.";
  if (change === "downgrade" && viewer.tier === "free") return "이미 무료 플랜이에요.";
  return null;
}
