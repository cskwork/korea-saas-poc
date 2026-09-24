import { describe, expect, it } from "vitest";
import { excerpt, parseInline, parseMarkup, plainText, previewBlocks } from "./markup";

describe("markup", () => {
  it("parses headings, lists, quotes, dividers and paragraphs", () => {
    const blocks = parseMarkup("첫 문단\n이어지는 줄\n\n## 소제목\n- 하나\n- 둘\n> 인용\n---\n끝");
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "heading", "list", "quote", "divider", "paragraph"]);
    expect(blocks[0]).toEqual({ kind: "paragraph", inlines: [{ kind: "text", text: "첫 문단\n이어지는 줄" }] });
    expect(blocks[2]).toMatchObject({ kind: "list", items: [[{ text: "하나" }], [{ text: "둘" }]] });
  });

  it("parses bold and only safe links", () => {
    expect(parseInline("**굵게** 와 [링크](https://example.com) 그리고 [위험](javascript:alert(1))")).toEqual([
      { kind: "strong", text: "굵게" },
      { kind: "text", text: " 와 " },
      { kind: "link", text: "링크", href: "https://example.com" },
      { kind: "text", text: " 그리고 " },
      { kind: "text", text: "위험" },
      { kind: "text", text: ")" },
    ]);
  });

  it("previews up to the first divider, or the first two blocks", () => {
    expect(previewBlocks(parseMarkup("하나\n\n둘\n\n---\n\n셋")).length).toBe(2);
    expect(previewBlocks(parseMarkup("하나\n\n둘\n\n셋\n\n넷")).length).toBe(2);
    expect(previewBlocks(parseMarkup("---\n\n하나\n\n둘\n\n셋")).map((b) => b.kind)).toEqual(["paragraph", "paragraph"]);
  });

  it("strips markup for plain text and excerpts", () => {
    expect(plainText("## 제목\n- **굵은** 항목\n> [링크](https://a.b)\n---")).toBe("제목\n굵은 항목\n링크");
    expect(excerpt("가".repeat(100), 10)).toBe(`${"가".repeat(10)}…`);
  });
});
