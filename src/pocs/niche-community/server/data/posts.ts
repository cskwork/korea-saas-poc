import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { channels, comments, likes, members, posts } from "../../db/schema";
import type { FeedQuery, PostInput } from "../../domain/inputs";
import {
  canDeleteComment,
  canDeletePost,
  canEditPost,
  canPostIn,
  canReadPost,
  hasPremiumAccess,
  isOperator,
  postingAllowance,
  resolvePremiumOnly,
  type Access,
  type Role,
  type Tier,
  type Viewer,
} from "../../domain/rules";
import { excerpt, likePattern } from "../../domain/text";
import { seoulDateKey, seoulInstant } from "../../domain/time";
import type { ChannelIconKey } from "../../domain/inputs";
import type { Db } from "./db";
import type { FeedItem, Neighbors, PostView } from "../types";

/* ---- shared select ---- */

const likeCount = sql<number>`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number);
const commentCount = sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(Number);
const likedBy = (memberId: string) =>
  sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.memberId} = ${memberId})`;

function postSelect(viewer: Viewer) {
  return {
    id: posts.id,
    title: posts.title,
    body: posts.body,
    premiumOnly: posts.premiumOnly,
    pinned: posts.pinned,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    channelId: channels.id,
    channelName: channels.name,
    channelIcon: channels.icon,
    channelAccess: channels.access,
    authorId: members.id,
    authorNickname: members.nickname,
    authorHeadline: members.headline,
    authorRole: members.role,
    authorTier: members.tier,
    likeCount,
    commentCount,
    likedByViewer: likedBy(viewer.id),
  };
}

interface PostRow {
  id: string;
  title: string;
  body: string;
  premiumOnly: boolean;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  channelId: string;
  channelName: string;
  channelIcon: string;
  channelAccess: Access;
  authorId: string;
  authorNickname: string;
  authorHeadline: string;
  authorRole: Role;
  authorTier: Tier;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
}

function toFeedItem(row: PostRow, viewer: Viewer): FeedItem & { body: string | null } {
  const readable = canReadPost(viewer, { authorId: row.authorId, premiumOnly: row.premiumOnly });
  return {
    id: row.id,
    title: row.title,
    body: readable ? row.body : null,
    excerpt: readable ? excerpt(row.body) : null,
    bodyLength: row.body.length,
    locked: !readable,
    premiumOnly: row.premiumOnly,
    pinned: row.pinned,
    createdAt: row.createdAt,
    edited: row.updatedAt.getTime() - row.createdAt.getTime() > 60_000,
    channel: { id: row.channelId, name: row.channelName, icon: row.channelIcon as ChannelIconKey, access: row.channelAccess },
    author: {
      id: row.authorId,
      nickname: row.authorNickname,
      headline: row.authorHeadline,
      role: row.authorRole,
      tier: row.authorTier,
    },
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    likedByViewer: Boolean(row.likedByViewer),
  };
}

function baseQuery(db: Db, viewer: Viewer) {
  return db
    .select(postSelect(viewer))
    .from(posts)
    .innerJoin(channels, eq(channels.id, posts.channelId))
    .innerJoin(members, eq(members.id, posts.authorId));
}

/* ---- feed ---- */

function feedWhere(workspaceId: string, viewer: Viewer, query: FeedQuery): SQL | undefined {
  const conditions: (SQL | undefined)[] = [eq(posts.workspaceId, workspaceId)];
  if (query.channelId) conditions.push(eq(posts.channelId, query.channelId));
  if (query.q) {
    const pattern = likePattern(query.q);
    // Bodies of posts the viewer cannot read are not searchable (no leaking 대외비 content).
    const readable = hasPremiumAccess(viewer) ? undefined : or(eq(posts.premiumOnly, false), eq(posts.authorId, viewer.id));
    conditions.push(or(ilike(posts.title, pattern), and(ilike(posts.body, pattern), readable)));
  }
  return and(...conditions);
}

function feedOrder(query: FeedQuery): SQL[] {
  if (query.sort === "popular") return [desc(sql`${likeCount} + 2 * ${commentCount}`), desc(posts.createdAt)];
  return query.q ? [desc(posts.createdAt)] : [desc(posts.pinned), desc(posts.createdAt)];
}

export async function loadFeed(db: Db, workspaceId: string, viewer: Viewer, query: FeedQuery) {
  const rows = await baseQuery(db, viewer)
    .where(feedWhere(workspaceId, viewer, query))
    .orderBy(...feedOrder(query))
    .limit(query.limit + 1);
  const items = rows.slice(0, query.limit).map((row) => {
    const { body: _body, ...item } = toFeedItem(row, viewer);
    return item satisfies FeedItem;
  });
  return { items, hasMore: rows.length > query.limit };
}

