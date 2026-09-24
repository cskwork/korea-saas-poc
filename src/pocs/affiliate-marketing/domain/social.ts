import type { SocialPlatform } from "./catalog";

/**
 * Deterministic SNS post variants and the platform limits they must respect.
 * Every variant opens with an advertising disclosure (Korean guidance asks for it
 * up front on SNS) and carries a channel-tagged short link where links work.
 */

export interface SocialRequest {
  productName: string;
  category: string;
  priceWon: number | null;
  salePriceWon: number | null;
  points: string[];
  programName: string | null;
  /** Channel-tagged tracked links per platform. */
  urls: Record<SocialPlatform, string | null>;
}

export type SocialVariantSet = Record<SocialPlatform, string>;

export const PLATFORM_LIMIT: Record<SocialPlatform, { max: number | null; unit: string }> = {
  instagram: { max: 2200, unit: "자" },
  blog: { max: null, unit: "자" },
  x: { max: 280, unit: "(가중치)" },
  threads: { max: 500, unit: "자" },
};

const URL_PATTERN = /https?:\/\/\S+/g;
const X_URL_WEIGHT = 23;

/**
 * X's weighted length: URLs count 23; Latin, punctuation and common symbols count 1;
 * everything else (Hangul, CJK, emoji) counts 2.
 */
export function xWeightedLength(text: string): number {
  let length = 0;
  const withoutUrls = text.replace(URL_PATTERN, () => {
    length += X_URL_WEIGHT;
    return "";
  });
  for (const char of withoutUrls) {
    const code = char.codePointAt(0) ?? 0;
    const light =
      code <= 0x10ff || (code >= 0x2000 && code <= 0x200d) || (code >= 0x2010 && code <= 0x201f) || (code >= 0x2032 && code <= 0x2037);
    length += light ? 1 : 2;
  }
  return length;
}

export function platformLength(platform: SocialPlatform, text: string): number {
  return platform === "x" ? xWeightedLength(text) : [...text].length;
}

export function fitsPlatform(platform: SocialPlatform, text: string): boolean {
  const { max } = PLATFORM_LIMIT[platform];
  return max == null || platformLength(platform, text) <= max;
}

export function discountPercent(price: number | null, sale: number | null): number | null {
  if (price == null || sale == null || price <= 0 || sale >= price) return null;
  return Math.round((1 - sale / price) * 100);
}

/** Hashtags from the product name, category and program (no spaces, deduplicated, max 10). */
export function hashtags(request: Pick<SocialRequest, "productName" | "category" | "programName">): string[] {
  const words = request.productName
    .split(/[\s/()[\],·]+/)
    .map((w) => w.replace(/[^0-9A-Za-z가-힣]/g, ""))
    .filter((w) => w.length >= 2);
  const compact = request.productName.replace(/[^0-9A-Za-z가-힣]/g, "");
  const program = request.programName?.replace(/\s+/g, "");
  const category = request.category.replace(/[·\s]/g, "");
  const tags = ["광고", program, compact, ...words, category, `${category}추천`].filter((t): t is string => Boolean(t));
  return [...new Set(tags)].slice(0, 10).map((t) => `#${t}`);
}

const won = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

function priceLine(request: SocialRequest): string | null {
  const pct = discountPercent(request.priceWon, request.salePriceWon);
  if (pct != null) return `${won(request.priceWon!)} → ${won(request.salePriceWon!)} (${pct}% 할인)`;
  const price = request.salePriceWon ?? request.priceWon;
  return price != null ? `${won(price)}` : null;
}

function shortDisclosure(programName: string | null): string {
  return `(광고) ${programName?.trim() || "제휴 마케팅"} 활동으로 수수료를 받을 수 있어요.`;
}

/** Trims `lines` from the end until the X variant fits in 280 weighted characters. */
function fitX(head: string[], optional: string[], tail: string[]): string {
  const lines = [...optional];
  for (;;) {
    const text = [...head, ...lines, ...tail].filter(Boolean).join("\n");
    if (xWeightedLength(text) <= 280 || lines.length === 0) return text;
    lines.pop();
  }
}

export function templateSocial(request: SocialRequest): SocialVariantSet {
  const points = request.points.map((p) => p.trim()).filter(Boolean).slice(0, 5);
  const price = priceLine(request);
  const tags = hashtags(request);
  const disclosure = shortDisclosure(request.programName);

  const instagram = [
    disclosure,
    "",
    `요즘 제일 자주 손이 가는 ${request.productName}`,
    price && `가격 ${price}`,
    "",
    ...(points.length ? points.map((p) => `• ${p}`) : ["• 써 보고 좋았던 점을 적어 주세요"]),
    "",
    "구매 링크는 프로필 링크에 걸어 둘게요.",
    request.urls.instagram && `(프로필 링크용: ${request.urls.instagram})`,
    "",
    tags.join(" "),
  ]
    .filter((line): line is string => line != null)
    .join("\n");

  const blog = [
    `${request.productName}${price ? `, ${price}` : ""} 정리`,
    "",
    `${request.productName}을(를) 고민하는 분들을 위해 핵심만 정리했어요.`,
    ...(points.length ? ["", ...points.map((p, i) => `${i + 1}. ${p}`)] : []),
    "",
    request.urls.blog ? `최저가 확인하기: ${request.urls.blog}` : "구매 링크를 본문에 넣어 주세요.",
    "",
    `※ ${disclosure.replace("(광고) ", "")}`,
  ].join("\n");

  const x = fitX(
    [disclosure, `${request.productName}${price ? ` ${price}` : ""}`],
    points.slice(0, 3).map((p) => `- ${p}`),
    [request.urls.x ?? "", tags.slice(0, 3).join(" ")],
  );

  const threads = [
    disclosure,
    "",
    `${request.productName} 써 본 사람 있어요? 저는 이게 제일 좋았어요.`,
    ...(points.length ? points.slice(0, 3).map((p) => `- ${p}`) : []),
    price && `지금 ${price}`,
    request.urls.threads && `링크: ${request.urls.threads}`,
  ]
    .filter((line): line is string => line != null)
    .join("\n")
    .slice(0, 500);

  return { instagram, blog, x, threads };
}
