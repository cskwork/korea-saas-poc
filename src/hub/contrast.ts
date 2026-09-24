/** WCAG relative luminance of a #rrggbb colour. */
export function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Picks the lettering colour (of `light` / `dark`) that reads best on a painted sign of colour `paint`. */
export function signLettering(paint: string, light = "#ffffff", dark = "#16202b"): string {
  return contrastRatio(paint, light) >= contrastRatio(paint, dark) ? light : dark;
}
