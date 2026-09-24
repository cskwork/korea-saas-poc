import { describe, expect, it } from "vitest";
import { code39Bars, CODE39_PATTERNS } from "./barcode";
import { articleRequestInput, createLinkInput, socialRequestInput } from "./inputs";
import { draftToHtml, draftToText, parseDraft } from "./draft-format";
import { discountPercent, fitsPlatform, hashtags, templateSocial, xWeightedLength } from "./social";
import { templateDraft, type DraftItem } from "./templates";

const item = (overrides: Partial<DraftItem>): DraftItem => ({
  name: "제품",
  priceWon: null,
  rating: null,
  pros: [],
  cons: [],
  reason: "",
  url: null,
  programName: null,
  ...overrides,
});

describe("draft format", () => {
  const source = [
    "> 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
    "",
    "## 한눈에 비교",
    "| 항목 | A | B |",
    "|---|---|---|",
    "| 가격 | 1원 | 2원 |",
    "",
    "- **장점**: 가벼움",
    "- 링크: https://x.test/go/abc?c=nb",
    "",
    "첫 줄",
    "이어지는 줄",
  ].join("\n");

  it("parses headings, quotes, tables, lists and paragraphs", () => {
    const blocks = parseDraft(source);
    expect(blocks.map((b) => b.type)).toEqual(["quote", "heading", "table", "list", "paragraph"]);
    expect(blocks[2]).toEqual({ type: "table", header: ["항목", "A", "B"], rows: [["가격", "1원", "2원"]] });
    expect(blocks[4]).toEqual({ type: "paragraph", text: "첫 줄 이어지는 줄" });
  });

  it("exports escaped HTML with sponsored links", () => {
    const html = draftToHtml(`${source}\n\n<script>alert(1)</script>`);
    expect(html).toContain("<h3>한눈에 비교</h3>");
    expect(html).toContain('<a href="https://x.test/go/abc?c=nb" rel="sponsored nofollow">');
    expect(html).toContain("<strong>장점</strong>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("exports plain text without markup", () => {
    const text = draftToText(source);
    expect(text).toContain("항목 · A · B");
    expect(text).toContain("- 장점: 가벼움");
    expect(text).not.toContain("**");
  });
});

describe("template drafts", () => {
  it("writes a comparison with a table, picks and every tracked link, disclosure first", () => {
    const draft = templateDraft({
      kind: "comparison",
      title: "",
      audience: "출퇴근러",
      summary: "",
      items: [
        item({ name: "버즈3 프로", priceWon: 219_000, rating: 4.5, pros: ["노캔"], url: "https://x.test/go/a?c=nb", programName: "쿠팡 파트너스" }),
        item({ name: "에어팟 프로 2", priceWon: 329_000, rating: 4.6, url: "https://x.test/go/b?c=nb", programName: "쿠팡 파트너스" }),
      ],
    });
    expect(draft.title).toBe("버즈3 프로 vs 에어팟 프로 2 비교, 뭘 사야 할까?");
    expect(draft.body.startsWith("> 이 포스팅은 쿠팡 파트너스 활동의 일환으로")).toBe(true);
    expect(draft.body).toContain("| 가격 | 219,000원 | 329,000원 |");
    expect(draft.body).toContain("**가격이 가장 중요하다면:** 버즈3 프로");
    expect(draft.body).toContain("**만족도를 우선한다면:** 에어팟 프로 2");
    expect(draft.body).toContain("https://x.test/go/a?c=nb");
    expect(draft.body).toContain("https://x.test/go/b?c=nb");
    expect(parseDraft(draft.body).some((b) => b.type === "table")).toBe(true);
  });

  it("names every program in the disclosure and falls back when there is none", () => {
    const ranking = templateDraft({
      kind: "ranking",
      title: "TOP 2",
      audience: "",
      summary: "",
      items: [item({ name: "A", programName: "쿠팡 파트너스" }), item({ name: "B", programName: "텐핑" })],
    });
    expect(ranking.title).toBe("TOP 2");
    expect(ranking.body).toContain("쿠팡 파트너스·텐핑 활동의 일환으로");
    expect(ranking.body).toContain("## 1위. A");
    expect(ranking.body).toContain("## 2위. B");

    const review = templateDraft({ kind: "review", title: "", audience: "", summary: "", items: [item({ name: "C", rating: 4 })] });
    expect(review.body).toContain("제휴 마케팅 활동의 일환으로");
    expect(review.body).toContain("## 총평: 4.0점 / 5점");
  });
});

describe("SNS variants", () => {
  const request = {
    productName: "닥터자르트 시카페어 크림 50ml",
    category: "뷰티",
    priceWon: 42_000,
    salePriceWon: 38_000,
    points: ["붉은 기 진정", "가벼운 제형", "민감 피부 OK", "네 번째", "다섯 번째", "여섯 번째는 버려짐"],
    programName: "텐핑",
    urls: { instagram: "https://x.test/go/c?c=ig", blog: "https://x.test/go/c?c=nb", x: "https://x.test/go/c?c=x", threads: "https://x.test/go/c?c=th" },
  };

  it("weights X length like X does (Hangul 2, URL 23)", () => {
    expect(xWeightedLength("abc")).toBe(3);
    expect(xWeightedLength("가나다")).toBe(6);
    expect(xWeightedLength("링크 https://example.com/a/very/long/path")).toBe(2 * 2 + 1 + 23);
  });

  it("computes discounts only when the sale price is lower", () => {
    expect(discountPercent(42_000, 38_000)).toBe(10);
    expect(discountPercent(38_000, 42_000)).toBeNull();
    expect(discountPercent(null, 38_000)).toBeNull();
  });

  it("builds deduplicated hashtags led by the ad marker", () => {
    const tags = hashtags(request);
    expect(tags[0]).toBe("#광고");
    expect(tags).toContain("#텐핑");
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags.length).toBeLessThanOrEqual(10);
  });

  it("writes four platform posts that disclose, link per channel and fit their limits", () => {
    const posts = templateSocial(request);
    for (const platform of ["instagram", "x", "threads"] as const) expect(posts[platform].startsWith("(광고) 텐핑 활동")).toBe(true);
    expect(posts.blog).toContain("텐핑 활동으로 수수료를 받을 수 있어요");
    expect(posts.instagram).toContain("c=ig");
    expect(posts.blog).toContain("c=nb");
    expect(posts.x).toContain("c=x");
    expect(posts.threads).toContain("c=th");
    expect(posts.instagram).toContain("42,000원 → 38,000원 (10% 할인)");
    expect(posts.instagram).not.toContain("여섯 번째");
    for (const platform of ["instagram", "blog", "x", "threads"] as const) expect(fitsPlatform(platform, posts[platform])).toBe(true);
  });

  it("drops optional lines to keep the X post under 280", () => {
    const long = templateSocial({ ...request, points: ["아주 긴 설명이 들어가는 첫 번째 포인트입니다 정말로 깁니다", "두 번째도 상당히 길게 작성된 포인트입니다 계속 깁니다", "세 번째 역시 길게 늘여 쓴 포인트입니다 길어요 길어요"] });
    expect(xWeightedLength(long.x)).toBeLessThanOrEqual(280);
    expect(long.x).toContain("c=x");
  });
});

