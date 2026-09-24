import { describe, expect, it } from "vitest";
import {
  canDeleteComment,
  canDeletePost,
  canEditPost,
  canPostIn,
  canReadPost,
  FREE_DAILY_POST_LIMIT,
  postingAllowance,
  resolvePremiumOnly,
  tierChangeProblem,
  type Viewer,
} from "./rules";

const operator: Viewer = { id: "op", role: "operator", tier: "premium" };
const premium: Viewer = { id: "pm", role: "member", tier: "premium" };
const free: Viewer = { id: "fr", role: "member", tier: "free" };

describe("community rules", () => {
  it("gates 대외비 posts to premium members, the operator and the author", () => {
    const secret = { authorId: "someone", premiumOnly: true };
    expect(canReadPost(free, secret)).toBe(false);
    expect(canReadPost(premium, secret)).toBe(true);
    expect(canReadPost(operator, secret)).toBe(true);
    expect(canReadPost(free, { ...secret, authorId: free.id })).toBe(true);
    expect(canReadPost(free, { authorId: "someone", premiumOnly: false })).toBe(true);
  });

  it("lets only premium members and the operator write in premium channels", () => {
    expect(canPostIn(free, { access: "premium" })).toBe(false);
    expect(canPostIn(premium, { access: "premium" })).toBe(true);
    expect(canPostIn(free, { access: "open" })).toBe(true);
  });

  it("forces premium-only in premium channels and respects the author elsewhere", () => {
    expect(resolvePremiumOnly({ access: "premium" }, false)).toBe(true);
    expect(resolvePremiumOnly({ access: "open" }, true)).toBe(true);
    expect(resolvePremiumOnly({ access: "open" }, false)).toBe(false);
  });

  it("lets authors edit, and authors or the operator delete", () => {
    expect(canEditPost(free, { authorId: free.id })).toBe(true);
    expect(canEditPost(operator, { authorId: free.id })).toBe(false);
    expect(canDeletePost(operator, { authorId: free.id })).toBe(true);
    expect(canDeletePost(premium, { authorId: free.id })).toBe(false);
    expect(canDeleteComment(operator, { authorId: free.id })).toBe(true);
    expect(canDeleteComment(premium, { authorId: free.id })).toBe(false);
  });

  it("limits free members to three posts a day", () => {
    expect(postingAllowance(free, 0)).toEqual({ limit: FREE_DAILY_POST_LIMIT, used: 0, left: 3, allowed: true });
    expect(postingAllowance(free, 3)).toMatchObject({ left: 0, allowed: false });
    expect(postingAllowance(free, 5)).toMatchObject({ left: 0, allowed: false });
    expect(postingAllowance(premium, 12)).toEqual({ limit: null, used: 12, left: null, allowed: true });
  });

  it("explains impossible tier changes", () => {
    expect(tierChangeProblem(operator, "upgrade")).toContain("운영자");
    expect(tierChangeProblem(premium, "upgrade")).toContain("이미 프리미엄");
    expect(tierChangeProblem(free, "downgrade")).toContain("이미 무료");
    expect(tierChangeProblem(free, "upgrade")).toBeNull();
    expect(tierChangeProblem(premium, "downgrade")).toBeNull();
  });
});
