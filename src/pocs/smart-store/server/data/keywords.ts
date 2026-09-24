import { and, asc, desc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { keywordStats, savedKeywords, type KeywordStat } from "../../db/schema";
import type { SmartStoreDb } from "../../db/types";
import { matchKeywords, normalizeKeyword, recommendationScore, type KeywordMatch } from "../../domain/keywords";

export interface KeywordResearch {
  query: string;
  match: KeywordMatch<KeywordStat> | null;
  /** Best-scoring head keywords, shown before a search and when nothing matches. */
  suggestions: KeywordStat[];
  saved: { id: string; keyword: string; stat: KeywordStat | null }[];
}

export async function researchKeywords(db: SmartStoreDb, workspaceId: string, query: string): Promise<KeywordResearch> {
  const [rows, saved] = await Promise.all([
    db.select().from(keywordStats).where(eq(keywordStats.workspaceId, workspaceId)).orderBy(asc(keywordStats.keyword)),
    db
      .select({ id: savedKeywords.id, keyword: savedKeywords.keyword })
      .from(savedKeywords)
      .where(eq(savedKeywords.workspaceId, workspaceId))
      .orderBy(desc(savedKeywords.createdAt)),
  ]);
  const byKeyword = new Map(rows.map((row) => [normalizeKeyword(row.keyword), row]));
  const suggestions = rows
    .filter((row) => row.keyword === row.headKeyword)
    .sort((a, b) => recommendationScore(b) - recommendationScore(a));
  const trimmed = query.trim();
  return {
    query: trimmed,
    match: trimmed ? matchKeywords(rows, trimmed) : null,
    suggestions,
    saved: saved.map((row) => ({ ...row, stat: byKeyword.get(normalizeKeyword(row.keyword)) ?? null })),
  };
}

export async function saveKeyword(db: SmartStoreDb, workspaceId: string, keyword: string): Promise<boolean> {
  const value = keyword.trim().replace(/\s+/g, " ");
  if (!value) throw new UserError("저장할 키워드를 입력해 주세요.");
  const inserted = await db
    .insert(savedKeywords)
    .values({ workspaceId, keyword: value })
    .onConflictDoNothing()
    .returning({ id: savedKeywords.id });
  return inserted.length > 0;
}

export async function removeSavedKeyword(db: SmartStoreDb, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(savedKeywords)
    .where(and(eq(savedKeywords.workspaceId, workspaceId), eq(savedKeywords.id, id)))
    .returning({ id: savedKeywords.id });
  if (deleted.length === 0) throw new UserError("이미 삭제된 키워드예요.");
}
