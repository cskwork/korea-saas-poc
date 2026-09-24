/**
 * The issue editor's simple formatting, parsed into blocks that React renders
 * directly (never as HTML strings):
 *
 *   ## 소제목            heading
 *   - 항목              bullet list
 *   > 인용              quote
 *   ---                 divider; the first one also ends the free preview of a paid issue
 *   **굵게**, [글자](https://…)   inline emphasis and links
 */

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "link"; text: string; href: string };

export type Block =
  | { kind: "heading"; inlines: Inline[] }
  | { kind: "paragraph"; inlines: Inline[] }
  | { kind: "quote"; inlines: Inline[] }
  | { kind: "list"; items: Inline[][] }
  | { kind: "divider" };

const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

export function parseInline(source: string): Inline[] {
  const result: Inline[] = [];
  let cursor = 0;
  for (const match of source.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push({ kind: "text", text: source.slice(cursor, index) });
    if (match[1] !== undefined) {
      result.push({ kind: "strong", text: match[1] });
    } else if (SAFE_HREF.test(match[3])) {
      result.push({ kind: "link", text: match[2], href: match[3] });
    } else {
      result.push({ kind: "text", text: match[2] });
    }
    cursor = index + match[0].length;
  }
  if (cursor < source.length) result.push({ kind: "text", text: source.slice(cursor) });
  return result;
}

export function parseMarkup(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", inlines: parseInline(paragraph.join("\n")) });
    if (quote.length) blocks.push({ kind: "quote", inlines: parseInline(quote.join("\n")) });
    if (list.length) blocks.push({ kind: "list", items: list.map(parseInline) });
    paragraph = [];
    quote = [];
    list = [];
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (/^-{3,}$/.test(line)) {
      flush();
      blocks.push({ kind: "divider" });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "heading", inlines: parseInline(line.slice(3).trim()) });
    } else if (/^[-*] /.test(line)) {
      if (paragraph.length || quote.length) flush();
      list.push(line.slice(2).trim());
    } else if (line.startsWith(">")) {
      if (paragraph.length || list.length) flush();
      quote.push(line.replace(/^>\s?/, ""));
    } else {
      if (quote.length || list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

/**
 * The free part of a paid issue: everything before the first divider, or the
 * first two blocks when the editor placed none.
 */
export function previewBlocks(blocks: Block[]): Block[] {
  const breakAt = blocks.findIndex((block) => block.kind === "divider");
  if (breakAt > 0) return blocks.slice(0, breakAt);
  return blocks.filter((block) => block.kind !== "divider").slice(0, 2);
}

/** Markup stripped to readable text (excerpts, character counts). */
export function plainText(source: string): string {
  return source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !/^-{3,}$/.test(line))
    .map((line) => line.replace(/^(## |[-*] |>\s?)/, ""))
    .join("\n")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .trim();
}

export function excerpt(source: string, maxLength = 90): string {
  const text = plainText(source).replace(/\s+/g, " ");
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
