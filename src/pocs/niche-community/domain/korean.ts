/**
 * Korean particles (조사) that depend on whether the last syllable has a final consonant (받침).
 */

const DIGITS_WITH_BATCHIM = new Set(["0", "1", "3", "6", "7", "8"]);

export function hasBatchim(word: string): boolean {
  const last = word.trim().at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  return DIGITS_WITH_BATCHIM.has(last);
}

/** 제목 → "제목을", 소개 → "소개를" */
export const withObject = (word: string) => `${word}${hasBatchim(word) ? "을" : "를"}`;

/** 제목 → "제목은", 소개 → "소개는" */
export const withTopic = (word: string) => `${word}${hasBatchim(word) ? "은" : "는"}`;
