import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "../../db/schema";
import { HISTORY_DAYS } from "../../db/seed";
import { templateListingCopy } from "../../domain/listing-copy";
import { smartStore } from "../../module";
import { getAnalytics } from "./analytics";
import { clearCalculations, listCalculations, saveCalculation } from "./calculations";
import { getCatalogEntry, listCatalog, topUnlistedItems } from "./catalog";
import { researchKeywords, removeSavedKeyword, saveKeyword } from "./keywords";
import { catalogListingDraft, deleteListing, getListing, insertListing, listListings, updateListing } from "./listings";
import { advanceOrder, cancelOrder, createTestOrder, listOrders, orderStatusCounts, waitingOrders } from "./orders";

describe("smart-store data (seeded workspace)", () => {
  let t: TestDatabase<typeof schema>;
  let other: string;

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, smartStore, t.workspaceId);
    other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, smartStore, other);
  });
  afterAll(() => t.close());

  it("seeds a live-looking store relative to today", async () => {
    const counts = await orderStatusCounts(t.db, t.workspaceId);
    expect(counts.new).toBeGreaterThanOrEqual(5);
    expect(counts.delivered).toBeGreaterThan(100);
    const analytics = await getAnalytics(t.db, t.workspaceId, 30);
    expect(analytics.current.orders).toBeGreaterThan(60);
    expect(analytics.previous.orders).toBeGreaterThan(30);
    expect(analytics.days.at(-1)?.orders).toBeGreaterThanOrEqual(5);
    expect(analytics.topSellers).toHaveLength(5);
    const listings = await listListings(t.db, t.workspaceId);
    expect(listings).toHaveLength(10);
    expect(listings.every((l) => l.title.length <= 50)).toBe(true);
    expect(HISTORY_DAYS).toBe(60);
  });

  it("filters the catalogue by supplier, category and minimum margin", async () => {
    const all = await listCatalog(t.db, t.workspaceId, { minMargin: 0, sort: "margin" });
    const food = await listCatalog(t.db, t.workspaceId, {
      category: "food",
      supplier: "domeggook",
      minMargin: 0,
      sort: "margin",
    });
    expect(food.entries.every((e) => e.category === "food" && e.supplier === "domeggook")).toBe(true);
    const strong = await listCatalog(t.db, t.workspaceId, { minMargin: 40, sort: "margin" });
    expect(strong.entries.every((e) => e.margin.marginRate >= 0.4)).toBe(true);
    expect(strong.hiddenByMargin).toBe(all.entries.length - strong.entries.length);
    const rates = all.entries.map((e) => e.margin.marginRate);
    expect(rates).toEqual([...rates].sort((a, b) => b - a));
    // The sample catalogue includes a loss-making item so the margin filter matters.
    expect(all.entries.some((e) => e.margin.profit < 0)).toBe(true);
    const search = await listCatalog(t.db, t.workspaceId, { minMargin: 0, sort: "margin", query: "텀블러" });
    expect(search.entries.map((e) => e.name)).toEqual(["스테인리스 텀블러 500ml 보온보냉"]);
  });

  it("lists a catalogue item and marks it listed", async () => {
    const [pick] = await topUnlistedItems(t.db, t.workspaceId, 4);
    const draft = await catalogListingDraft(t.db, t.workspaceId, pick.id);
    expect(draft?.existingListingId).toBeNull();
    const id = await insertListing(t.db, t.workspaceId, {
      catalogItemId: pick.id,
      originalName: pick.name,
      category: pick.category,
      supplier: pick.supplier,
      cost: pick.wholesalePrice,
      price: pick.suggestedPrice,
      shippingCost: pick.shippingCost,
      copy: templateListingCopy(draft!.copyInput),
      copySource: "template",
    });
    expect((await getCatalogEntry(t.db, t.workspaceId, pick.id))?.listing).toEqual({ id, status: "selling" });
    expect((await catalogListingDraft(t.db, t.workspaceId, pick.id))?.existingListingId).toBe(id);
    expect((await topUnlistedItems(t.db, t.workspaceId, 30)).some((e) => e.id === pick.id)).toBe(false);

    const updated = await updateListing(t.db, t.workspaceId, id, {
      price: pick.suggestedPrice + 1_000,
      status: "paused",
    });
    expect(updated.price).toBe(pick.suggestedPrice + 1_000);
    const entry = await getListing(t.db, t.workspaceId, id);
    expect(entry?.margin.price).toBe(pick.suggestedPrice + 1_000);
    await expect(createTestOrder(t.db, t.workspaceId, { listingId: id, quantity: 1 })).rejects.toThrow("판매중지");

    await deleteListing(t.db, t.workspaceId, id);
    expect(await getListing(t.db, t.workspaceId, id)).toBeNull();
    expect((await getCatalogEntry(t.db, t.workspaceId, pick.id))?.listing).toBeNull();
  });

  it("walks an order through the workflow and rejects invalid steps", async () => {
    const [listing] = await listListings(t.db, t.workspaceId, { status: "selling" });
    const order = await createTestOrder(t.db, t.workspaceId, { listingId: listing.id, quantity: 2 });
    expect(order).toMatchObject({ status: "new", quantity: 2, unitPrice: listing.price, isTest: true });
    expect(order.orderNo).toMatch(/^\d{16}$/);

    expect((await advanceOrder(t.db, t.workspaceId, { id: order.id })).status).toBe("confirmed");
    await expect(
      advanceOrder(t.db, t.workspaceId, { id: order.id, courier: "CJ대한통운", trackingNumber: "12" }),
    ).rejects.toThrow("송장번호");
    const shipped = await advanceOrder(t.db, t.workspaceId, {
      id: order.id,
      courier: "CJ대한통운",
      trackingNumber: "6123-4567-8901",
    });
    expect(shipped).toMatchObject({ status: "shipping", trackingNumber: "612345678901", courier: "CJ대한통운" });
    await expect(cancelOrder(t.db, t.workspaceId, order.id)).rejects.toThrow("취소할 수 없어요");
    expect((await advanceOrder(t.db, t.workspaceId, { id: order.id })).status).toBe("delivered");
    await expect(advanceOrder(t.db, t.workspaceId, { id: order.id })).rejects.toThrow("처리가 끝난");

    const [waiting] = await waitingOrders(t.db, t.workspaceId, 1);
    expect((await cancelOrder(t.db, t.workspaceId, waiting.id)).status).toBe("cancelled");
  });

  it("filters and paginates orders", async () => {
    const page1 = await listOrders(t.db, t.workspaceId, { page: 1 });
    expect(page1.rows).toHaveLength(20);
    expect(page1.pages).toBeGreaterThan(5);
    const shipping = await listOrders(t.db, t.workspaceId, { status: "shipping", page: 1 });
    expect(shipping.rows.every((o) => o.status === "shipping" && o.trackingNumber)).toBe(true);
    const beyond = await listOrders(t.db, t.workspaceId, { page: 999 });
    expect(beyond.page).toBe(beyond.pages);
    const byCustomer = await listOrders(t.db, t.workspaceId, { query: page1.rows[0].customerName, page: 1 });
    expect(byCustomer.rows.every((o) => o.customerName === page1.rows[0].customerName)).toBe(true);
  });

  it("keeps calculation history per workspace", async () => {
    const before = await listCalculations(t.db, t.workspaceId);
    expect(before).toHaveLength(3);
    await saveCalculation(t.db, t.workspaceId, {
      label: "케이블 재검토",
      category: "digital",
      cost: 1_500,
      price: 7_900,
      shippingCost: 2_500,
      monthlyQuantity: 200,
    });
    const after = await listCalculations(t.db, t.workspaceId);
    expect(after[0]).toMatchObject({ label: "케이블 재검토" });
    expect(after[0].margin.profit).toBe(7_900 - 1_500 - 277 - 2_500);
    expect(await clearCalculations(t.db, t.workspaceId)).toBe(4);
    expect(await listCalculations(t.db, other)).toHaveLength(3);
  });

  it("researches and saves keywords", async () => {
    const research = await researchKeywords(t.db, t.workspaceId, "텀블러");
    expect(research.match?.exact?.keyword).toBe("텀블러");
    expect(research.match?.related).toHaveLength(7);
    expect(research.saved.map((s) => s.keyword)).toContain("보온 텀블러");

    expect(await saveKeyword(t.db, t.workspaceId, "  대용량   텀블러 ")).toBe(true);
    expect(await saveKeyword(t.db, t.workspaceId, "대용량 텀블러")).toBe(false);
    const saved = (await researchKeywords(t.db, t.workspaceId, "")).saved;
    const added = saved.find((s) => s.keyword === "대용량 텀블러");
    expect(added?.stat?.headKeyword).toBe("텀블러");
    await removeSavedKeyword(t.db, t.workspaceId, added!.id);
    await expect(removeSavedKeyword(t.db, t.workspaceId, added!.id)).rejects.toThrow();
  });

  it("never reads or writes another workspace's rows", async () => {
    const [foreign] = await listListings(t.db, other);
    expect(await getListing(t.db, t.workspaceId, foreign.id)).toBeNull();
    await expect(updateListing(t.db, t.workspaceId, foreign.id, { price: 1 })).rejects.toThrow();
    await expect(deleteListing(t.db, t.workspaceId, foreign.id)).rejects.toThrow();
    await expect(createTestOrder(t.db, t.workspaceId, { listingId: foreign.id, quantity: 1 })).rejects.toThrow();
    const [foreignOrder] = await waitingOrders(t.db, other, 1);
    await expect(advanceOrder(t.db, t.workspaceId, { id: foreignOrder.id })).rejects.toThrow();
    const untouched = await t.db
      .select()
      .from(schema.listings)
      .where(and(eq(schema.listings.workspaceId, other), eq(schema.listings.id, foreign.id)));
    expect(untouched[0].price).toBe(foreign.price);
  });

  it("reset restores the sample data", async () => {
    await resetModule(t.db, smartStore, t.workspaceId);
    expect(await listCalculations(t.db, t.workspaceId)).toHaveLength(3);
    expect(await listListings(t.db, t.workspaceId)).toHaveLength(10);
  });
});