/** A member's latest posts (profile page). */
export async function loadMemberPosts(db: Db, workspaceId: string, viewer: Viewer, memberId: string, limit = 5) {
  const rows = await baseQuery(db, viewer)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.authorId, memberId)))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  return rows.map((row) => {
    const { body: _body, ...item } = toFeedItem(row, viewer);
    return item satisfies FeedItem;
  });
}

/** Titles of the neighbouring slides (presenter view's previous / next preview). */
export async function loadSlideTitles(db: Db, workspaceId: string, ids: string[]) {
  if (ids.length === 0) return [];
  return db
    .select({ id: posts.id, title: posts.title, channelName: channels.name })
    .from(posts)
    .innerJoin(channels, eq(channels.id, posts.channelId))
    .where(and(eq(posts.workspaceId, workspaceId), inArray(posts.id, ids)));
}

/** Position of a post inside a feed query, for 발표 모드 (previous / next slide). */
export async function loadNeighbors(
  db: Db,
  workspaceId: string,
  viewer: Viewer,
  query: FeedQuery,
  postId: string,
): Promise<Neighbors | null> {
  // Joined like the feed query so the correlated counts in the popular order stay table-qualified.
  const ids = await db
    .select({ id: posts.id })
    .from(posts)
    .innerJoin(channels, eq(channels.id, posts.channelId))
    .where(feedWhere(workspaceId, viewer, query))
    .orderBy(...feedOrder(query))
    .limit(500);
  const index = ids.findIndex((row) => row.id === postId);
  if (index < 0) return null;
  return {
    index,
    total: ids.length,
    previousId: ids[index - 1]?.id ?? null,
    nextId: ids[index + 1]?.id ?? null,
  };
}

export async function countPostsToday(db: Db, workspaceId: string, authorId: string, now: Date): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(posts)
    .where(
      and(
        eq(posts.workspaceId, workspaceId),
        eq(posts.authorId, authorId),
        gte(posts.createdAt, seoulInstant(seoulDateKey(now), "00:00")),
      ),
    );
  return row?.value ?? 0;
}

/* ---- single post ---- */

export async function loadPost(db: Db, workspaceId: string, viewer: Viewer, postId: string): Promise<PostView | null> {
  const [row] = await baseQuery(db, viewer)
    .where(and(eq(posts.id, postId), eq(posts.workspaceId, workspaceId)))
    .limit(1);
  if (!row) return null;
  const { excerpt: _excerpt, ...item } = toFeedItem(row, viewer);

  const commentRows = item.locked
    ? []
    : await db
        .select({
          id: comments.id,
          body: comments.body,
          createdAt: comments.createdAt,
          authorId: members.id,
          nickname: members.nickname,
          headline: members.headline,
          role: members.role,
          tier: members.tier,
        })
        .from(comments)
        .innerJoin(members, eq(members.id, comments.authorId))
        .where(and(eq(comments.postId, postId), eq(comments.workspaceId, workspaceId)))
        .orderBy(asc(comments.createdAt));

  return {
    ...item,
    channelId: row.channelId,
    canEdit: canEditPost(viewer, row),
    canDelete: canDeletePost(viewer, row),
    canPin: isOperator(viewer),
    comments: commentRows.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: {
        id: comment.authorId,
        nickname: comment.nickname,
        headline: comment.headline,
        role: comment.role,
        tier: comment.tier,
      },
      canDelete: canDeleteComment(viewer, { authorId: comment.authorId }),
    })),
  };
}

async function findPost(db: Db, workspaceId: string, postId: string) {
  const [post] = await db
    .select({ id: posts.id, authorId: posts.authorId, premiumOnly: posts.premiumOnly })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.workspaceId, workspaceId)))
    .limit(1);
  if (!post) throw new UserError("글을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  return post;
}

async function findWritableChannel(db: Db, workspaceId: string, viewer: Viewer, channelId: string) {
  const [channel] = await db
    .select({ id: channels.id, access: channels.access })
    .from(channels)
    .where(and(eq(channels.id, channelId), eq(channels.workspaceId, workspaceId)))
    .limit(1);
  if (!channel) throw new UserError("채널을 찾을 수 없어요. 다른 채널을 골라 주세요.");
  if (!canPostIn(viewer, channel)) throw new UserError("프리미엄 멤버만 글을 쓸 수 있는 채널이에요.");
  return channel;
}

