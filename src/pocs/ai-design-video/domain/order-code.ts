/** Order reference numbers: ORD-YYYYMMDD-NNN, numbered per intake day. */

export function orderCodePrefix(day: string): string {
  return `ORD-${day.replaceAll("-", "")}-`;
}

export function nextOrderCode(day: string, existingCodes: readonly string[]): string {
  const prefix = orderCodePrefix(day);
  const highest = existingCodes
    .filter((code) => code.startsWith(prefix))
    .map((code) => Number(code.slice(prefix.length)))
    .filter(Number.isFinite)
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

/** "ORD-20260924-003" → "003" (the cut number shown on the sheet). */
export function cutNumber(code: string): string {
  return code.slice(-3);
}
