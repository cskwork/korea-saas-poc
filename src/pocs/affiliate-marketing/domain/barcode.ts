/**
 * Code 39 encoding of a short code, drawn on each shelf label. Each character is
 * nine elements (bar, space, bar…), three of them wide; characters are separated
 * by a narrow space and framed by the `*` start/stop character.
 */
const PATTERNS: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  "*": "nwnnwnwnn",
};

export const CODE39_PATTERNS: Readonly<Record<string, string>> = PATTERNS;

export interface Bar {
  x: number;
  width: number;
}

/** Bars (in narrow-module units) and the total width for `value`; unsupported characters are skipped. */
export function code39Bars(value: string, wide = 2.5): { bars: Bar[]; width: number } {
  const chars = ["*", ...value.toUpperCase().split("").filter((c) => c in PATTERNS), "*"];
  const bars: Bar[] = [];
  let x = 0;
  chars.forEach((char, index) => {
    [...PATTERNS[char]].forEach((element, i) => {
      const width = element === "w" ? wide : 1;
      if (i % 2 === 0) bars.push({ x, width });
      x += width;
    });
    if (index < chars.length - 1) x += 1;
  });
  return { bars, width: x };
}
