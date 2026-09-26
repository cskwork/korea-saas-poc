import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "../db/schema";
import { SEED_CASES, SEED_ORDERS } from "../db/seed-data";
import { addDays } from "../domain/dates";
import { orderInput } from "../domain/inputs";
import { PLANS } from "../domain/plans";
import { writeTemplateDraft } from "../domain/templates";
import { contentAgency } from "../module";
import { loadDashboard } from "./store/dashboard";
import { addVersion, createDraft, deleteDraft, getDraftDetail, linkDraftToOrder, listDrafts, restoreVersion } from "./store/drafts";
import { createOrder, deleteOrder, findOrder, getOrderDetail, listOrders, moveOrder, updateOrder } from "./store/orders";
import { deleteCase, listCases, publishCase, updateCase } from "./store/portfolio";
import { createInquiry, currentPlan, deleteInquiry, ordersReceivedThisMonth, recentInquiries, selectPlan } from "./store/plans";

describe("글품 store (PGlite)", () => {
  let t: TestDatabase<typeof schema>;
  const today = seoulDateKey();

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, contentAgency, t.workspaceId);
  });
  afterAll(() => t.close());

  const newOrder = (overrides: Record<string, unknown> = {}) =>
    orderInput.parse({
      clientName: "테스트 상회",
      industry: "F&B",
      kind: "blog",
      topic: "동네 빵집 신메뉴 소개",
      keywords: "신메뉴, 동네 빵집",
      tone: "friendly",
      length: "short",
      dueDate: addDays(today, 3),
      ...overrides,
    });

  it("seeds a lived-in workspace: pipeline, drafts with history, cases and a pro plan", async () => {
    const orders = await listOrders(t.db, t.workspaceId);
    expect(orders).toHaveLength(SEED_ORDERS.length);
    expect(new Set(orders.map((o) => o.number)).size).toBe(orders.length);
    expect(await currentPlan(t.db, t.workspaceId)).toBe("pro");

    const delivered = orders.filter((o) => o.status === "delivered");
    for (const order of delivered) {
      const detail = await getOrderDetail(t.db, t.workspaceId, order.id);
      expect(detail?.order.deliveredDraftId).toBeTruthy();
      const draft = detail!.drafts.find((d) => d.id === detail!.order.deliveredDraftId)!;
      // What was delivered went through an edit and carries no open checks.
      expect(draft.source).toBe("edit");
      expect(draft.body).not.toContain("[확인 필요");
      expect(detail?.events.map((e) => e.status)).toEqual(["received", "writing", "review", "delivered"]);
    }
    const cases = await listCases(t.db, t.workspaceId);
    expect(cases.total).toBe(SEED_CASES.length);
    expect(cases.items.every((c) => c.isSample)).toBe(true);
  });

  it("computes the dashboard from the rows", async () => {
    const dashboard = await loadDashboard(t.db, t.workspaceId);
    expect(dashboard.pipeline).toEqual({ received: 3, writing: 3, review: 2, delivered: 8 });
    expect(dashboard.headline).toMatchObject({ dueToday: 1, late: 1, awaitingReview: 2 });
    expect(dashboard.performance).toMatchObject({ delivered: 8, onTime: 5 });
    expect(dashboard.timeline.bars).toHaveLength(8);
    expect(dashboard.usage.plan).toBe("pro");
    expect(dashboard.usage.used).toBe(await ordersReceivedThisMonth(t.db, t.workspaceId, today));
    expect(dashboard.recentDrafts.length).toBeGreaterThan(0);
  });

  it("takes a request, writes its draft, reviews and delivers it", async () => {
    const { id } = await createOrder(t.db, t.workspaceId, newOrder(), today);
    await expect(moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" })).rejects.toThrow(UserError);

    const order = (await findOrder(t.db, t.workspaceId, id))!;
    const content = writeTemplateDraft({ ...order, keywords: order.keywords });
    const draft = await createDraft(t.db, t.workspaceId, {
      ...order,
      orderId: id,
      content,
      source: "template",
      note: "처음 작성",
    });
    // Writing the first draft starts the order.
    expect((await findOrder(t.db, t.workspaceId, id))?.status).toBe("writing");

    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" });
    const delivered = await moveOrder(t.db, t.workspaceId, { orderId: id, to: "delivered" });
    expect(delivered.status).toBe("delivered");
    const detail = await getOrderDetail(t.db, t.workspaceId, id);
    expect(detail?.order.deliveredDraftId).toBe(draft.id);
    expect(detail?.events.map((e) => e.status)).toEqual(["received", "writing", "review", "delivered"]);

    // Taking a delivery back clears it.
    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" });
    expect((await findOrder(t.db, t.workspaceId, id))?.deliveredAt).toBeNull();
  });

  it("refuses to deliver without a draft", async () => {
    const { id } = await createOrder(t.db, t.workspaceId, newOrder(), today);
    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "writing" });
    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" });
    await expect(moveOrder(t.db, t.workspaceId, { orderId: id, to: "delivered" })).rejects.toThrow("납품할 원고가 없어요");
  });

  it("locks the delivered draft until its order is taken back to 검수", async () => {
    const { id } = await createOrder(t.db, t.workspaceId, newOrder(), today);
    const order = (await findOrder(t.db, t.workspaceId, id))!;
    const draft = await createDraft(t.db, t.workspaceId, {
      ...order,
      orderId: id,
      content: writeTemplateDraft({ ...order, keywords: order.keywords }),
      source: "template",
      note: "처음 작성",
    });
    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" });
    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "delivered", draftId: draft.id });

    const edit = { content: { title: "납품 뒤 고친 제목", body: "납품 뒤에 바꾼 본문입니다." }, source: "edit" as const, note: "" };
    await expect(addVersion(t.db, t.workspaceId, draft.id, edit)).rejects.toThrow("납품한 원고");
    await expect(restoreVersion(t.db, t.workspaceId, draft.id, 1)).rejects.toThrow("납품한 원고");
    await expect(linkDraftToOrder(t.db, t.workspaceId, draft.id, null)).rejects.toThrow("납품한 원고");
    await expect(deleteDraft(t.db, t.workspaceId, draft.id)).rejects.toThrow("납품한 원고");

    await moveOrder(t.db, t.workspaceId, { orderId: id, to: "review" });
    expect((await addVersion(t.db, t.workspaceId, draft.id, edit)).version).toBe(2);
  });

  it("keeps a corrected request inside the plan's kinds", async () => {
    const workspaceId = await t.createWorkspace();
    await selectPlan(t.db, workspaceId, "starter");
    const { id } = await createOrder(t.db, workspaceId, newOrder(), today);
    const fields = newOrder();
    await expect(updateOrder(t.db, workspaceId, { orderId: id, ...fields, kind: "ad" })).rejects.toThrow("광고 카피가 포함되지 않아요");
    await updateOrder(t.db, workspaceId, { orderId: id, ...fields, topic: "고친 주제" });
    expect((await findOrder(t.db, workspaceId, id))?.topic).toBe("고친 주제");
    await expect(updateOrder(t.db, await t.createWorkspace(), { orderId: id, ...fields })).rejects.toThrow("찾을 수 없어요");
  });

  it("keeps every version and restores old words as a new version", async () => {
    const [first] = await listDrafts(t.db, t.workspaceId, { sort: "recent" });
    const before = (await getDraftDetail(t.db, t.workspaceId, first.id))!;
    const { version } = await addVersion(t.db, t.workspaceId, first.id, {
      content: { title: "고친 제목", body: `${before.draft.body}\n\n덧붙인 문단` },
      source: "edit",
      note: "직접 수정",
    });
    expect(version).toBe(before.draft.currentVersion + 1);
    await expect(
      addVersion(t.db, t.workspaceId, first.id, { content: { title: "고친 제목", body: `${before.draft.body}\n\n덧붙인 문단` }, source: "edit", note: "" }),
    ).rejects.toThrow("바뀐 내용이 없어요");

    const restored = await restoreVersion(t.db, t.workspaceId, first.id, 1);
    const after = (await getDraftDetail(t.db, t.workspaceId, first.id))!;
    expect(after.draft.currentVersion).toBe(restored.version);
    expect(after.versions[0].note).toBe("v1로 되돌림");
    expect(after.draft.title).toBe(after.versions.at(-1)?.title);
  });

  it("searches and filters the library and the stand", async () => {
    expect((await listOrders(t.db, t.workspaceId, { q: "밀과결" })).every((o) => o.clientName === "밀과결 베이커리")).toBe(true);
    expect((await listOrders(t.db, t.workspaceId, { kind: "ad" })).every((o) => o.kind === "ad")).toBe(true);
    expect(await listOrders(t.db, t.workspaceId, { q: "100%_없음" })).toHaveLength(0);
    const found = await listDrafts(t.db, t.workspaceId, { q: "소금빵" });
    expect(found.length).toBeGreaterThan(0);
  });

  it("enforces the plan: kinds and the monthly quota", async () => {
    const workspaceId = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, contentAgency, workspaceId);
    await selectPlan(t.db, workspaceId, "starter");
    await expect(selectPlan(t.db, workspaceId, "starter")).rejects.toThrow("이미 스타터");
    await expect(createOrder(t.db, workspaceId, newOrder({ kind: "ad" }), today)).rejects.toThrow("광고 카피");

    const quota = PLANS.starter.monthlyQuota!;
    for (let used = await ordersReceivedThisMonth(t.db, workspaceId, today); used < quota; used++) {
      await createOrder(t.db, workspaceId, newOrder(), today);
    }
    await expect(createOrder(t.db, workspaceId, newOrder(), today)).rejects.toThrow("모두 썼어요");
  });

  it("publishes a delivered order as a case once", async () => {
    const delivered = (await listOrders(t.db, t.workspaceId)).find((o) => o.status === "delivered")!;
    const { id } = await publishCase(t.db, t.workspaceId, { orderId: delivered.id, title: "사례 제목", summary: "한 줄 설명입니다." });
    await expect(publishCase(t.db, t.workspaceId, { orderId: delivered.id, title: "다시", summary: "한 번 더 올리기" })).rejects.toThrow("이미");
    const open = (await listOrders(t.db, t.workspaceId)).find((o) => o.status === "writing")!;
    await expect(publishCase(t.db, t.workspaceId, { orderId: open.id, title: "안 됨", summary: "납품 전 의뢰" })).rejects.toThrow("납품을 마친");
    const cases = await listCases(t.db, t.workspaceId, { industry: delivered.industry });
    expect(cases.items.some((c) => c.id === id && !c.isSample)).toBe(true);
    await updateCase(t.db, t.workspaceId, { caseId: id, title: "고친 사례 제목", summary: "고친 한 줄 설명입니다." });
    expect((await listCases(t.db, t.workspaceId)).items.find((c) => c.id === id)?.title).toBe("고친 사례 제목");
    await expect(updateCase(t.db, await t.createWorkspace(), { caseId: id, title: "남의 사례", summary: "고칠 수 없어야 해요." })).rejects.toThrow("찾을 수 없어요");
    await deleteCase(t.db, t.workspaceId, id);
  });

  it("records and withdraws quote inquiries per workspace", async () => {
    await createInquiry(t.db, t.workspaceId, { companyName: "문의 상사", contactName: "김담당", email: "a@example.com", monthlyVolume: 40, message: "" });
    const [inquiry] = await recentInquiries(t.db, t.workspaceId);
    expect(inquiry.companyName).toBe("문의 상사");
    await expect(deleteInquiry(t.db, await t.createWorkspace(), inquiry.id)).rejects.toThrow("찾을 수 없어요");
    await deleteInquiry(t.db, t.workspaceId, inquiry.id);
    expect((await recentInquiries(t.db, t.workspaceId)).some((i) => i.id === inquiry.id)).toBe(false);
  });

  it("isolates workspaces", async () => {
    const stranger = await t.createWorkspace();
    const [order] = await listOrders(t.db, t.workspaceId);
    expect(await findOrder(t.db, stranger, order.id)).toBeNull();
    expect(await getOrderDetail(t.db, stranger, order.id)).toBeNull();
    await expect(moveOrder(t.db, stranger, { orderId: order.id, to: "writing" })).rejects.toThrow("찾을 수 없어요");
    await expect(deleteOrder(t.db, stranger, order.id)).rejects.toThrow("찾을 수 없어요");
    expect(await listDrafts(t.db, stranger)).toHaveLength(0);
  });

  it("resets to the demo data", async () => {
    await deleteOrder(t.db, t.workspaceId, (await listOrders(t.db, t.workspaceId))[0].id);
    await resetModule(t.db, contentAgency, t.workspaceId);
    expect(await listOrders(t.db, t.workspaceId)).toHaveLength(SEED_ORDERS.length);
    const versions = await t.db
      .select()
      .from(schema.draftVersions)
      .where(and(eq(schema.draftVersions.workspaceId, t.workspaceId), eq(schema.draftVersions.version, 3)));
    expect(versions).toHaveLength(0);
  });
});
