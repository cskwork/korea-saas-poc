import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { templateBrief } from "../domain/brief";
import { orderInput } from "../domain/inputs";
import { monthlyTotals } from "../domain/revenue";
import * as schema from "../db/schema";
import { aiDesignVideo } from "../module";
import * as orderData from "./order-data";
import * as studioData from "./studio-data";

const TODAY = "2026-09-24";

describe("크리에이트잇 data", () => {
  let t: TestDatabase<typeof schema>;
  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, aiDesignVideo, t.workspaceId);
  });
  afterAll(() => t.close());

  const thumbnailPackage = async () =>
    (await studioData.listPackages(t.db, t.workspaceId, "single")).find((p) => p.orderType === "thumbnail")!;

  const intake = async (overrides: Record<string, unknown> = {}) => {
    const pkg = await thumbnailPackage();
    return orderInput.parse({
      packageId: pkg.id,
      type: "logo", // a single package decides the type
      title: "신규 카페 오픈 썸네일",
      clientName: "테스트 고객",
      clientContact: "test@example.com",
      brief: "밝은 톤",
      referenceLinks: "https://example.com/a\n\nhttps://example.com/b",
      dueDate: "2026-09-26",
      quantity: "2",
      rush: "on",
      price: "150000",
      revisionLimit: "2",
      tools: ["Canva", "ChatGPT"],
      ...overrides,
    });
  };

  it("seeds a living studio: open work around today, a year of deliveries, a price sheet", async () => {
    const open = await orderData.listOrders(t.db, t.workspaceId, { status: "open" });
    expect(open.length).toBeGreaterThanOrEqual(10);
    expect(open.some((o) => o.status === "revision")).toBe(true);

    const packages = await studioData.listPackages(t.db, t.workspaceId);
    expect(packages.filter((p) => p.kind === "subscription")).toHaveLength(3);

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
    const deliveries = await studioData.listDeliveries(t.db, t.workspaceId, today, 12);
    const months = monthlyTotals(deliveries, today.slice(0, 7), 12);
    expect(months.every((m) => m.total > 0)).toBe(true);
    expect(await studioData.getMonthlyGoal(t.db, t.workspaceId)).toBe(15_000_000);
    expect((await studioData.listPortfolio(t.db, t.workspaceId)).length).toBeGreaterThanOrEqual(9);
  });

  it("creates an order from a package with a day-numbered code and an intake event", async () => {
    const order = await orderData.createOrder(t.db, t.workspaceId, await intake(), TODAY);
    expect(order.code).toMatch(/^ORD-20260924-\d{3}$/);
    expect(order).toMatchObject({ type: "thumbnail", plan: "single", status: "received", rush: true, quantity: 2 });
    expect(order.referenceLinks).toEqual(["https://example.com/a", "https://example.com/b"]);

    const second = await orderData.createOrder(t.db, t.workspaceId, await intake(), TODAY);
    expect(Number(second.code.slice(-3))).toBe(Number(order.code.slice(-3)) + 1);

    const detail = await orderData.getOrderDetail(t.db, t.workspaceId, order.id);
    expect(detail?.events.map((e) => e.toStatus)).toEqual(["received"]);
  });

  it("runs the workflow, counts revision rounds and bills rounds beyond the allowance", async () => {
    const order = await orderData.createOrder(t.db, t.workspaceId, await intake(), TODAY);
    await orderData.transitionOrder(t.db, t.workspaceId, order.id, "drafting");

    for (const note of ["글자 크게", "배경 밝게"]) {
      await orderData.requestRevision(t.db, t.workspaceId, {
        orderId: order.id,
        note,
        extraConfirmed: false,
        extraFee: 0,
      });
      await orderData.transitionOrder(t.db, t.workspaceId, order.id, "drafting");
    }

    await expect(
      orderData.requestRevision(t.db, t.workspaceId, {
        orderId: order.id,
        note: "하나 더",
        extraConfirmed: false,
        extraFee: 0,
      }),
    ).rejects.toThrow(/모두 사용/);
    const extra = await orderData.requestRevision(t.db, t.workspaceId, {
      orderId: order.id,
      note: "하나 더",
      extraConfirmed: true,
      extraFee: 20_000,
    });
    expect(extra).toEqual({ round: 3, extraFee: 20_000 });

    await expect(orderData.transitionOrder(t.db, t.workspaceId, order.id, "delivered")).rejects.toThrow();
    await orderData.transitionOrder(t.db, t.workspaceId, order.id, "drafting");
    const delivered = await orderData.transitionOrder(t.db, t.workspaceId, order.id, "delivered");
    expect(delivered.deliveredAt).toBeInstanceOf(Date);

    const detail = await orderData.getOrderDetail(t.db, t.workspaceId, order.id);
    expect(detail?.order).toMatchObject({ revisionsUsed: 3, extraFees: 20_000, status: "delivered" });
    expect(detail?.revisions.every((r) => r.resolvedAt !== null)).toBe(true);
    expect(detail?.events.map((e) => e.toStatus)).toEqual([
      "received",
      "drafting",
      "revision",
      "drafting",
      "revision",
      "drafting",
      "revision",
      "drafting",
      "delivered",
    ]);

    const reopened = await orderData.transitionOrder(t.db, t.workspaceId, order.id, "drafting");
    expect(reopened.deliveredAt).toBeNull();
  });

  it("attaches briefs to the order", async () => {
    const [order] = await orderData.listOrders(t.db, t.workspaceId, { status: "received" });
    const content = templateBrief({ ...order, brief: "", clientName: order.clientName });
    const brief = await orderData.saveBrief(t.db, t.workspaceId, order.id, content, "template");
    const [listed] = await orderData.listOrders(t.db, t.workspaceId, { q: order.code });
    expect(listed.hasBrief).toBe(true);
    await orderData.deleteBrief(t.db, t.workspaceId, brief.id);
  });

  it("filters, searches and sorts orders", async () => {
    const found = await orderData.listOrders(t.db, t.workspaceId, { q: "귤라떼" });
    expect(found.map((o) => o.clientName)).toContain("귤담카페");
    expect(await orderData.listOrders(t.db, t.workspaceId, { q: "100%_없는" })).toEqual([]);

    const byAmount = await orderData.listOrders(t.db, t.workspaceId, { sort: "amount", type: "logo" });
    const totals = byAmount.map((o) => o.price + o.extraFees);
    expect(totals).toEqual([...totals].sort((a, b) => b - a));
  });

  it("keeps workspaces apart", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, aiDesignVideo, other);
    const [mine] = await orderData.listOrders(t.db, t.workspaceId, { status: "open" });

    expect(await orderData.getOrderDetail(t.db, other, mine.id)).toBeNull();
    await expect(orderData.transitionOrder(t.db, other, mine.id, "drafting")).rejects.toThrow(/찾을 수 없어요/);
    await expect(orderData.deleteOrder(t.db, other, mine.id)).rejects.toThrow(/찾을 수 없어요/);

    const otherPackage = (await studioData.listPackages(t.db, other))[0];
    await expect(
      orderData.createOrder(t.db, t.workspaceId, await intake({ packageId: otherPackage.id }), TODAY),
    ).rejects.toThrow(/패키지를 찾을 수 없어요/);
  });

  it("updates the goal, the price sheet and the portfolio", async () => {
    await studioData.setMonthlyGoal(t.db, t.workspaceId, 20_000_000);
    expect(await studioData.getMonthlyGoal(t.db, t.workspaceId)).toBe(20_000_000);

    const pkg = await thumbnailPackage();
    const updated = await studioData.updatePackage(t.db, t.workspaceId, {
      id: pkg.id,
      price: 60_000,
      revisionLimit: null,
      turnaroundDays: 2,
      featured: true,
    });
    expect(updated).toMatchObject({ price: 60_000, revisionLimit: null, featured: true });

    const item = await studioData.createPortfolioItem(t.db, t.workspaceId, {
      title: "테스트 작업",
      category: "banner",
      clientLabel: "테스트 브랜드",
      headline: "지금 만나요",
      summary: "",
      tools: ["Canva"],
      palette: ["#112233", "#ffffff"],
    });
    expect((await studioData.listPortfolio(t.db, t.workspaceId, "banner")).map((p) => p.id)).toContain(item.id);
    await studioData.deletePortfolioItem(t.db, t.workspaceId, item.id);
    expect(await studioData.findPortfolioItem(t.db, t.workspaceId, item.id)).toBeUndefined();
  });

  it("reset restores the sample studio", async () => {
    await resetModule(t.db, aiDesignVideo, t.workspaceId);
    expect(await studioData.getMonthlyGoal(t.db, t.workspaceId)).toBe(15_000_000);
    const tests = await t.db.select().from(schema.orders).where(eq(schema.orders.clientName, "테스트 고객"));
    expect(tests).toEqual([]);
  });
});
