import { z } from "zod";
import { withObject, withTopic } from "./korean";

/**
 * Input schemas shared by server actions (validation) and forms (length limits).
 */

export const LIMITS = {
  postTitle: 80,
  postBody: 5000,
  comment: 1000,
  channelName: 20,
  channelDescription: 80,
  meetupTitle: 60,
  meetupDescription: 1000,
  meetupLocation: 80,
  nickname: 12,
  headline: 40,
  bio: 200,
  search: 60,
} as const;

/** Curated channel icon keys (drawn with lucide in components/ChannelIcon). */
export const CHANNEL_ICONS = [
  "message",
  "rocket",
  "code",
  "megaphone",
  "coins",
  "graduation",
  "briefcase",
  "users",
  "lightbulb",
  "chart",
  "book",
  "coffee",
] as const;
export type ChannelIconKey = (typeof CHANNEL_ICONS)[number];

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${withObject(label)} 입력해 주세요.` })
    .trim()
    .min(min, min <= 1 ? `${withObject(label)} 입력해 주세요.` : `${withTopic(label)} ${min}자 이상 입력해 주세요.`)
    .max(max, `${withTopic(label)} ${max}자까지 입력할 수 있어요.`);

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${withTopic(label)} ${max}자까지 입력할 수 있어요.`)
    .optional()
    .transform((value) => value ?? "");

/** An HTML checkbox: "on" when checked, absent otherwise. */
const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const idInput = z.object({ id: z.uuid("잘못된 요청이에요.") });

export const postInput = z.object({
  channelId: z.uuid("채널을 선택해 주세요."),
  title: text("제목", 2, LIMITS.postTitle),
  body: text("본문", 2, LIMITS.postBody),
  premiumOnly: checkbox,
});
export type PostInput = z.infer<typeof postInput>;

export const postUpdateInput = postInput.extend({ id: z.uuid("잘못된 요청이에요.") });

export const commentInput = z.object({
  postId: z.uuid("잘못된 요청이에요."),
  body: text("댓글", 1, LIMITS.comment),
});

export const channelInput = z.object({
  name: text("채널 이름", 1, LIMITS.channelName),
  description: optionalText("설명", LIMITS.channelDescription),
  access: z.enum(["open", "premium"], { error: "공개 범위를 선택해 주세요." }),
  icon: z.enum(CHANNEL_ICONS, { error: "아이콘을 골라 주세요." }),
});
export type ChannelInput = z.infer<typeof channelInput>;

export const channelUpdateInput = channelInput.extend({ id: z.uuid("잘못된 요청이에요.") });

export const channelMoveInput = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });

export const meetupInput = z.object({
  title: text("모임 이름", 2, LIMITS.meetupTitle),
  description: optionalText("소개", LIMITS.meetupDescription),
  date: z.iso.date("날짜를 선택해 주세요."),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "시작 시간을 입력해 주세요."),
  durationMinutes: z.coerce
    .number({ error: "진행 시간을 입력해 주세요." })
    .int("분 단위로 입력해 주세요.")
    .min(30, "30분 이상으로 잡아 주세요.")
    .max(600, "10시간까지 잡을 수 있어요."),
  location: text("장소", 2, LIMITS.meetupLocation),
  format: z.enum(["offline", "online"], { error: "진행 방식을 선택해 주세요." }),
  capacity: z.coerce
    .number({ error: "정원을 입력해 주세요." })
    .int("정원은 숫자로 입력해 주세요.")
    .min(2, "정원은 2명 이상이어야 해요.")
    .max(500, "정원은 500명까지 가능해요."),
  access: z.enum(["open", "premium"], { error: "공개 범위를 선택해 주세요." }),
});
export type MeetupInput = z.infer<typeof meetupInput>;

export const meetupUpdateInput = meetupInput.extend({ id: z.uuid("잘못된 요청이에요.") });

export const profileInput = z.object({
  nickname: text("닉네임", 2, LIMITS.nickname),
  headline: optionalText("한 줄 소개", LIMITS.headline),
  bio: optionalText("소개", LIMITS.bio),
});
export type ProfileInput = z.infer<typeof profileInput>;

export const tierChangeInput = z.object({ change: z.enum(["upgrade", "downgrade"]) });

/* ---- feed query (URL search params) ---- */

export const FEED_PAGE_SIZE = 12;

export interface FeedQuery {
  channelId: string | null;
  sort: "latest" | "popular";
  q: string;
  limit: number;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Tolerant parsing of the feed's search params: anything invalid falls back to the default. */
export function parseFeedQuery(params: Record<string, string | string[] | undefined>): FeedQuery {
  const channel = first(params.channel);
  const limit = Number(first(params.limit));
  return {
    channelId: channel && z.uuid().safeParse(channel).success ? channel : null,
    sort: first(params.sort) === "popular" ? "popular" : "latest",
    q: (first(params.q) ?? "").trim().slice(0, LIMITS.search),
    limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 120) : FEED_PAGE_SIZE,
  };
}

/** Serializes a feed query back to a search string (defaults omitted). */
export function feedSearch(query: Partial<FeedQuery>): string {
  const params = new URLSearchParams();
  if (query.channelId) params.set("channel", query.channelId);
  if (query.sort === "popular") params.set("sort", "popular");
  if (query.q) params.set("q", query.q);
  if (query.limit && query.limit !== FEED_PAGE_SIZE) params.set("limit", String(query.limit));
  const search = params.toString();
  return search ? `?${search}` : "";
}
