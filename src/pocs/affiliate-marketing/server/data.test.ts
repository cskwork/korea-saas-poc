import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { seoulDateKey } from "@/core/format";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "../db/schema";
import { affiliateMarketing } from "../module";
import { createLinkInput, recordConversionInput, articleRequestInput } from "../domain/inputs";
import { templateDraft } from "../domain/templates";
import { conversionSummary, recordConversion, setConversionStatus } from "./conversions";
import { createArticleDraft } from "./drafting";
import { createLink, deleteLink, getLink, listLinks, updateLink } from "./links";
import { createProgram, deleteProgram, listPrograms } from "./programs";
import { analyticsReport, dashboardReport, linkReport, programReport } from "./reports";
import { recordClick, resolveCode } from "./tracking";

/** Integration: seed + the key reads and writes on an in-memory Postgres. */
describe("affiliate-marketing data", () => {
  let t: TestDatabase<typeof schema>;
  const today = seoulDateKey();

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, affiliateMarketing, t.workspaceId);
  });
  afterAll(() => t.close());

  it("seeds a lively sample workspace ending today", async () => {
    const links = await listLinks(t.db, t.workspaceId);
    expect(links).toHaveLength(12);
    expect(new Set(links.map((l) => l.code)).size).toBe(12);
    expect(links.some((l) => l.status === "paused")).toBe(true);
    expect(links.some((l) => l.status === "expired")).toBe(true);

    const dashboard = await dashboardReport(t.db, t.workspaceId, today);
    expect(dashboard.series).toHaveLength(30);
    expect(dashboard.series.at(-1)!.day).toBe(today);
    expect(dashboard.totals.clicks).toBeGreaterThan(0);
    expect(dashboard.topLinks.length).toBeGreaterThan(0);
    expect(dashboard.goal.goal).toBe(400_000);
  });

  it("keeps workspaces isolated", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, affiliateMarketing, other);
    const mine = await listLinks(t.db, t.workspaceId);
    const theirs = await listLinks(t.db, other);
    expect(theirs).toHaveLength(12);
    expect(mine.map((l) => l.id)).not.toContain(theirs[0].id);
    // A foreign id is invisible and immutable from this workspace.
    expect(await getLink(t.db, t.workspaceId, theirs[0].id)).toBeNull();
    expect(await deleteLink(t.db, t.workspaceId, theirs[0].id)).toBeNull();
    expect(await linkReport(t.db, t.workspaceId, theirs[0].id, today)).toBeNull();
  });

  it("creates a link with a unique short code and rejects a taken custom code", async () => {
    const [program] = await listPrograms(t.db, t.workspaceId);
    const input = createLinkInput.parse({
      productName: "테스트 무선 청소기",
      programId: program.id,
      category: "생활용품",
      destinationUrl: "https://www.coupang.com/np/search?q=test",
      priceWon: "249,000",
      commissionType: "percent",
      commissionRate: "3.5",
      code: "Test-Vacuum",
      memo: "",
    });
    const created = await createLink(t.db, t.workspaceId, input);
    expect(created.code).toBe("test-vacuum");
    await expect(createLink(t.db, t.workspaceId, input)).rejects.toThrow("이미 사용 중인 코드");

    const generated = await createLink(t.db, t.workspaceId, { ...input, code: null });
    expect(generated.code).toMatch(/^[a-z2-9]{6}$/);

    const link = await getLink(t.db, t.workspaceId, created.id);
    expect(link?.commissionRateBp).toBe(350);
    expect(link?.priceWon).toBe(249_000);
  });

  it("records clicks through the global code lookup and orders with computed commission", async () => {
    const [link] = await listLinks(t.db, t.workspaceId, { q: "테스트 무선" });
    const resolved = await resolveCode(t.db, link.code);
    expect(resolved?.workspaceId).toBe(t.workspaceId);
    await recordClick(t.db, { linkId: resolved!.id, workspaceId: resolved!.workspaceId, channel: "instagram", referrerHost: "l.instagram.com", device: "mobile" });
    await recordClick(t.db, { linkId: resolved!.id, workspaceId: resolved!.workspaceId, channel: "naver_blog", referrerHost: "blog.naver.com", device: "desktop" });

    const order = await recordConversion(
      t.db,
      t.workspaceId,
      recordConversionInput.parse({ linkId: link.id, orderedOn: today, orderAmount: "249,000", status: "pending", note: "" }),
    );
    expect(order.commissionWon).toBe(8_715); // 249,000 × 3.5%, floored

    const override = await recordConversion(
      t.db,
      t.workspaceId,
      recordConversionInput.parse({ linkId: link.id, orderedOn: today, orderAmount: "10000", commissionOverride: "1200", note: "" }),
    );
    expect(override.commissionWon).toBe(1_200);
    await setConversionStatus(t.db, t.workspaceId, override.id, "cancelled");

    const report = await linkReport(t.db, t.workspaceId, link.id, today);
    expect(report?.lifetime.clicks).toBe(2);
    expect(report?.lifetime.conversions).toBe(1);
    expect(report?.lifetime.revenue).toBe(8_715);
    expect(report?.byChannel.map((c) => c.key).sort()).toEqual(["instagram", "naver_blog"]);

    const summary = await conversionSummary(t.db, t.workspaceId, today, today);
    expect(summary.cancelled.commission).toBeGreaterThanOrEqual(1_200);
  });

  it("updates a link without touching its code, and deleting it cascades clicks and orders", async () => {
    const [link] = await listLinks(t.db, t.workspaceId, { q: "테스트 무선" });
    await updateLink(t.db, t.workspaceId, {
      id: link.id,
      productName: "테스트 무선 청소기 2세대",
      programId: link.programId,
      category: "생활용품",
      destinationUrl: link.destinationUrl,
      priceWon: 259_000,
      commissionType: "fixed",
      commissionRate: 0,
      commissionFixed: 5_000,
      memo: "",
      status: "paused",
    });
    const updated = await getLink(t.db, t.workspaceId, link.id);
    expect(updated).toMatchObject({ productName: "테스트 무선 청소기 2세대", code: link.code, status: "paused", commissionType: "fixed", commissionFixedWon: 5_000 });

    await deleteLink(t.db, t.workspaceId, link.id);
    const leftover = await t.db.select().from(schema.clicks).where(and(eq(schema.clicks.workspaceId, t.workspaceId), eq(schema.clicks.linkId, link.id)));
    expect(leftover).toHaveLength(0);
  });

  it("computes analytics and the program comparison from rows", async () => {
    const report = await analyticsReport(t.db, t.workspaceId, today, 30);
    expect(report.series).toHaveLength(30);
    const byLinkClicks = report.byLink.reduce((sum, row) => sum + row.clicks, 0);
    expect(byLinkClicks).toBe(report.totals.clicks);
    expect(report.hours).toHaveLength(24);
    expect(report.hours.reduce((a, b) => a + b, 0)).toBe(report.totals.clicks);
    expect(report.byProgram.reduce((sum, row) => sum + row.revenue, 0)).toBe(report.totals.revenue);

    const programs = await programReport(t.db, t.workspaceId, today);
    expect(programs.programs.map((p) => p.program.name)).toEqual(["쿠팡 파트너스", "텐핑", "네이버 애드포스트"]);
    expect(programs.programs[0].linkCount).toBeGreaterThan(0);
  });

  it("refuses to delete a program that still has links", async () => {
    const [coupang] = await listPrograms(t.db, t.workspaceId);
    await expect(deleteProgram(t.db, t.workspaceId, coupang.id)).rejects.toThrow("다른 프로그램으로 옮긴 뒤");
    const created = await createProgram(t.db, t.workspaceId, {
      name: "알리 어필리에이트",
      model: "cps",
      defaultRate: 500,
      defaultFixed: null,
      settlementCycle: "",
      minPayout: null,
      cookieWindow: "",
      bestChannels: "",
      bestCategories: "",
      notes: "",
    });
    expect(await deleteProgram(t.db, t.workspaceId, created.id)).toEqual({ id: created.id });
  });

  it("saves a generated draft with the tracked links in the body", async () => {
    const options = await listLinks(t.db, t.workspaceId);
    const input = articleRequestInput.parse({
      kind: "comparison",
      title: "",
      audience: "",
      summary: "",
      itemLinkId: [options[0].id, options[1].id],
      itemName: ["", ""],
      itemPrice: ["", ""],
      itemRating: ["4.5", "4"],
      itemPros: ["가벼움, 조용함", "배터리 오래감"],
      itemCons: ["", "무거움"],
      itemReason: ["", ""],
    });
    const result = await createArticleDraft(t.db, t.workspaceId, input, "https://example.test", async (request) => ({
      data: templateDraft(request),
      source: "template",
    }));
    const [article] = await t.db.select().from(schema.articles).where(eq(schema.articles.id, result.id));
    expect(article.source).toBe("template");
    expect(article.body).toContain(`https://example.test/affiliate-marketing/go/${options[0].code}?c=nb`);
    expect(article.body.startsWith("> 이 포스팅은")).toBe(true);
  });

  it("reset restores the sample data for this workspace only", async () => {
    await resetModule(t.db, affiliateMarketing, t.workspaceId);
    const links = await listLinks(t.db, t.workspaceId);
    expect(links).toHaveLength(12);
    expect(links.some((l) => l.productName.startsWith("테스트"))).toBe(false);
  });
});
