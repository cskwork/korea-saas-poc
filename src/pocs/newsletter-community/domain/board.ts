import { isPaidTier, type Tier } from "./tiers";

export const BOARD_CATEGORIES = ["notice", "discussion", "question"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

export const BOARD_CATEGORY_LABEL: Record<BoardCategory, string> = {
  notice: "공지",
  discussion: "이야기",
  question: "질문",
};

/**
 * Who is acting on the board: the editor (studio) or a reader recognised by
 * the reader cookie (public letter).
 */
export type BoardActor =
  | { role: "editor"; name: string }
  | { role: "member"; name: string; subscriberId: string; tier: Tier; active: boolean };

export function likerKey(actor: BoardActor): string {
  return actor.role === "editor" ? "editor" : actor.subscriberId;
}

/** Paid, active members and the editor take part; everyone else may read. */
export function canParticipate(actor: BoardActor | null): boolean {
  if (!actor) return false;
  return actor.role === "editor" || (actor.active && isPaidTier(actor.tier));
}

/** Notices are the editor's; members write stories and questions. */
export function categoriesFor(actor: BoardActor): BoardCategory[] {
  return actor.role === "editor" ? [...BOARD_CATEGORIES] : ["discussion", "question"];
}

/** Editors moderate everything; members may delete only their own words. */
export function canDelete(actor: BoardActor | null, author: { authorSubscriberId: string | null; authorRole: "editor" | "member" }) {
  if (!actor) return false;
  if (actor.role === "editor") return true;
  return author.authorRole === "member" && author.authorSubscriberId === actor.subscriberId;
}
