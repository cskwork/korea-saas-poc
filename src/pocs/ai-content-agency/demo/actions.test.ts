import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { seoulDateKey } from "@/core/format";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { seedModuleIfNeeded } from "@/core/modules/lifecycle";
import * as schema from "../db/schema";
import { contentAgency } from "../module";
import { addDays } from "../domain/dates";
import { createOrderAction } from "./actions";

const hooks = vi.hoisted(() => ({ context: vi.fn(), persist: vi.fn(), refresh: vi.fn() }));
vi.mock("./database", () => ({ getDemoContext: hooks.context, persistDemoChanges: hooks.persist, refreshDemo: hooks.refresh }));
let t: TestDatabase<typeof schema>;
beforeAll(async () => {
  t = await createTestDatabase(schema);
  await seedModuleIfNeeded(t.db, contentAgency, t.workspaceId);
  hooks.context.mockResolvedValue({ db: t.db, workspaceId: t.workspaceId });
});
afterAll(() => t.close());

it("awaits persistence before notifying the renderer and navigating away from a new request", async () => {
  let finish!: () => void;
  const barrier = new Promise<void>((resolve) => { finish = resolve; });
  hooks.persist.mockReturnValue(barrier);
  const assign = vi.fn();
  vi.stubGlobal("window", { location: { assign } });
  try {
    const form = new FormData();
    for (const [key, value] of Object.entries({ clientName: "보존 테스트 상회", industry: "F&B", kind: "blog", topic: "동네 빵집 신메뉴 소개", tone: "friendly", length: "short", dueDate: addDays(seoulDateKey(), 3) })) form.set(key, value);
    const result = createOrderAction({ status: "idle" }, form);
    await vi.waitFor(() => expect(hooks.persist).toHaveBeenCalledOnce());
    expect(hooks.refresh).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
    finish();
    expect((await result).status).toBe("success");
    expect(hooks.refresh).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith(expect.stringMatching(/^\/ai-content-agency\/orders\/[a-f0-9-]+$/));
  } finally {
    finish();
    vi.unstubAllGlobals();
  }
});
