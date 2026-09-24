import { CATEGORY_INFO, type Category } from "./categories";

/**
 * Listing copy for Naver Shopping: an SEO product name, a detail-page
 * description, search keywords and hashtags.
 *
 * `templateListingCopy` is the deterministic fallback used when Claude is not
 * configured or fails. It follows the same rules the AI prompt states: the
 * product name stays under 50 characters, carries no promotional phrases and
 * repeats no word; the description invents no specs, reviews or guarantees and
 * marks what the seller must fill in from the wholesaler's page.
 */
export const TITLE_MAX_LENGTH = 50;
export const MAX_KEYWORDS = 10;
export const MAX_HASHTAGS = 10;

export interface ListingCopy {
  title: string;
  description: string;
  keywords: string[];
  hashtags: string[];
}

export interface ListingCopyInput {
  name: string;
  category: Category;
  /** Wholesale supplier name shown to the buyer in the shipping note, e.g. "도매매". */
  supplierLabel?: string;
  /** Option summary from the wholesaler, e.g. "블랙/아이보리 · FREE". */
  options?: string | null;
  /** Business days until the wholesaler ships. */
  leadDays?: number;
}

/** Phrases Naver treats as promotional noise in a product name. */
export const PROMOTIONAL_WORDS = [
  "무료배송",
  "당일출고",
  "당일배송",
  "특가",
  "최저가",
  "할인",
  "이벤트",
  "사은품",
  "1+1",
  "베스트",
  "추천",
];

const CATEGORY_TERMS: Record<Category, { keywords: string[]; hashtags: string[] }> = {
  fashion: {
    keywords: ["데일리룩", "코디", "패션"],
    hashtags: ["데일리룩", "오늘의코디", "패션"],
  },
  beauty: {
    keywords: ["스킨케어", "기초화장품", "피부관리"],
    hashtags: ["스킨케어", "기초케어", "뷰티템"],
  },
  living: {
    keywords: ["생활용품", "살림템", "집들이선물"],
    hashtags: ["살림템", "생활용품", "집꾸미기"],
  },
  digital: {
    keywords: ["가성비", "전자기기", "선물"],
    hashtags: ["전자기기", "가성비템", "데스크테리어"],
  },
  food: {
    keywords: ["건강간식", "간편식", "홈카페"],
    hashtags: ["건강간식", "간식추천", "홈카페"],
  },
  etc: {
    keywords: ["선물", "생활"],
    hashtags: ["선물", "생활"],
  },
};

const DESCRIPTION_POINTS: Record<Category, { forWhom: string[]; check: string[] }> = {
  fashion: {
    forWhom: ["매일 입기 편한 기본 아이템을 찾는 분", "다른 옷과 쉽게 맞춰 입고 싶은 분"],
    check: ["소재·혼용률", "실측 사이즈(총장·가슴단면·소매길이)", "세탁 방법", "색상별 재고"],
  },
  beauty: {
    forWhom: ["매일 쓰는 기초 단계를 단순하게 정리하고 싶은 분", "부담 없는 용량으로 먼저 써 보고 싶은 분"],
    check: ["전성분", "용량·사용기한", "제조업자·책임판매업자", "사용 시 주의사항"],
  },
  living: {
    forWhom: ["집안 살림을 간편하게 정리하고 싶은 분", "자주 쓰는 물건을 오래 쓰고 싶은 분"],
    check: ["재질", "크기·무게", "세척·관리 방법", "KC 인증 여부(해당 시)"],
  },
  digital: {
    forWhom: ["쓰던 기기를 가볍게 바꾸고 싶은 분", "선물용으로 실용적인 제품을 찾는 분"],
    check: ["호환 기기·규격", "배터리·출력 사양", "구성품", "KC 인증번호", "A/S 주체와 기간"],
  },
  food: {
    forWhom: ["간편하게 챙겨 먹을 간식을 찾는 분", "집에서 두고 먹을 넉넉한 양이 필요한 분"],
    check: ["원재료·함량", "영양정보", "알레르기 유발 성분", "소비기한", "보관 방법"],
  },
  etc: {
    forWhom: ["실용적인 생활 소품을 찾는 분"],
    check: ["재질", "크기", "구성품"],
  },
};