describe("barcode", () => {
  it("has a valid Code 39 pattern for every character (9 elements, 3 wide)", () => {
    for (const pattern of Object.values(CODE39_PATTERNS)) {
      expect(pattern).toHaveLength(9);
      expect([...pattern].filter((c) => c === "w")).toHaveLength(3);
    }
  });

  it("frames the code with start/stop characters and skips unsupported characters", () => {
    const plain = code39Bars("ab");
    expect(plain.bars).toHaveLength(4 * 5); // *, A, B, * — five bars each
    expect(code39Bars("a_b").bars).toHaveLength(plain.bars.length);
    expect(plain.width).toBeGreaterThan(0);
  });
});

describe("form inputs", () => {
  it("validates a new link and converts units", () => {
    const parsed = createLinkInput.safeParse({
      productName: "  버즈3  ",
      programId: "",
      category: "전자기기",
      destinationUrl: "https://link.coupang.com/a/x",
      priceWon: "219,000",
      commissionType: "percent",
      commissionRate: "3",
      code: "",
      memo: "",
    });
    expect(parsed.success && parsed.data).toMatchObject({ productName: "버즈3", programId: null, priceWon: 219_000, commissionRate: 300, code: null });
  });

  it("reports field errors for unsafe destinations and bad codes", () => {
    const parsed = createLinkInput.safeParse({
      productName: "x",
      category: "전자기기",
      destinationUrl: "javascript:alert(1)",
      commissionType: "percent",
      commissionRate: "3",
      code: "-bad",
      memo: "",
    });
    expect(parsed.success).toBe(false);
    const paths = parsed.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain("destinationUrl");
    expect(paths).toContain("code");
  });

  it("zips repeated article fields and enforces item counts per template", () => {
    const ok = articleRequestInput.safeParse({
      kind: "comparison",
      title: "",
      audience: "",
      summary: "",
      itemLinkId: ["", ""],
      itemName: ["A", "B"],
      itemPrice: ["1,000", ""],
      itemRating: ["4.5", ""],
      itemPros: ["가벼움, 조용함", ""],
      itemCons: ["", ""],
      itemReason: ["", ""],
    });
    expect(ok.success && ok.data.items[0]).toEqual({ linkId: null, name: "A", priceWon: 1_000, rating: 4.5, pros: ["가벼움", "조용함"], cons: [], reason: "" });

    const single = articleRequestInput.safeParse({ kind: "comparison", title: "", audience: "", summary: "", itemName: "A" });
    expect(single.success).toBe(false);

    const badRating = articleRequestInput.safeParse({ kind: "review", title: "", audience: "", summary: "", itemName: "A", itemRating: "7" });
    expect(badRating.success).toBe(false);
  });

  it("splits SNS points by line and caps them at five", () => {
    const parsed = socialRequestInput.parse({ productName: "크림", category: "뷰티", points: "a\n\nb\nc\nd\ne\nf" });
    expect(parsed.points).toEqual(["a", "b", "c", "d", "e"]);
    expect(parsed.linkId).toBeNull();
  });
});
