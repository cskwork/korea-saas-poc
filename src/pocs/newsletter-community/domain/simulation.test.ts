import { describe, expect, it } from "vitest";
import { cumulativeOpensByHour, simulateEngagement, summarizeEngagement, unitHash } from "./simulation";

describe("simulated engagement", () => {
  const sentAt = new Date("2026-09-22T07:00:00+09:00");

  it("is deterministic and bounded", () => {
    expect(unitHash("a")).toBe(unitHash("a"));
    for (let i = 0; i < 200; i++) {
      const u = unitHash(`seed-${i}`);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
    const input = { issueId: "i", recipientKey: "r", tier: "pro" as const, sentAt };
    expect(simulateEngagement(input)).toEqual(simulateEngagement(input));
  });

  it("opens after sending and clicks after opening", () => {
    const results = Array.from({ length: 400 }, (_, i) =>
      simulateEngagement({ issueId: "issue", recipientKey: `r${i}`, tier: "basic", sentAt }),
    );
    const opened = results.filter((r) => r.openedAt);
    expect(opened.length / results.length).toBeGreaterThan(0.45);
    expect(opened.length / results.length).toBeLessThan(0.7);
    for (const r of results) {
      if (r.openedAt) expect(r.openedAt.getTime()).toBeGreaterThan(sentAt.getTime());
      if (r.clickedAt) expect(r.clickedAt.getTime()).toBeGreaterThan(r.openedAt!.getTime());
      if (!r.openedAt) expect(r.clickedAt).toBeNull();
    }
  });

  it("only counts engagement that has already happened", () => {
    const hour = 3_600_000;
    const sends = [
      { openedAt: new Date(sentAt.getTime() + hour / 2), clickedAt: new Date(sentAt.getTime() + hour) },
      { openedAt: new Date(sentAt.getTime() + 5 * hour), clickedAt: null },
      { openedAt: null, clickedAt: null },
    ];
    const now = new Date(sentAt.getTime() + 2 * hour);
    expect(summarizeEngagement(sends, now)).toEqual({ recipients: 3, opens: 1, clicks: 1, openRate: 1 / 3, clickRate: 1 / 3 });
    expect(cumulativeOpensByHour(sends, sentAt, now, 48)).toEqual([1, 1]);
    expect(cumulativeOpensByHour(sends, sentAt, new Date(sentAt.getTime() + 100 * hour), 6)).toEqual([1, 1, 1, 1, 1, 2]);
  });
});
