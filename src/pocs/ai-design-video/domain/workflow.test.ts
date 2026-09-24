import { describe, expect, it } from "vitest";
import { availableTransitions, findTransition, planRevision, revisionAllowance, WorkflowError } from "./workflow";

describe("workflow transitions", () => {
  it("follows 의뢰접수 → 시안작업 → (수정요청 ⇄ 시안작업) → 납품완료", () => {
    expect(availableTransitions("received").map((t) => t.to)).toEqual(["drafting"]);
    expect(availableTransitions("drafting").map((t) => t.to)).toEqual(["delivered", "revision"]);
    expect(availableTransitions("revision").map((t) => t.to)).toEqual(["drafting"]);
    expect(availableTransitions("delivered").map((t) => t.kind)).toEqual(["reopen"]);
  });

  it("refuses skipping stages", () => {
    expect(findTransition("received", "delivered")).toBeUndefined();
    expect(findTransition("revision", "delivered")).toBeUndefined();
    expect(findTransition("received", "revision")).toBeUndefined();
  });
});

describe("revision allowance", () => {
  it("counts down included rounds", () => {
    expect(revisionAllowance(3, 1)).toEqual({ remaining: 2, nextIsExtra: false });
    expect(revisionAllowance(3, 3)).toEqual({ remaining: 0, nextIsExtra: true });
    expect(revisionAllowance(2, 4)).toEqual({ remaining: 0, nextIsExtra: true });
  });

  it("treats a missing limit as unlimited", () => {
    expect(revisionAllowance(null, 12)).toEqual({ remaining: null, nextIsExtra: false });
  });
});

describe("planRevision", () => {
  const drafting = { status: "drafting" as const, revisionLimit: 2, revisionsUsed: 0 };

  it("numbers rounds and keeps included rounds free", () => {
    expect(planRevision(drafting, { extraConfirmed: false, extraFee: 50_000 })).toEqual({ round: 1, extraFee: 0 });
  });

  it("requires confirmation and bills rounds beyond the allowance", () => {
    const used = { ...drafting, revisionsUsed: 2 };
    expect(() => planRevision(used, { extraConfirmed: false, extraFee: 0 })).toThrow(WorkflowError);
    expect(planRevision(used, { extraConfirmed: true, extraFee: 30_000 })).toEqual({ round: 3, extraFee: 30_000 });
  });

  it("only accepts change requests on a draft", () => {
    expect(() => planRevision({ ...drafting, status: "received" }, { extraConfirmed: false, extraFee: 0 })).toThrow(
      WorkflowError,
    );
    expect(() => planRevision({ ...drafting, status: "revision" }, { extraConfirmed: false, extraFee: 0 })).toThrow(
      WorkflowError,
    );
  });

  it("never bills unlimited plans", () => {
    const subscription = { status: "drafting" as const, revisionLimit: null, revisionsUsed: 9 };
    expect(planRevision(subscription, { extraConfirmed: true, extraFee: 99_000 })).toEqual({ round: 10, extraFee: 0 });
  });
});
