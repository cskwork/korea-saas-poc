import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
import { seoulDateKey } from "@/core/format";
import { SEED_ORDERS } from "../db/seed-data";
import { addDays } from "../domain/dates";
import { orderInput } from "../domain/inputs";
import { writeTemplateDraft } from "../domain/templates";
import { addVersion, createDraft, getDraftDetail } from "../server/store/drafts";
import { createOrder, findOrder, listOrders, moveOrder } from "../server/store/orders";
import { bootstrapDemoDatabase } from "./database";

it("boots the exact demo migrations once and retains edited/delivered copy after database reopen", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "geulpum-demo-test-"));
  const workspaceId = crypto.randomUUID();
  const sql = (await Promise.all(["0000_platform", "0003_ai-content-agency"].map((name) => readFile(path.join(process.cwd(), "drizzle", `${name}.sql`), "utf8")))).join("\n");
  let client = new PGlite(directory);
  try {
    await client.waitReady;
    const { db } = await bootstrapDemoDatabase(client, workspaceId, sql);
    const today = seoulDateKey();
    const input = orderInput.parse({ clientName: "테스트 상회", industry: "F&B", kind: "blog", topic: "동네 빵집 신메뉴 소개", tone: "friendly", length: "short", dueDate: addDays(today, 3) });
    const order = await createOrder(db, workspaceId, input, today);
    const draft = await createDraft(db, workspaceId, { ...input, orderId: order.id, content: writeTemplateDraft(input), source: "template", note: "처음 작성" });
    await addVersion(db, workspaceId, draft.id, { content: { title: "검수한 제목", body: "매일 아침 굽는 신메뉴를 소개합니다. 영업시간은 오전 아홉 시부터입니다." }, source: "edit", note: "사실 확인" });
    await moveOrder(db, workspaceId, { orderId: order.id, to: "review" });
    await moveOrder(db, workspaceId, { orderId: order.id, to: "delivered" });
    await client.close();

    client = new PGlite(directory);
    await client.waitReady;
    const reopened = await bootstrapDemoDatabase(client, workspaceId, sql);
    expect(await listOrders(reopened.db, workspaceId)).toHaveLength(SEED_ORDERS.length + 1);
    expect((await findOrder(reopened.db, workspaceId, order.id))?.status).toBe("delivered");
    const detail = await getDraftDetail(reopened.db, workspaceId, draft.id);
    expect(detail?.draft.title).toBe("검수한 제목");
    expect(detail?.draft.currentVersion).toBe(2);
    expect(detail?.versions).toHaveLength(2);
    await expect(addVersion(reopened.db, workspaceId, draft.id, { content: { title: "고치지 못할 제목", body: "납품한 뒤에 바꾸려고 하는 본문입니다." }, source: "edit", note: "" })).rejects.toThrow("납품한 원고");
    expect(await findOrder(reopened.db, crypto.randomUUID(), order.id)).toBeNull();
  } finally {
    if (!client.closed) await client.close();
    await rm(directory, { recursive: true, force: true });
  }
});
