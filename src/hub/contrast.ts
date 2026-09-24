/** WCAG relative luminance of a #rrggbb colour. */
export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Picks the lettering colour (of `light` / `dark`) that reads best on a painted sign of colour `paint`. */
export function signLettering(paint: string, light = LIGHT, dark = DARK): string {
  return contrastRatio(paint, light) >= contrastRatio(paint, dark) ? light : dark;
}

/**
 * The paint actually used for a sign: the shop's own colour, deepened or lightened
 * just enough for its lettering to reach `minimum` contrast (small text on signs).
 */
export function signPaint(accent: string, minimum = 4.5): { paint: string; ink: string } {
  const ink = signLettering(accent);
  let paint = accent;
  const toward = ink === LIGHT ? "#000000" : "#ffffff";
  for (let step = 0; step < 20 && contrastRatio(paint, ink) < minimum; step++) {
    paint = mix(paint, toward, 0.04);
  }
  return { paint, ink };
}

const LIGHT = "#ffffff";
const DARK = "#16202b";

function channels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

function mix(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  return `#${a
    .map((c, i) =>
      Math.round(c + (b[i] - c) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
