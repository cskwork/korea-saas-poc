import { describe, expect, it } from "vitest";
import {
  MAX_HASHTAGS,
  MAX_KEYWORDS,
  PROMOTIONAL_WORDS,
  TITLE_MAX_LENGTH,
  cleanTerms,
  fitTitle,
  nameTokens,
  splitHashtags,
  splitKeywords,
  templateListingCopy,
} from "./listing-copy";

describe("nameTokens", () => {
  it("drops brackets, promotional words and repeats", () => {
    expect(nameTokens("[무료배송] 스텐 텀블러 500ml 스텐 특가!")).toEqual(["스텐", "텀블러", "500ml"]);
  });
});

describe("fitTitle", () => {
  it("never cuts a word in half", () => {
    const title = fitTitle(["가".repeat(20), "나".repeat(20), "다".repeat(20)]);
    expect(title).toBe(`${"가".repeat(20)} ${"나".repeat(20)}`);
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });
});

describe("templateListingCopy", () => {
  const copy = templateListingCopy({
    name: "여성 플리스 후리스 자켓 겨울 아우터",
    category: "fashion",
    supplierLabel: "도매매",
    options: "블랙/아이보리 · FREE",
    leadDays: 2,
  });

  it("is deterministic", () => {
    expect(
      templateListingCopy({
        name: "여성 플리스 후리스 자켓 겨울 아우터",
        category: "fashion",
        supplierLabel: "도매매",
        options: "블랙/아이보리 · FREE",
        leadDays: 2,
      }),
    ).toEqual(copy);
  });

  it("writes a clean SEO title", () => {
    expect(copy.title.startsWith("여성 플리스 후리스 자켓 겨울 아우터")).toBe(true);
    expect(copy.title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    for (const word of PROMOTIONAL_WORDS) expect(copy.title).not.toContain(word);
    const words = copy.title.split(" ");
    expect(new Set(words).size).toBe(words.length);
  });

  it("marks facts the seller must fill in instead of inventing them", () => {
    expect(copy.description).toContain("[도매처 상세페이지에서 확인해 입력]");
    expect(copy.description).toContain("도매매");
    expect(copy.description).toContain("블랙/아이보리 · FREE");
    expect(copy.description).not.toMatch(/평점|재구매율|피부과|무상 A\/S/);
  });

  it("returns bounded, unique keywords and hashtags", () => {
    expect(copy.keywords.length).toBeGreaterThan(3);
    expect(copy.keywords.length).toBeLessThanOrEqual(MAX_KEYWORDS);
    expect(new Set(copy.keywords).size).toBe(copy.keywords.length);
    expect(copy.hashtags.length).toBeLessThanOrEqual(MAX_HASHTAGS);
    for (const tag of copy.hashtags) expect(tag).toMatch(/^#\S+$/);
  });
});

describe("term parsing", () => {
  it("splits keywords on commas and keeps inner spaces", () => {
    expect(splitKeywords("무선 이어폰, 블루투스 이어폰,,무선 이어폰\n가성비")).toEqual([
      "무선 이어폰",
      "블루투스 이어폰",
      "가성비",
    ]);
  });

  it("splits hashtags on spaces, commas and #", () => {
    expect(splitHashtags("#이어폰 #가성비템, 선물 #이어폰")).toEqual(["#이어폰", "#가성비템", "#선물"]);
  });

  it("caps the number of terms", () => {
    expect(
      cleanTerms(
        Array.from({ length: 30 }, (_, i) => `k${i}`),
        5,
      ),
    ).toHaveLength(5);
  });
});
