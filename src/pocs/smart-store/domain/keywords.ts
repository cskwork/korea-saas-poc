/**
 * Keyword research over the sample keyword table: a recommendation score and
 * the query matching rules. Pure; the data lives in the database.
 */
export const COMPETITION_LEVELS = ["low", "medium", "high"] as const;
export type Competition = (typeof COMPETITION_LEVELS)[number];

export const TRENDS = ["rising", "steady", "falling", "seasonal"] as const;
export type Trend = (typeof TRENDS)[number];

export const COMPETITION_LABEL: Record<Competition, string> = { low: "낮음", medium: "중간", high: "높음" };
export const TREND_LABEL: Record<Trend, string> = {
  rising: "상승",
  steady: "유지",
  falling: "하락",
  seasonal: "계절성",
};

export interface KeywordMetrics {
  monthlyVolume: number;
  competition: Competition;
  trend: Trend;
}

const COMPETITION_BASE: Record<Competition, number> = { low: 62, medium: 42, high: 22 };
const TREND_BONUS: Record<Trend, number> = { rising: 10, steady: 0, seasonal: -2, falling: -12 };

/**
 * 0–100: how worth targeting a keyword is for a small seller. Low competition
 * weighs most, search volume adds up to 28 points on a log scale (1,000 → 0,
 * 1,000,000 → 28), and the trend nudges it.
 */
export function recommendationScore({ monthlyVolume, competition, trend }: KeywordMetrics): number {
  const volume = Math.max(monthlyVolume, 1);
  const volumePoints = Math.min(Math.max((Math.log10(volume) - 3) / 3, 0), 1) * 28;
  const score = COMPETITION_BASE[competition] + volumePoints + TREND_BONUS[trend];
  return Math.round(Math.min(Math.max(score, 0), 100));
}

export type ScoreGrade = "good" | "fair" | "poor";

export function scoreGrade(score: number): ScoreGrade {
  if (score >= 70) return "good";
  if (score >= 45) return "fair";
  return "poor";
}

export const SCORE_GRADE_LABEL: Record<ScoreGrade, string> = { good: "추천", fair: "검토", poor: "비추천" };

/** Lower-cases and collapses whitespace so "여성  원피스" matches "여성 원피스". */
export function normalizeKeyword(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

interface KeywordRow extends KeywordMetrics {
  keyword: string;
  headKeyword: string;
}

export interface KeywordMatch<T extends KeywordRow> {
  /** The keyword the query names exactly, or null when it is not in the table. */
  exact: T | null;
  /** The exact keyword's group (or the closest group), best score first. */
  related: T[];
  /** Other keywords sharing a word with the query when nothing matched exactly. */
  partial: T[];
}

/** Resolves a query against the keyword table. */
export function matchKeywords<T extends KeywordRow>(rows: readonly T[], query: string): KeywordMatch<T> {
  const q = normalizeKeyword(query);
  if (!q) return { exact: null, related: [], partial: [] };
  const byScore = (a: T, b: T) => recommendationScore(b) - recommendationScore(a);

  const exact = rows.find((r) => normalizeKeyword(r.keyword) === q) ?? null;
  if (exact) {
    const related = rows.filter((r) => r.headKeyword === exact.headKeyword && r !== exact).sort(byScore);
    return { exact, related, partial: [] };
  }

  const words = q.split(" ").filter((w) => w.length >= 2);
  const partial = rows
    .filter((r) => {
      const keyword = normalizeKeyword(r.keyword);
      return keyword.includes(q) || words.some((w) => keyword.includes(w));
    })
    .sort(byScore);
  return { exact: null, related: [], partial };
}
