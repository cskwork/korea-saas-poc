import { describe, expect, it } from "vitest";
import { formatAxisWon, niceTicks } from "./chart-scale";

describe("niceTicks", () => {
  it("rounds the axis up to clean steps", () => {
    expect(niceTicks(870_000)).toEqual([0, 250_000, 500_000, 750_000, 1_000_000]);
    expect(niceTicks(9)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(niceTicks(12, 4)).toEqual([0, 5, 10, 15]);
  });

  it("covers the maximum", () => {
    for (const max of [1, 7, 33, 999, 123_456]) {
      const ticks = niceTicks(max);
      expect(ticks[0]).toBe(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
    }
  });

  it("handles an empty series", () => {
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});

describe("formatAxisWon", () => {
  it("uses 만 and 억 units", () => {
    expect(formatAxisWon(0)).toBe("0");
    expect(formatAxisWon(250_000)).toBe("25만");
    expect(formatAxisWon(1_250_000)).toBe("125만");
    expect(formatAxisWon(150_000_000)).toBe("1.5억");
    expect(formatAxisWon(900)).toBe("900");
  });
});
