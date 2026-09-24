import { shortPath } from "../domain/codes";
import type { Breakdown } from "../domain/metrics";
import { formatWon } from "@/core/format";
import type { ShareItem } from "./charts/ShareBar";

/** Presentation helpers shared by screens (pure; safe in server and client components). */

export function shortUrl(origin: string, code: string, channelTag?: string): string {
  return `${origin}${shortPath(code, channelTag)}`;
}

/** "localhost:3000/affiliate-marketing/go/abc" — the URL without its scheme, for display. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** A destination for reading: scheme dropped, percent-escapes decoded, long tails cut. */
export function readableUrl(url: string, max = 80): string {
  let text = displayUrl(url);
  try {
    text = decodeURI(text);
  } catch {
    // Malformed escapes: show the raw URL.
  }
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Program revenue shares with colours fixed by program order (never by rank). */
export function programShares(rows: Breakdown[], order: string[]): ShareItem[] {
  return rows
    .filter((row) => row.revenue > 0)
    .map((row) => {
      const slot = order.indexOf(row.key);
      return { key: row.key, label: row.key, value: row.revenue, valueLabel: formatWon(row.revenue), slot: slot >= 0 ? slot : null };
    });
}
