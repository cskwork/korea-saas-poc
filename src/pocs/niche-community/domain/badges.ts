import type { Role, Tier } from "./rules";

/**
 * Badges are never stored: they are derived from a member's activity, with the
 * instant each one was earned (the milestone timeline on the profile).
 * The set follows the legacy POC, plus 현장파 for meetups.
 */

export type BadgeKey = "operator" | "premium" | "founder" | "firstPost" | "writer" | "popular" | "commenter" | "regular";

export interface BadgeDefinition {
  key: BadgeKey;
  name: string;
  description: string;
  /** Count-based badges carry the threshold for progress. */
  target?: number;
}

/** Members who joined within this many days of the community opening are 파운더. */
export const FOUNDER_WINDOW_DAYS = 30;

export const BADGES: readonly BadgeDefinition[] = [
  { key: "operator", name: "운영자", description: "커뮤니티를 운영해요" },
  { key: "founder", name: "파운더", description: `문을 연 뒤 ${FOUNDER_WINDOW_DAYS}일 안에 합류한 초기 멤버` },
  { key: "premium", name: "프리미엄", description: "프리미엄 멤버십 이용 중" },
  { key: "firstPost", name: "첫 발자국", description: "첫 게시글을 올렸어요", target: 1 },
  { key: "writer", name: "작가", description: "게시글 10개 작성", target: 10 },
  { key: "commenter", name: "소통왕", description: "댓글 30개 작성", target: 30 },
  { key: "popular", name: "인기인", description: "받은 좋아요 50개", target: 50 },
  { key: "regular", name: "현장파", description: "모임 3회 참석", target: 3 },
];

export interface BadgeInput {
  role: Role;
  tier: Tier;
  joinedAt: Date;
  premiumSince: Date | null;
  communityOpenedAt: Date;
  postDates: readonly Date[];
  commentDates: readonly Date[];
  /** When each like on the member's posts was given. */
  likeReceivedDates: readonly Date[];
  /** Start times of meetups the member RSVP'd to that have already started. */
  attendedMeetupDates: readonly Date[];
}

export interface BadgeStatus extends BadgeDefinition {
  earnedAt: Date | null;
  /** Current count toward `target` (count badges only). */
  current?: number;
}

/** The instant the n-th event happened (1-based), or null when there are fewer than n. */
function nthDate(dates: readonly Date[], n: number): Date | null {
  if (dates.length < n) return null;
  return [...dates].sort((a, b) => a.getTime() - b.getTime())[n - 1];
}

export function evaluateBadges(input: BadgeInput): BadgeStatus[] {
  const counts: Record<"firstPost" | "writer" | "commenter" | "popular" | "regular", readonly Date[]> = {
    firstPost: input.postDates,
    writer: input.postDates,
    commenter: input.commentDates,
    popular: input.likeReceivedDates,
    regular: input.attendedMeetupDates,
  };
  const founderCutoff = input.communityOpenedAt.getTime() + FOUNDER_WINDOW_DAYS * 86_400_000;

  return BADGES.map((badge): BadgeStatus => {
    switch (badge.key) {
      case "operator":
        return { ...badge, earnedAt: input.role === "operator" ? input.joinedAt : null };
      case "founder":
        return { ...badge, earnedAt: input.joinedAt.getTime() <= founderCutoff ? input.joinedAt : null };
      case "premium":
        return {
          ...badge,
          earnedAt: input.tier === "premium" || input.role === "operator" ? (input.premiumSince ?? input.joinedAt) : null,
        };
      default: {
        const dates = counts[badge.key];
        const target = badge.target ?? 1;
        return { ...badge, earnedAt: nthDate(dates, target), current: Math.min(dates.length, target) };
      }
    }
  });
}

export const earnedBadges = (statuses: readonly BadgeStatus[]) =>
  statuses
    .filter((badge): badge is BadgeStatus & { earnedAt: Date } => badge.earnedAt !== null)
    .sort((a, b) => a.earnedAt.getTime() - b.earnedAt.getTime());

/** The unearned count badge closest to completion (for "다음 뱃지까지"), or null. */
export function nextBadge(statuses: readonly BadgeStatus[]): (BadgeStatus & { remaining: number }) | null {
  const candidates = statuses
    .filter((badge) => badge.earnedAt === null && badge.target !== undefined)
    .map((badge) => ({ ...badge, remaining: (badge.target ?? 0) - (badge.current ?? 0) }))
    .sort((a, b) => a.remaining / (a.target ?? 1) - b.remaining / (b.target ?? 1));
  return candidates[0] ?? null;
}
