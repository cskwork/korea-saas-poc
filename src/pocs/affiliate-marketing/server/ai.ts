import "server-only";
import { z } from "zod";
import { generateObject, type AiOutcome } from "@/core/ai";
import { describeRequest, templateDraft, type Draft, type DraftRequest } from "../domain/templates";
import { templateSocial, type SocialRequest, type SocialVariantSet } from "../domain/social";

/**
 * Claude-backed drafting with deterministic Korean templates as the fallback
 * (no key, over quota, or API failure all land on the template).
 */

const ARTICLE_SYSTEM = `당신은 한국 제휴 마케터(쿠팡 파트너스·텐핑 등)의 블로그 글을 대신 쓰는 카피라이터입니다.
규칙:
- 한국어 해요체로, 과장 없이 실제 사용자가 궁금해할 정보(가격, 장단점, 추천 대상) 중심으로 씁니다.
- 입력에 없는 사양, 가격, 할인, 수치, 후기를 지어내지 않습니다. 모르는 정보는 "구매 전 확인"으로 안내합니다.
- 본문 첫 줄은 입력으로 받은 대가성 문구를 "> " 인용으로 그대로 씁니다.
- 제공된 링크는 글자 하나 바꾸지 않고 그대로 넣습니다. 링크가 없으면 링크를 만들지 않습니다.
- 서식은 다음만 씁니다: "## " 소제목, "### " 작은 제목, "- " 목록, "1. " 번호 목록, "| a | b |" 표(첫 줄 머리글), "**굵게**", 빈 줄로 문단 구분.
- 비교 리뷰는 표로 나란히 비교하고, 추천 리스트는 "## 1위. 제품명" 형식, 상세 리뷰는 좋았던 점/아쉬운 점을 나눕니다.`;

const SOCIAL_SYSTEM = `당신은 한국 제휴 마케터의 SNS 게시물을 쓰는 카피라이터입니다.
규칙:
- 플랫폼별 문법을 지킵니다: 인스타그램(줄바꿈 많은 캡션, 링크는 프로필 링크 안내, 해시태그 10개 이하), 블로그(짧은 소개 글 + 링크), X(가중치 280자 이내: 한글 1자는 2로 계산, 링크는 23), 스레드(500자 이내, 대화체).
- 모든 게시물 첫 줄에 "(광고) {프로그램} 활동으로 수수료를 받을 수 있어요." 형태의 대가성 문구를 넣습니다.
- 입력에 없는 가격, 효능, 후기, 수치를 지어내지 않습니다. 의학적·과장 표현을 쓰지 않습니다.
- 제공된 플랫폼별 링크는 그대로 씁니다. 인스타그램에는 링크를 본문 대신 "프로필 링크용"으로 한 번만 적습니다.`;

const draftSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
});

const socialSchema = z.object({
  instagram: z.string().min(1),
  blog: z.string().min(1),
  x: z.string().min(1),
  threads: z.string().min(1),
});

export async function draftArticle(request: DraftRequest): Promise<AiOutcome<Draft>> {
  return generateObject({
    feature: "affiliate-marketing.article",
    system: ARTICLE_SYSTEM,
    prompt: `다음 조건으로 블로그 글 초안을 써 주세요. 제목은 title, 본문은 body에 담아 주세요.\n\n${describeRequest(request)}`,
    schema: draftSchema,
    maxTokens: 3000,
    fallback: () => templateDraft(request),
  });
}

export async function draftSocial(request: SocialRequest): Promise<AiOutcome<SocialVariantSet>> {
  const lines = [
    `상품: ${request.productName} (${request.category})`,
    `정가: ${request.priceWon ?? "미입력"} / 판매가: ${request.salePriceWon ?? "미입력"}`,
    `프로그램: ${request.programName ?? "제휴 마케팅"}`,
    `강조할 점: ${request.points.join(" / ") || "(없음)"}`,
    ...Object.entries(request.urls).map(([platform, url]) => `${platform} 링크: ${url ?? "(없음)"}`),
  ];
  return generateObject({
    feature: "affiliate-marketing.social",
    system: SOCIAL_SYSTEM,
    prompt: `다음 상품으로 플랫폼별 게시물을 써 주세요.\n\n${lines.join("\n")}`,
    schema: socialSchema,
    maxTokens: 2000,
    fallback: () => templateSocial(request),
  });
}
