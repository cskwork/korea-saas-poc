import { and, asc, count, desc, eq, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { comments, postLikes, posts } from "../../db/schema";
import {
  canDelete,
  canParticipate,
  categoriesFor,
  likerKey,
  type BoardActor,
  type BoardCategory,
} from "../../domain/board";
import type { Db } from "./db";

function commentCounts(db: Db, workspaceId: string) {
  return db
    .select({ postId: comments.postId, n: count().as("comment_count") })
    .from(comments)
    .where(eq(comments.workspaceId, workspaceId))
    .groupBy(comments.postId)
    .as("comment_counts");
}

function likeCounts(db: Db, workspaceId: string, viewerKey: string | null) {
  return db
    .select({
      postId: postLikes.postId,
      n: count().as("like_count"),
      mine: sql<boolean>`bool_or(${postLikes.likerKey} = ${viewerKey ?? ""})`.as("liked_by_viewer"),
    })
    .from(postLikes)
    .where(eq(postLikes.workspaceId, workspaceId))
    .groupBy(postLikes.postId)
    .as("like_counts");
}

/** Board posts, pinned first, with comment and like counts and whether the viewer liked each. */
export async function listPosts(
  db: Db,
  workspaceId: string,
  options: { category?: BoardCategory; viewer: BoardActor | null; limit?: number },
) {
  const commentsBy = commentCounts(db, workspaceId);
  const likesBy = likeCounts(db, workspaceId, options.viewer ? likerKey(options.viewer) : null);
  const conditions: SQL[] = [eq(posts.workspaceId, workspaceId)];
  if (options.category) conditions.push(eq(posts.category, options.category));

  const query = db
    .select({
      id: posts.id,
      category: posts.category,
      title: posts.title,
      body: posts.body,
      authorName: posts.authorName,
      authorRole: posts.authorRole,
      pinned: posts.pinned,
      createdAt: posts.createdAt,
      commentCount: commentsBy.n,
      likeCount: likesBy.n,
      liked: likesBy.mine,
    })
    .from(posts)
    .leftJoin(commentsBy, eq(commentsBy.postId, posts.id))
    .leftJoin(likesBy, eq(likesBy.postId, posts.id))
    .where(and(...conditions))
    .orderBy(desc(posts.pinned), desc(posts.createdAt));
  const rows = options.limit ? await query.limit(options.limit) : await query;
  return rows.map((row) => ({
    ...row,
    commentCount: Number(row.commentCount ?? 0),
    likeCount: Number(row.likeCount ?? 0),
    liked: Boolean(row.liked),
  }));
}

export type PostSummary = Awaited<ReturnType<typeof listPosts>>[number];

export async function categoryCounts(db: Db, workspaceId: string): Promise<Record<BoardCategory, number>> {
  const rows = await db
    .select({ category: posts.category, n: count() })
    .from(posts)
    .where(eq(posts.workspaceId, workspaceId))
    .groupBy(posts.category);
  const counts: Record<BoardCategory, number> = { notice: 0, discussion: 0, question: 0 };
  for (const row of rows) counts[row.category] = row.n;
  return counts;
}

export async function getPost(db: Db, workspaceId: string, id: string, viewer: BoardActor | null) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, id)))
    .limit(1);
  if (!post) return null;
  const [thread, likes] = await Promise.all([
    db
      .select()
      .from(comments)
      .where(and(eq(comments.workspaceId, workspaceId), eq(comments.postId, id)))
      .orderBy(asc(comments.createdAt)),
    db
      .select({ likerKey: postLikes.likerKey })
      .from(postLikes)
      .where(and(eq(postLikes.workspaceId, workspaceId), eq(postLikes.postId, id))),
  ]);
  const key = viewer ? likerKey(viewer) : null;
  return {
    ...post,
    comments: thread,
    likeCount: likes.length,
    liked: key !== null && likes.some((like) => like.likerKey === key),
  };
}

