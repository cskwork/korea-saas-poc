import { describe, expect, it } from "vitest";
import { ORDER_TYPES, ORDER_TYPE_INFO } from "./catalog";
import {
  cutStarts,
  formatDuration,
  keywordsOf,
  normalizeBrief,
  storyboardDuration,
  subjectOf,
  templateBrief,
} from "./brief";
import { josa } from "./josa";

describe("template brief", () => {
  const input = {
    title: "가을 신메뉴 귤라떼 릴스 3편",
    clientName: "귤담카페",
    brief: "제주 감귤로 만든 가을 한정 라떼. 따뜻하고 청량한 느낌",
    quantity: 3,
  };

  it.each(ORDER_TYPES)("produces three concepts, copy and a storyboard for %s", (type) => {
    const brief = templateBrief({ ...input, type });
    expect(brief.concepts).toHaveLength(3);
    expect(brief.copyLines.length).toBeGreaterThanOrEqual(5);
    expect(brief.storyboard.length).toBeGreaterThanOrEqual(3);
    for (const concept of brief.concepts) expect(concept.palette.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
    expect(brief.storyboard.every((cut) => cut.caption.length > 0)).toBe(true);
  });

  it("times video storyboards and leaves design frames untimed", () => {
    expect(storyboardDuration(templateBrief({ ...input, type: "short_form" }).storyboard)).toBe(22);
    expect(storyboardDuration(templateBrief({ ...input, type: "detail_page" }).storyboard)).toBeNull();
    expect(ORDER_TYPE_INFO.short_form.motion).toBe(true);
    expect(formatDuration(425)).toBe("7:05");
    expect(cutStarts(templateBrief({ ...input, type: "short_form" }).storyboard)).toEqual([0, 3, 7, 13, 18]);
  });

  it("works from the order's own words", () => {
    const brief = templateBrief({ ...input, type: "short_form" });
    expect(subjectOf(input.title)).toBe("가을 신메뉴 귤라떼");
    expect(brief.concepts[0].description).toContain("가을 신메뉴 귤라떼의");
    expect(keywordsOf(input.brief)).toEqual(["제주", "감귤로", "만든", "가을"]);
  });

  it("is deterministic", () => {
    expect(templateBrief({ ...input, type: "thumbnail" })).toEqual(templateBrief({ ...input, type: "thumbnail" }));
  });
});

describe("normalizeBrief", () => {
  it("clamps counts and repairs palettes", () => {
    const normalized = normalizeBrief({
      concepts: Array.from({ length: 5 }, (_, i) => ({
        title: ` 방향 ${i} `,
        description: "설명",
        keywords: ["a"],
        palette: ["red", "#12"],
      })),
      copyLines: ["  한 줄 ", "", "두 줄"],
      storyboard: [{ label: "컷", shot: "C.U.", visual: "화면", caption: "자막", seconds: 2.6 }],
    });
    expect(normalized.concepts).toHaveLength(3);
    expect(normalized.concepts[0].title).toBe("방향 0");
    expect(normalized.concepts[0].palette).toHaveLength(3);
    expect(normalized.copyLines).toEqual(["한 줄", "두 줄"]);
    expect(normalized.storyboard[0].seconds).toBe(3);
  });
});

describe("josa", () => {
  it("picks the particle from the final consonant", () => {
    expect(josa("귤라떼", "을/를")).toBe("귤라떼를");
    expect(josa("수박주스", "이/가")).toBe("수박주스가");
    expect(josa("간판", "이/가")).toBe("간판이");
    expect(josa("서울", "으로/로")).toBe("서울로");
    expect(josa("부산", "으로/로")).toBe("부산으로");
    expect(josa("3", "을/를")).toBe("3을");
  });
});
