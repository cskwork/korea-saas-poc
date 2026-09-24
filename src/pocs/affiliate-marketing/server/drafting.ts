import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { AiOutcome } from "@/core/ai";
import { UserError } from "@/core/actions";
import { links, programs } from "../db/schema";
import { CHANNEL_TAGS, SOCIAL_PLATFORMS, SOCIAL_PLATFORM_CHANNEL, type SocialPlatform } from "../domain/catalog";
import { shortPath } from "../domain/codes";
import type { ArticleRequestInput, SocialRequestInput } from "../domain/inputs";
import type { Draft, DraftRequest } from "../domain/templates";
import type { SocialRequest, SocialVariantSet } from "../domain/social";
import { saveArticle, saveSocialPost } from "./content";
import type { Db } from "./db";

/**
 * Turns form input into generation requests (resolving picked links to their
 * tracked short URLs, scoped to the workspace), generates, and saves to the library.
 */

async function linksById(db: Db, workspaceId: string, ids: string[]) {
  if (ids.length === 0) return new Map<string, { code: string; productName: string; priceWon: number | null; category: string; programName: string | null }>();
  const rows = await db
    .select({ id: links.id, code: links.code, productName: links.productName, priceWon: links.priceWon, category: links.category, programName: programs.name })
    .from(links)
    .leftJoin(programs, eq(programs.id, links.programId))
    .where(and(eq(links.workspaceId, workspaceId), inArray(links.id, ids)));
  if (rows.length !== new Set(ids).size) throw new UserError("선택한 링크를 찾을 수 없어요. 목록을 새로고침해 주세요.");
  return new Map(rows.map((r) => [r.id, r]));
}

export async function buildDraftRequest(db: Db, workspaceId: string, input: ArticleRequestInput, origin: string): Promise<DraftRequest> {
  const byId = await linksById(
    db,
    workspaceId,
    input.items.flatMap((i) => (i.linkId ? [i.linkId] : [])),
  );
  return {
    kind: input.kind,
    title: input.title,
    audience: input.audience,
    summary: input.summary,
    items: input.items.map((item) => {
      const link = item.linkId ? byId.get(item.linkId) : undefined;
      return {
        name: item.name || link?.productName || "",
        priceWon: item.priceWon ?? link?.priceWon ?? null,
        rating: item.rating,
        pros: item.pros,
        cons: item.cons,
        reason: item.reason,
        url: link ? `${origin}${shortPath(link.code, CHANNEL_TAGS.naver_blog)}` : null,
        programName: link?.programName ?? null,
      };
    }),
  };
}

export async function createArticleDraft(
  db: Db,
  workspaceId: string,
  input: ArticleRequestInput,
  origin: string,
  generate: (request: DraftRequest) => Promise<AiOutcome<Draft>>,
) {
  const request = await buildDraftRequest(db, workspaceId, input, origin);
  const outcome = await generate(request);
  const saved = await saveArticle(db, workspaceId, {
    kind: input.kind,
    title: outcome.data.title.trim().slice(0, 120) || "제목 없는 초안",
    body: outcome.data.body,
    input: { title: input.title, audience: input.audience, summary: input.summary, items: input.items },
    source: outcome.source,
  });
  return { id: saved.id, source: outcome.source, notice: outcome.notice };
}

export async function buildSocialRequest(db: Db, workspaceId: string, input: SocialRequestInput, origin: string): Promise<SocialRequest> {
  const link = input.linkId ? (await linksById(db, workspaceId, [input.linkId])).get(input.linkId) : undefined;
  const urls = Object.fromEntries(
    SOCIAL_PLATFORMS.map((platform) => [
      platform,
      link ? `${origin}${shortPath(link.code, CHANNEL_TAGS[SOCIAL_PLATFORM_CHANNEL[platform]])}` : null,
    ]),
  ) as Record<SocialPlatform, string | null>;
  return {
    productName: input.productName,
    category: input.category,
    priceWon: input.price,
    salePriceWon: input.salePrice ?? link?.priceWon ?? null,
    points: input.points,
    programName: link?.programName ?? null,
    urls,
  };
}

export async function createSocialPost(
  db: Db,
  workspaceId: string,
  input: SocialRequestInput,
  origin: string,
  generate: (request: SocialRequest) => Promise<AiOutcome<SocialVariantSet>>,
) {
  const request = await buildSocialRequest(db, workspaceId, input, origin);
  const outcome = await generate(request);
  const saved = await saveSocialPost(db, workspaceId, {
    linkId: input.linkId,
    productName: input.productName,
    variants: outcome.data,
    source: outcome.source,
  });
  return { id: saved.id, source: outcome.source, notice: outcome.notice };
}
