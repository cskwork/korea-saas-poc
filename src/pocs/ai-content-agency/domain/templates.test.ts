import { describe, expect, it } from "vitest";
import { CONTENT_KINDS, LENGTHS, TONES, countCharacters, parseBody } from "./content";
import { charLength } from "./korean";
import { SYSTEM_PROMPT, buildPrompt } from "./prompt";
import { countOpenChecks, splitOccasion, topicSubject, writeTemplateDraft, type DraftBrief } from "./templates";

const brief = (overrides: Partial<DraftBrief> = {}): DraftBrief => ({
  kind: "blog",
  topic: "성수동 소금빵",
  tone: "friendly",
  length: "medium",
  keywords: ["소금빵", "성수동 빵집"],
  clientName: "밀과결 베이커리",
  industry: "F&B",
  ...overrides,
});

describe("writeTemplateDraft", () => {
  it("is deterministic, and a new variant reads differently", () => {
    expect(writeTemplateDraft(brief())).toEqual(writeTemplateDraft(brief()));
    const titles = new Set([0, 1, 2].map((variant) => writeTemplateDraft(brief(), variant).title));
    expect(titles.size).toBeGreaterThan(1);
  });

  it("writes every kind, tone and length without empty output", () => {
    for (const kind of CONTENT_KINDS)
      for (const tone of TONES)
        for (const length of LENGTHS) {
          const draft = writeTemplateDraft(brief({ kind, tone, length }));
          expect(draft.title.length).toBeGreaterThan(2);
          expect(parseBody(draft.body).some((b) => b.type === "heading")).toBe(true);
          expect(draft.body).not.toMatch(/undefined|null|\$\{/);
        }
  });

  it("puts the main keyword in a blog title and every keyword in the body, with hashtags", () => {
    const draft = writeTemplateDraft(brief({ topic: "새벽에 굽는 빵" }));
    expect(draft.title).toContain("소금빵");
    expect(draft.body).toContain("성수동 빵집");
    expect(draft.body.trim().split("\n").at(-1)).toContain("#성수동빵집");
  });

  it("grows with the requested length", () => {
    const short = countCharacters(writeTemplateDraft(brief({ length: "short" })).body).withSpaces;
    const long = countCharacters(writeTemplateDraft(brief({ length: "long", keywords: ["소금빵", "성수동 빵집", "버터"] })).body).withSpaces;
    expect(long).toBeGreaterThan(short * 1.5);
  });

  it("changes voice with tone", () => {
    expect(writeTemplateDraft(brief({ tone: "friendly" })).body).toMatch(/요[.!]/);
    expect(writeTemplateDraft(brief({ tone: "professional" })).body).toMatch(/니다\./);
  });

  it("leaves facts as [확인 필요] slots instead of inventing them", () => {
    const product = writeTemplateDraft(brief({ kind: "product", topic: "무선 미니 가습기 300ml" }));
    expect(countOpenChecks(product.body)).toBeGreaterThan(2);
    expect(product.body).not.toMatch(/\d+%|누적 판매|만족도|평점/);
  });

  it("keeps search ad copy within Naver's limits", () => {
    const ad = writeTemplateDraft(brief({ kind: "ad", topic: "초등 파닉스 여름방학 특강 신규 모집", length: "long" }));
    const title = ad.body.match(/제목 \(15자 이내\): (.+)/)?.[1] ?? "";
    const description = ad.body.match(/설명 \(45자 이내\): (.+)/)?.[1] ?? "";
    expect(charLength(title)).toBeGreaterThan(0);
    expect(charLength(title)).toBeLessThanOrEqual(15);
    expect(charLength(description)).toBeLessThanOrEqual(45);
    expect(ad.body).toContain("(광고)");
  });

  it("gives visit details to shops and contact details to others", () => {
    expect(writeTemplateDraft(brief({ industry: "F&B" })).body).toContain("## 이용 안내");
    expect(writeTemplateDraft(brief({ industry: "IT/테크" })).body).toContain("## 문의 안내");
  });
});

describe("topic phrases", () => {
  it("finds the subject of a headline-like topic", () => {
    expect(topicSubject("성수동 소금빵, 새벽 6시에 굽는 이유")).toBe("성수동 소금빵");
    expect(topicSubject("무선 미니 가습기 300ml")).toBe("무선 미니 가습기 300ml");
  });

  it("separates a product from its occasion", () => {
    expect(splitOccasion("수제 자몽청 가을 한정 출시")).toEqual({ name: "수제 자몽청", occasion: "가을 한정 출시" });
    expect(splitOccasion("추석 선물 세트 사전 예약")).toEqual({ name: "추석 선물 세트", occasion: "사전 예약" });
    expect(splitOccasion("비건 선크림 리뉴얼 런칭")).toEqual({ name: "비건 선크림", occasion: "리뉴얼 런칭" });
    expect(splitOccasion("비건 선크림")).toEqual({ name: "비건 선크림", occasion: null });
  });

  it("uses a headline-like topic as the blog title", () => {
    expect(writeTemplateDraft(brief({ topic: "성수동 소금빵, 새벽 6시에 굽는 이유" })).title).toBe("성수동 소금빵, 새벽 6시에 굽는 이유");
  });
});

describe("buildPrompt", () => {
  it("carries the request's facts and the target length", () => {
    const prompt = buildPrompt({ ...brief(), notes: "오픈 시간 안내로 마무리", previousTitle: "예전 제목" });
    expect(prompt).toContain("블로그 포스트");
    expect(prompt).toContain("소금빵, 성수동 빵집");
    expect(prompt).toContain("약 1,200자");
    expect(prompt).toContain("오픈 시간 안내로 마무리");
    expect(prompt).toContain("예전 제목");
  });

  it("forbids invented facts in the house rules", () => {
    expect(SYSTEM_PROMPT).toContain("[확인 필요: 무엇]");
  });
});
