import { describe, expect, it } from "vitest";
import {
  matchKeywords,
  normalizeKeyword,
  recommendationScore,
  scoreGrade,
  type Competition,
  type Trend,
} from "./keywords";

const row = (keyword: string, headKeyword: string, monthlyVolume: number, competition: Competition, trend: Trend) => ({
  keyword,
  headKeyword,
  monthlyVolume,
  competition,
  trend,
});

const rows = [
  row("텀블러", "텀블러", 89_000, "medium", "rising"),
  row("보온 텀블러", "텀블러", 24_000, "low", "rising"),
  row("스텐 텀블러", "텀블러", 12_000, "medium", "steady"),
  row("여성 원피스", "여성 원피스", 145_000, "high", "rising"),
  row("하객룩 원피스", "여성 원피스", 33_000, "low", "seasonal"),
];

describe("recommendationScore", () => {
  it("favours low competition", () => {
    const low = recommendationScore({ monthlyVolume: 50_000, competition: "low", trend: "steady" });
    const high = recommendationScore({ monthlyVolume: 50_000, competition: "high", trend: "steady" });
    expect(low).toBeGreaterThan(high);
  });

  it("rewards volume and a rising trend", () => {
    const small = recommendationScore({ monthlyVolume: 2_000, competition: "medium", trend: "steady" });
    const big = recommendationScore({ monthlyVolume: 200_000, competition: "medium", trend: "steady" });
    const rising = recommendationScore({ monthlyVolume: 200_000, competition: "medium", trend: "rising" });
    expect(big).toBeGreaterThan(small);
    expect(rising).toBeGreaterThan(big);
  });

  it("stays within 0–100", () => {
    expect(recommendationScore({ monthlyVolume: 10_000_000, competition: "low", trend: "rising" })).toBeLessThanOrEqual(
      100,
    );
    expect(recommendationScore({ monthlyVolume: 0, competition: "high", trend: "falling" })).toBeGreaterThanOrEqual(0);
  });

  it("grades scores", () => {
    expect(scoreGrade(80)).toBe("good");
    expect(scoreGrade(50)).toBe("fair");
    expect(scoreGrade(20)).toBe("poor");
  });
});

describe("matchKeywords", () => {
  it("normalises spacing and case", () => {
    expect(normalizeKeyword("  여성   원피스 ")).toBe("여성 원피스");
    expect(normalizeKeyword("LED 무드등")).toBe("led 무드등");
  });

  it("returns the exact keyword with its group, best score first", () => {
    const match = matchKeywords(rows, " 텀블러 ");
    expect(match.exact?.keyword).toBe("텀블러");
    expect(match.related.map((r) => r.keyword)).toEqual(["보온 텀블러", "스텐 텀블러"]);
    expect(match.partial).toEqual([]);
  });

  it("falls back to partial matches on any word", () => {
    const match = matchKeywords(rows, "원피스 추천");
    expect(match.exact).toBeNull();
    expect(match.partial.map((r) => r.keyword).sort()).toEqual(["여성 원피스", "하객룩 원피스"]);
  });

  it("returns nothing for an empty or unknown query", () => {
    expect(matchKeywords(rows, "   ")).toEqual({ exact: null, related: [], partial: [] });
    expect(matchKeywords(rows, "캠핑의자").partial).toEqual([]);
  });
});
