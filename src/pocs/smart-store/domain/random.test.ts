import { describe, expect, it } from "vitest";
import { createRandom, stableHash } from "./random";

describe("createRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it("keeps ints and picks in range", () => {
    const r = createRandom(7);
    for (let i = 0; i < 200; i += 1) {
      const n = r.int(3, 5);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(5);
    }
    expect(["a", "b"]).toContain(r.pick(["a", "b"]));
  });

  it("never picks a zero-weight item", () => {
    const r = createRandom(1);
    for (let i = 0; i < 100; i += 1) expect(r.weighted(["x", "y"], [0, 1])).toBe("y");
  });
});

describe("stableHash", () => {
  it("is stable and spreads inputs", () => {
    expect(stableHash("스마트셀러")).toBe(stableHash("스마트셀러"));
    expect(stableHash("a")).not.toBe(stableHash("b"));
  });
});
