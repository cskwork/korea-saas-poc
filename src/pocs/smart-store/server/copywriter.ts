import "server-only";
import { z } from "zod";
import { generateObject, type AiSource } from "@/core/ai";
import { CATEGORY_INFO } from "../domain/categories";
import {
  MAX_HASHTAGS,
  MAX_KEYWORDS,
  PROMOTIONAL_WORDS,
  TITLE_MAX_LENGTH,
  cleanTerms,
  fitTitle,
  nameTokens,
  templateListingCopy,
  type ListingCopy,
  type ListingCopyInput,
} from "../domain/listing-copy";

const copySchema = z.object({
  title: z.string().describe("네이버 쇼핑 상품명, 50자 이내"),
  description: z.string().describe("상세페이지 본문, 줄바꿈 포함"),
  keywords: z.array(z.string()).describe("검색 키워드 5~10개"),
  hashtags: z.array(z.string()).describe("# 로 시작하는 해시태그 5~10개"),
});

const SYSTEM = `당신은 네이버 스마트스토어 위탁판매 셀러를 돕는 상품 등록 카피라이터입니다.
도매 상품 정보로 네이버 쇼핑 검색에 맞는 상품명, 상세설명, 검색 키워드, 해시태그를 한국어로 씁니다.

규칙:
- 상품명: ${TITLE_MAX_LENGTH}자 이내. 핵심 키워드를 앞에 두고, 같은 단어를 반복하지 않습니다. "${PROMOTIONAL_WORDS.join('", "')}" 같은 홍보 문구, 특수문자, 대괄호를 넣지 않습니다.
- 상세설명: 짧은 문단과 "· " 목록으로 씁니다. 이모지를 쓰지 않습니다.
- 주어지지 않은 사실(성분, 소재, 인증, 수상, 리뷰 평점, 판매량, A/S 기간, 효능)은 만들지 않습니다. 셀러가 채워야 할 정보는 "[도매처 상세페이지에서 확인해 입력]"으로 표시합니다.
- 배송은 협력 도매처가 직접 보내는 위탁배송이라고 안내하고, 교환·반품은 수령 후 7일 이내, 단순 변심 반품 배송비는 구매자 부담으로 안내합니다.
- 키워드는 실제 구매자가 검색할 만한 2~4어절 표현으로, 해시태그는 공백 없이 #으로 시작합니다.`;

export interface GeneratedCopy {
  copy: ListingCopy;
  source: AiSource;
  notice?: string;
}

/** SEO title, description, keywords and hashtags — Claude when configured, the template otherwise. */
export async function writeListingCopy(input: ListingCopyInput): Promise<GeneratedCopy> {
  const fallback = () => templateListingCopy(input);
  const outcome = await generateObject({
    feature: "smart-store.listing-copy",
    system: SYSTEM,
    prompt: [
      `원본 상품명: ${input.name}`,
      `카테고리: ${CATEGORY_INFO[input.category].feeLabel}`,
      input.supplierLabel ? `도매처: ${input.supplierLabel}` : null,
      input.options ? `옵션: ${input.options}` : null,
      `출고: 결제 후 ${input.leadDays ?? 2}영업일 이내`,
    ]
      .filter(Boolean)
      .join("\n"),
    schema: copySchema,
    maxTokens: 2000,
    fallback,
  });
  return { copy: sanitize(outcome.data, fallback), source: outcome.source, notice: outcome.notice };
}

/** Holds Claude's answer to the same rules as the template (length, no promo words, bounded lists). */
function sanitize(copy: ListingCopy, fallback: () => ListingCopy): ListingCopy {
  const title = fitTitle(nameTokens(copy.title));
  const keywords = cleanTerms(copy.keywords, MAX_KEYWORDS);
  const hashtags = cleanTerms(copy.hashtags, MAX_HASHTAGS, "#");
  const description = copy.description.trim();
  if (!title || !description) return fallback();
  const template = keywords.length && hashtags.length ? null : fallback();
  return {
    title,
    description,
    keywords: keywords.length ? keywords : template!.keywords,
    hashtags: hashtags.length ? hashtags : template!.hashtags,
  };
}
