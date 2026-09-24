import { describe, expect, it } from "vitest";
import { niceRange, niceTicks } from "./scale";

describe("axis ticks", () => {
  it("rounds up to nice steps", () => {
    expect(niceTicks(1_250_000, 3)).toEqual([0, 500_000, 1_000_000, 1_500_000]);
    expect(niceTicks(900, 3)).toEqual([0, 500, 1000, 1500]);
    expect(niceTicks(0, 3)).toEqual([0]);
  });

  it("covers negative ranges and includes zero", () => {
    const ticks = niceRange(-2_000_000, 7_000_000, 4);
    expect(ticks[0]).toBeLessThanOrEqual(-2_000_000);
    expect(ticks.at(-1)).toBeGreaterThanOrEqual(7_000_000);
    expect(ticks).toContain(0);
  });
});
