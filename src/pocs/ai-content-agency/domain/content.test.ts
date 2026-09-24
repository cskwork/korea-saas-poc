import { describe, expect, it } from "vitest";
import { composeCopy, countCharacters, excerpt, lengthFit, parseBody, parseKeywords } from "./content";
import { fitLength, hashtag, josa } from "./korean";

describe("parseKeywords", () => {
  it("splits on commas, newlines and #, trims and de-duplicates", () => {
    expect(parseKeywords("소금빵, 성수동 빵집,  소금빵\n#성수 베이커리")).toEqual(["소금빵", "성수동 빵집", "성수 베이커리"]);
  });

  it("caps the number and length of keywords", () => {
    const many = Array.from({ length: 12 }, (_, i) => `키워드${i}`).join(",");
    expect(parseKeywords(many)).toHaveLength(8);
    expect(parseKeywords("가".repeat(40))[0]).toHaveLength(20);
  });

  it("accepts arrays and empty input", () => {
    expect(parseKeywords(["a", " b "])).toEqual(["a", "b"]);
    expect(parseKeywords("")).toEqual([]);
    expect(parseKeywords(undefined)).toEqual([]);
  });
});

describe("countCharacters", () => {
  it("counts with and without spaces, ignoring line breaks, and 200자 원고지 매수", () => {
    const count = countCharacters("안녕 하세요\n반가워요");
    expect(count.withSpaces).toBe(10);
    expect(count.withoutSpaces).toBe(9);
    expect(countCharacters("가".repeat(450)).manuscriptPages).toBe(2.3);
  });

  it("counts emoji and combined characters by code point", () => {
    expect(countCharacters("😀가").withSpaces).toBe(2);
  });
});

describe("lengthFit", () => {
  it("allows ±20% around the target", () => {
    expect(lengthFit(1600, 1600).fit).toBe("fit");
    expect(lengthFit(1200, 1600)).toEqual({ fit: "short", difference: -400 });
    expect(lengthFit(2000, 1600).fit).toBe("long");
  });
});

describe("parseBody", () => {
  it("reads headings, lists and paragraphs", () => {
    const blocks = parseBody("도입 문단\n이어지는 줄\n\n## 소제목\n- 하나\n- 둘\n마무리");
    expect(blocks).toEqual([
      { type: "paragraph", text: "도입 문단\n이어지는 줄" },
      { type: "heading", text: "소제목" },
      { type: "list", items: ["하나", "둘"] },
      { type: "paragraph", text: "마무리" },
    ]);
  });
});

describe("excerpt and composeCopy", () => {
  it("previews the first paragraph", () => {
    expect(excerpt("## 제목\n\n첫 문단입니다.\n\n둘째 문단")).toBe("첫 문단입니다.");
    expect(excerpt("가".repeat(200), 10)).toHaveLength(10);
  });

  it("joins title and body for pasting", () => {
    expect(composeCopy(" 제목 ", "본문\n")).toBe("제목\n\n본문\n");
  });
});

describe("Korean particles", () => {
  it("follows the final consonant", () => {
    expect(josa("소금빵", "을/를")).toBe("소금빵을");
    expect(josa("가습기", "을/를")).toBe("가습기를");
    expect(josa("수제청", "이/가")).toBe("수제청이");
    expect(josa("크림", "은/는")).toBe("크림은");
    expect(josa("스킨케어", "과/와")).toBe("스킨케어와");
  });

  it("uses 로 after ㄹ and open syllables, 으로 otherwise", () => {
    expect(josa("검수", "으로/로")).toBe("검수로");
    expect(josa("작성중", "으로/로")).toBe("작성중으로");
    expect(josa("서울", "으로/로")).toBe("서울로");
    expect(josa("납품완료", "으로/로")).toBe("납품완료로");
  });

  it("reads digits and some Latin letters", () => {
    expect(josa("300", "을/를")).toBe("300을");
    expect(josa("1", "이/가")).toBe("1이");
    expect(josa("2", "이/가")).toBe("2가");
  });

  it("formats hashtags and fits lengths at word boundaries", () => {
    expect(hashtag("성수 베이커리")).toBe("#성수베이커리");
    expect(fitLength("초등 파닉스 여름방학 특강 모집", 12)).toBe("초등 파닉스 여름방학");
    expect(fitLength("짧음", 12)).toBe("짧음");
  });
});
