import { describe, expect, it } from "vitest";
import { z } from "zod";
import { UserError, action, formAction, idleState } from "./actions";

const input = z.object({ name: z.string().trim().min(1, "이름을 입력해 주세요."), tags: z.array(z.string()).default([]) });

describe("actions", () => {
  it("parses FormData, including repeated keys", async () => {
    const run = formAction(input, async (data) => ({ data, message: "저장했어요." }));
    const form = new FormData();
    form.set("name", " 홍길동 ");
    form.append("tags", "a");
    form.append("tags", "b");
    const result = await run(idleState, form);
    expect(result).toEqual({ status: "success", data: { name: "홍길동", tags: ["a", "b"] }, message: "저장했어요." });
  });

  it("returns field errors instead of throwing", async () => {
    const run = action(input, async () => undefined);
    const result = await run({ name: "" });
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.fieldErrors?.name).toEqual(["이름을 입력해 주세요."]);
  });

  it("surfaces UserError messages and hides unexpected ones", async () => {
    expect(await action(input, async () => { throw new UserError("이미 있어요."); })({ name: "a" })).toEqual({
      status: "error",
      message: "이미 있어요.",
    });
    const hidden = await action(input, async () => { throw new Error("db down"); })({ name: "a" });
    expect(hidden).toEqual({ status: "error", message: "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요." });
  });
});
