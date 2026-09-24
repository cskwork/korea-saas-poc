/**
 * Korean particle (조사) selection for user-supplied words, so templates read
 * naturally whatever the topic: "소금빵을", "가습기를", "스킨케어로".
 */

type Pair = "은/는" | "이/가" | "을/를" | "과/와" | "으로/로" | "이에요/예요" | "이라/라";

/** Final-consonant index of the word's last syllable: 0 none, 8 ㄹ, other > 0 batchim. */
function finalConsonant(word: string): number {
  const last = word.trim().replace(/[\s)\]'"」』.!?]+$/, "").at(-1) ?? "";
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  // Digits read in Sino-Korean: 일(ㄹ) 삼(ㅁ) 육(ㄱ) 칠(ㄹ) 팔(ㄹ) 영(ㅇ); 이 사 오 구 end open.
  const digitFinals: Record<string, number> = { "0": 21, "1": 8, "3": 16, "6": 1, "7": 8, "8": 8 };
  if (last in digitFinals) return digitFinals[last];
  // Units after a number read as words: 밀리리터·센티미터·리터 end open, 그램 ends in ㅁ.
  const unit = word.trim().match(/\d\s*([a-zA-Z]+)$/)?.[1]?.toLowerCase();
  if (unit && ["ml", "l", "cm", "mm", "km", "m"].includes(unit)) return 0;
  if (unit && ["g", "kg", "mg"].includes(unit)) return 16;
  // Latin letters read as their Korean names: 엘(ㄹ) 엠(ㅁ) 엔(ㄴ) 알(ㄹ).
  const letterFinals: Record<string, number> = { l: 8, m: 16, n: 4, r: 8 };
  return letterFinals[last.toLowerCase()] ?? 0;
}

export function particle(word: string, pair: Pair): string {
  const [withBatchim, withoutBatchim] = pair.split("/");
  const final = finalConsonant(word);
  if (pair === "으로/로") return final === 0 || final === 8 ? withoutBatchim : withBatchim;
  return final === 0 ? withoutBatchim : withBatchim;
}

/** Word followed by its particle: josa("소금빵", "을/를") → "소금빵을". */
export function josa(word: string, pair: Pair): string {
  return `${word}${particle(word, pair)}`;
}

/** "#성수동빵집" */
export function hashtag(word: string): string {
  return `#${word.replace(/[^\p{L}\p{N}_]+/gu, "")}`;
}

/** Truncates to at most `max` characters (by code point), preferring a word boundary. */
export function fitLength(text: string, max: number): string {
  const chars = Array.from(text.trim());
  if (chars.length <= max) return chars.join("");
  const cut = chars.slice(0, max).join("");
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trim();
}

export function charLength(text: string): number {
  return Array.from(text).length;
}
