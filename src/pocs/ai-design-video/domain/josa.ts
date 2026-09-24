/**
 * Korean particles that depend on whether the word ends in a final consonant
 * (받침): "수박주스를", "로고를", "카페가", "간판이".
 */
type Pair = "이/가" | "을/를" | "은/는" | "과/와" | "으로/로";

const DIGIT_HAS_FINAL = [true, true, false, true, false, false, true, true, true, false];
const DIGIT_ENDS_IN_RIEUL = [false, true, false, false, false, false, false, true, true, false];

function finalOf(word: string): { has: boolean; rieul: boolean } {
  const last = word.trim().at(-1) ?? "";
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const final = (code - 0xac00) % 28;
    return { has: final !== 0, rieul: final === 8 };
  }
  if (/\d/.test(last)) {
    const digit = Number(last);
    return { has: DIGIT_HAS_FINAL[digit], rieul: DIGIT_ENDS_IN_RIEUL[digit] };
  }
  // Latin and symbols: read as ending in a vowel (e.g. "CI", "BI", "UX").
  return { has: false, rieul: false };
}

export function josa(word: string, pair: Pair): string {
  const [withFinal, withoutFinal] = pair.split("/");
  const { has, rieul } = finalOf(word);
  if (pair === "으로/로") return word + (has && !rieul ? withFinal : withoutFinal);
  return word + (has ? withFinal : withoutFinal);
}
