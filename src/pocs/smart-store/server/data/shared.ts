/** `%query%` for ILIKE with the user's `%`, `_` and `\` taken literally. */
export function containsPattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export const PAGE_SIZE = 20;