/* ---- mutations ---- */

export async function createPost(db: Db, workspaceId: string, viewer: Viewer, input: PostInput, now: Date) {
  const channel = await findWritableChannel(db, workspaceId, viewer, input.channelId);
  const allowance = postingAllowance(viewer, await countPostsToday(db, workspaceId, viewer.id, now));
  if (!allowance.allowed) {
    throw new UserError(`무료 멤버는 하루 ${allowance.limit}개까지 글을 쓸 수 있어요. 내일 다시 쓰거나 프리미엄으로 바꿔 보세요.`);
  }
  const [created] = await db
    .insert(posts)
    .values({
      workspaceId,
      channelId: channel.id,
      authorId: viewer.id,
      title: input.title,
      body: input.body,
      premiumOnly: resolvePremiumOnly(channel, input.premiumOnly),
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: posts.id });
  return created.id;
}

export async function updatePost(db: Db, workspaceId: string, viewer: Viewer, input: PostInput & { id: string }, now: Date) {
  const post = await findPost(db, workspaceId, input.id);
  if (!canEditPost(viewer, post)) throw new UserError("내가 쓴 글만 고칠 수 있어요.");
  const channel = await findWritableChannel(db, workspaceId, viewer, input.channelId);
  await db
    .update(posts)
    .set({
      channelId: channel.id,
      title: input.title,
      body: input.body,
      premiumOnly: resolvePremiumOnly(channel, input.premiumOnly),
      updatedAt: now,
    })
    .where(and(eq(posts.id, post.id), eq(posts.workspaceId, workspaceId)));
}

export async function deletePost(db: Db, workspaceId: string, viewer: Viewer, postId: string) {
  const post = await findPost(db, workspaceId, postId);
  if (!canDeletePost(viewer, post)) throw new UserError("내가 쓴 글만 삭제할 수 있어요.");
  await db.delete(posts).where(and(eq(posts.id, post.id), eq(posts.workspaceId, workspaceId)));
}

export async function setPinned(db: Db, workspaceId: string, viewer: Viewer, postId: string, pinned: boolean) {
  if (!isOperator(viewer)) throw new UserError("공지 고정은 운영자만 할 수 있어요.");
  const post = await findPost(db, workspaceId, postId);
  await db.update(posts).set({ pinned }).where(and(eq(posts.id, post.id), eq(posts.workspaceId, workspaceId)));
}

/** Likes or unlikes; returns the new state and count. */
export async function toggleLike(db: Db, workspaceId: string, viewer: Viewer, postId: string) {
  const post = await findPost(db, workspaceId, postId);
  if (!canReadPost(viewer, post)) throw new UserError("프리미엄 멤버에게 공개된 글이에요.");
  const mine = and(eq(likes.postId, post.id), eq(likes.memberId, viewer.id), eq(likes.workspaceId, workspaceId));
  const removed = await db.delete(likes).where(mine).returning({ id: likes.id });
  if (removed.length === 0) {
    await db.insert(likes).values({ workspaceId, postId: post.id, memberId: viewer.id }).onConflictDoNothing();
  }
  const [row] = await db
    .select({ value: count() })
    .from(likes)
    .where(and(eq(likes.postId, post.id), eq(likes.workspaceId, workspaceId)));
  return { liked: removed.length === 0, count: row?.value ?? 0 };
}

export async function addComment(db: Db, workspaceId: string, viewer: Viewer, postId: string, body: string) {
  const post = await findPost(db, workspaceId, postId);
  if (!canReadPost(viewer, post)) throw new UserError("프리미엄 멤버에게 공개된 글이에요.");
  const [created] = await db
    .insert(comments)
    .values({ workspaceId, postId: post.id, authorId: viewer.id, body })
    .returning({ id: comments.id });
  return created.id;
}

export async function deleteComment(db: Db, workspaceId: string, viewer: Viewer, commentId: string) {
  const [comment] = await db
    .select({ id: comments.id, authorId: comments.authorId, postId: comments.postId })
    .from(comments)
    .where(and(eq(comments.id, commentId), eq(comments.workspaceId, workspaceId)))
    .limit(1);
  if (!comment) throw new UserError("댓글을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  if (!canDeleteComment(viewer, comment)) throw new UserError("내가 쓴 댓글만 삭제할 수 있어요.");
  await db.delete(comments).where(and(eq(comments.id, comment.id), eq(comments.workspaceId, workspaceId)));
  return comment.postId;
}
