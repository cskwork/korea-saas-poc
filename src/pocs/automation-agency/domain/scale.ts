/**
 * Axis ticks at "nice" round values (1, 2, 2.5, 5 × 10ⁿ) from 0 up to at least `max`.
 * Returns `count + 1` ticks, e.g. niceTicks(1_250_000, 3) → [0, 500000, 1000000, 1500000].
 */
export function niceTicks(max: number, count: number): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s * count >= max) ?? 10 * magnitude;
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

/** Symmetric-ish ticks covering [min, max] (min may be negative), always including 0. */
export function niceRange(min: number, max: number, count: number): number[] {
  const span = Math.max(max, 0) - Math.min(min, 0);
  if (span <= 0) return [0];
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s * count >= span) ?? 10 * magnitude;
  const low = Math.floor(Math.min(min, 0) / step) * step;
  const high = Math.ceil(Math.max(max, 0) / step) * step;
  const ticks: number[] = [];
  for (let v = low; v <= high + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}