/** Words of a product name, without promotional phrases, brackets or repeats. */
export function nameTokens(name: string): string[] {
  const cleaned = name.replace(/[[\](){}<>【】]/g, " ").replace(/[!?~★☆♥*#]/g, " ");
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const token of cleaned.split(/\s+/)) {
    const word = token.trim();
    if (!word || PROMOTIONAL_WORDS.includes(word)) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push(word);
  }
  return tokens;
}

/** Joins words up to the length limit without cutting a word in half. */
export function fitTitle(words: string[], max = TITLE_MAX_LENGTH): string {
  let title = "";
  for (const word of words) {
    const next = title ? `${title} ${word}` : word;
    if (next.length > max) break;
    title = next;
  }
  return title || words.join(" ").slice(0, max);
}

/** Cleans AI or user input: trims, dedupes, drops empties, caps the count. */
export function cleanTerms(terms: readonly string[], max: number, prefix = ""): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of terms) {
    const bare = raw
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, prefix ? "" : " ");
    if (!bare) continue;
    const key = bare.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(`${prefix}${bare}`);
    if (result.length === max) break;
  }
  return result;
}

/** "무선 이어폰, 블루투스 이어폰" → keywords (a keyword may contain spaces). */
export function splitKeywords(input: string): string[] {
  return cleanTerms(input.split(/[,\n]+/), MAX_KEYWORDS);
}

/** "#이어폰 #가성비템, 선물" → hashtags (a hashtag never contains spaces). */
export function splitHashtags(input: string): string[] {
  return cleanTerms(input.split(/[\s,#]+/), MAX_HASHTAGS, "#");
}

export function templateListingCopy(input: ListingCopyInput): ListingCopy {
  const tokens = nameTokens(input.name);
  const terms = CATEGORY_TERMS[input.category];
  // The wholesaler's name already leads with the product keyword; cleaning it is the safe title.
  const title = fitTitle(tokens);

  const keywords = cleanTerms(
    [tokens.slice(-2).join(" "), ...tokens.filter((t) => t.length >= 2), ...terms.keywords],
    MAX_KEYWORDS,
  );
  const hashtags = cleanTerms([...tokens.filter((t) => t.length >= 2), ...terms.hashtags], MAX_HASHTAGS, "#");

  return { title, description: templateDescription(input, title), keywords, hashtags };
}

function templateDescription(input: ListingCopyInput, title: string): string {
  const points = DESCRIPTION_POINTS[input.category];
  const lead = input.leadDays ?? 2;
  const lines = [
    title,
    "",
    "이런 분께 권해요",
    ...points.forWhom.map((p) => `· ${p}`),
    "",
    "상품 정보",
    `· 카테고리: ${CATEGORY_INFO[input.category].feeLabel}`,
    ...(input.options ? [`· 옵션: ${input.options}`] : []),
    ...points.check.map((p) => `· ${p}: [도매처 상세페이지에서 확인해 입력]`),
    "",
    "배송 안내",
    `· 결제 확인 후 ${lead}영업일 안에 출고돼요.`,
    input.supplierLabel
      ? `· 협력 도매처(${input.supplierLabel})에서 바로 발송하는 위탁배송 상품이에요.`
      : "· 협력 도매처에서 바로 발송하는 위탁배송 상품이에요.",
    "· 도서산간 지역은 추가 배송비가 붙을 수 있어요.",
    "",
    "교환·반품",
    "· 상품 수령 후 7일 안에 신청할 수 있어요.",
    "· 단순 변심에 의한 반품 배송비는 구매자 부담이에요.",
  ];
  return lines.join("\n");
}