export type PostDetail = NonNullable<Awaited<ReturnType<typeof getPost>>>;

function requireParticipant(actor: BoardActor | null): asserts actor is BoardActor {
  if (!canParticipate(actor)) throw new UserError("독자 마당 글쓰기는 유료 구독자에게 열려 있어요.");
}

function authorFields(actor: BoardActor) {
  return {
    authorName: actor.name,
    authorRole: actor.role,
    authorSubscriberId: actor.role === "member" ? actor.subscriberId : null,
  };
}

export async function createPost(
  db: Db,
  workspaceId: string,
  actor: BoardActor | null,
  input: { category: BoardCategory; title: string; body: string },
  now: Date,
) {
  requireParticipant(actor);
  if (!categoriesFor(actor).includes(input.category)) throw new UserError("공지는 에디터만 쓸 수 있어요.");
  const [row] = await db
    .insert(posts)
    .values({ workspaceId, ...input, ...authorFields(actor), pinned: false, createdAt: now })
    .returning({ id: posts.id });
  return row.id;
}

export async function deletePost(db: Db, workspaceId: string, actor: BoardActor | null, id: string) {
  const [post] = await db
    .select({ authorRole: posts.authorRole, authorSubscriberId: posts.authorSubscriberId })
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, id)))
    .limit(1);
  if (!post) throw new UserError("글을 찾지 못했어요. 이미 지워졌을 수 있어요.");
  if (!canDelete(actor, post)) throw new UserError("이 글을 지울 권한이 없어요.");
  await db.delete(posts).where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, id)));
}

export async function setPinned(db: Db, workspaceId: string, actor: BoardActor | null, id: string, pinned: boolean) {
  if (actor?.role !== "editor") throw new UserError("고정은 에디터만 할 수 있어요.");
  const updated = await db
    .update(posts)
    .set({ pinned })
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, id)))
    .returning({ id: posts.id });
  if (updated.length === 0) throw new UserError("글을 찾지 못했어요.");
}

export async function addComment(
  db: Db,
  workspaceId: string,
  actor: BoardActor | null,
  postId: string,
  body: string,
  now: Date,
) {
  requireParticipant(actor);
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, postId)))
    .limit(1);
  if (!post) throw new UserError("글을 찾지 못했어요. 이미 지워졌을 수 있어요.");
  await db.insert(comments).values({ workspaceId, postId, body, ...authorFields(actor), createdAt: now });
}

export async function deleteComment(db: Db, workspaceId: string, actor: BoardActor | null, id: string) {
  const [comment] = await db
    .select({ authorRole: comments.authorRole, authorSubscriberId: comments.authorSubscriberId })
    .from(comments)
    .where(and(eq(comments.workspaceId, workspaceId), eq(comments.id, id)))
    .limit(1);
  if (!comment) throw new UserError("댓글을 찾지 못했어요.");
  if (!canDelete(actor, comment)) throw new UserError("이 댓글을 지울 권한이 없어요.");
  await db.delete(comments).where(and(eq(comments.workspaceId, workspaceId), eq(comments.id, id)));
}

/** Sets the viewer's like on a post (idempotent) and returns the new count. */
export async function setLike(db: Db, workspaceId: string, actor: BoardActor | null, postId: string, liked: boolean) {
  requireParticipant(actor);
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, postId)))
    .limit(1);
  if (!post) throw new UserError("글을 찾지 못했어요. 이미 지워졌을 수 있어요.");
  const key = likerKey(actor);
  if (liked) {
    await db.insert(postLikes).values({ workspaceId, postId, likerKey: key }).onConflictDoNothing();
  } else {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.workspaceId, workspaceId), eq(postLikes.postId, postId), eq(postLikes.likerKey, key)));
  }
  const [{ n }] = await db
    .select({ n: count() })
    .from(postLikes)
    .where(and(eq(postLikes.workspaceId, workspaceId), eq(postLikes.postId, postId)));
  return { liked, likeCount: n };
}
