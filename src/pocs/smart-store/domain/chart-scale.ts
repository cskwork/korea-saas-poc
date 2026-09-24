/**
 * Axis ticks for the SVG charts: a "nice" maximum (1, 2, 2.5 or 5 × 10^k per
 * step) so gridlines land on round numbers like 0 / 50만 / 100만.
 */
export function niceTicks(maxValue: number, count = 4): number[] {
  if (!(maxValue > 0)) return [0, 1];
  const rough = maxValue / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value < maxValue + step * 0.001; value += step) ticks.push(Math.round(value * 1000) / 1000);
  if (ticks[ticks.length - 1] < maxValue) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/** 1,250,000 → "125만", 50,000 → "5만", 900 → "900" (axis labels in Korean units). */
export function formatAxisWon(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= 100_000_000) return `${+(value / 100_000_000).toFixed(1)}억`;
  if (Math.abs(value) >= 10_000) return `${+(value / 10_000).toFixed(1)}만`;
  return value.toLocaleString("ko-KR");
}
