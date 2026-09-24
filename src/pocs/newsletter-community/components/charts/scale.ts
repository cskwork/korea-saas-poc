/** Round axis ticks: 0 and 3–5 clean steps covering `max`. */
export function niceTicks(max: number, target = 4): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ?? 10 * magnitude;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);
}

/** Percentage position of a value on a 0..top axis (0% at the baseline). */
export function percentOf(value: number, top: number): number {
  return top > 0 ? (value / top) * 100 : 0;
}
