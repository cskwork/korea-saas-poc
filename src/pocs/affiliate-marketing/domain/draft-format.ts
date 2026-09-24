/**
 * The light markdown used for drafts, parsed into blocks so the UI renders it
 * without HTML injection and exports clean HTML for blog editors.
 *
 * Supported: `# ` / `## ` / `### ` headings, `- ` bullet lists, `1. ` numbered lists,
 * `| a | b |` tables (first row is the header; a `|---|` separator row is optional),
 * `> ` quote (used for the disclosure), `**bold**` inline, blank-line separated paragraphs.
 */

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "quote"; text: string };

const SEPARATOR_ROW = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseDraft(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3, text: heading[2].trim() });
      continue;
    }
    if (line.startsWith(">")) {
      flush();
      blocks.push({ type: "quote", text: line.replace(/^>\s?/, "") });
      continue;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flush();
      const ordered = Boolean(numbered);
      const text = (bullet ?? numbered)![1];
      const last = blocks.at(-1);
      if (last?.type === "list" && last.ordered === ordered) last.items.push(text);
      else blocks.push({ type: "list", ordered, items: [text] });
      continue;
    }
    if (line.startsWith("|")) {
      flush();
      const rows: string[][] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        const row = lines[j].trim();
        if (!SEPARATOR_ROW.test(row)) rows.push(cells(row));
        j += 1;
      }
      i = j - 1;
      const [header = [], ...body] = rows;
      const width = Math.max(header.length, ...body.map((r) => r.length));
      const pad = (row: string[]) => [...row, ...Array.from({ length: width - row.length }, () => "")];
      blocks.push({ type: "table", header: pad(header), rows: body.map(pad) });
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Splits `**bold**` spans: odd indexes are bold. */
export function inlineSegments(text: string): string[] {
  return text.split(/\*\*(.+?)\*\*/g);
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const URL_PATTERN = /(https?:\/\/[^\s<>"')]+)/g;

function inlineHtml(text: string): string {
  return inlineSegments(text)
    .map((segment, index) => {
      const linked = escapeHtml(segment).replace(URL_PATTERN, (url) => `<a href="${url}" rel="sponsored nofollow">${url}</a>`);
      return index % 2 === 1 ? `<strong>${linked}</strong>` : linked;
    })
    .join("");
}

/** Blog-editor friendly HTML (links carry rel="sponsored", as search engines ask for paid links). */
export function draftToHtml(source: string): string {
  return parseDraft(source)
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h${block.level + 1}>${inlineHtml(block.text)}</h${block.level + 1}>`;
        case "paragraph":
          return `<p>${inlineHtml(block.text)}</p>`;
        case "quote":
          return `<blockquote>${inlineHtml(block.text)}</blockquote>`;
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          return `<${tag}>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</${tag}>`;
        }
        case "table":
          return `<table><thead><tr>${block.header.map((c) => `<th>${inlineHtml(c)}</th>`).join("")}</tr></thead><tbody>${block.rows
            .map((row) => `<tr>${row.map((c) => `<td>${inlineHtml(c)}</td>`).join("")}</tr>`)
            .join("")}</tbody></table>`;
      }
    })
    .join("\n");
}

/** Plain text (for SNS or editors without HTML paste): markup stripped, tables as "a · b" lines. */
export function draftToText(source: string): string {
  return parseDraft(source)
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
        case "quote":
          return block.text.replace(/\*\*(.+?)\*\*/g, "$1");
        case "list":
          return block.items.map((item, i) => `${block.ordered ? `${i + 1}.` : "-"} ${item.replace(/\*\*(.+?)\*\*/g, "$1")}`).join("\n");
        case "table":
          return [block.header, ...block.rows].map((row) => row.join(" · ")).join("\n");
      }
    })
    .join("\n\n");
}
