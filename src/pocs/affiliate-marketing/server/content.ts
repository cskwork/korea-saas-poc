import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { articles, socialPosts, type ArticleInput, type SocialVariants } from "../db/schema";
import type { ArticleKind, ContentSource } from "../domain/catalog";
import type { Db } from "./db";

/** The content library: article drafts and SNS post sets. */

export async function listArticles(db: Db, workspaceId: string) {
  return db
    .select({ id: articles.id, kind: articles.kind, title: articles.title, source: articles.source, updatedAt: articles.updatedAt, body: articles.body })
    .from(articles)
    .where(eq(articles.workspaceId, workspaceId))
    .orderBy(desc(articles.updatedAt));
}

export type ArticleSummary = Awaited<ReturnType<typeof listArticles>>[number];

export async function getArticle(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.workspaceId, workspaceId), eq(articles.id, id)))
    .limit(1);
  return row ?? null;
}

export type ArticleRecord = NonNullable<Awaited<ReturnType<typeof getArticle>>>;

export async function saveArticle(
  db: Db,
  workspaceId: string,
  draft: { kind: ArticleKind; title: string; body: string; input: ArticleInput; source: ContentSource },
) {
  const [row] = await db
    .insert(articles)
    .values({ workspaceId, ...draft })
    .returning({ id: articles.id });
  return row;
}

export async function updateArticle(db: Db, workspaceId: string, id: string, patch: { title: string; body: string }) {
  const [row] = await db
    .update(articles)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(articles.workspaceId, workspaceId), eq(articles.id, id)))
    .returning({ id: articles.id });
  return row ?? null;
}

export async function deleteArticle(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .delete(articles)
    .where(and(eq(articles.workspaceId, workspaceId), eq(articles.id, id)))
    .returning({ id: articles.id });
  return row ?? null;
}

export async function listSocialPosts(db: Db, workspaceId: string) {
  return db.select().from(socialPosts).where(eq(socialPosts.workspaceId, workspaceId)).orderBy(desc(socialPosts.createdAt));
}

export type SocialPostRow = Awaited<ReturnType<typeof listSocialPosts>>[number];

export async function saveSocialPost(
  db: Db,
  workspaceId: string,
  post: { linkId: string | null; productName: string; variants: SocialVariants; source: ContentSource },
) {
  const [row] = await db
    .insert(socialPosts)
    .values({ workspaceId, ...post })
    .returning({ id: socialPosts.id });
  return row;
}

export async function deleteSocialPost(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .delete(socialPosts)
    .where(and(eq(socialPosts.workspaceId, workspaceId), eq(socialPosts.id, id)))
    .returning({ id: socialPosts.id });
  return row ?? null;
}
