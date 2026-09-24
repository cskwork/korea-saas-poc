/**
 * Content vocabulary: what the agency writes, in which voice and at which length,
 * plus the character arithmetic Korean writing work is measured in.
 */

export const CONTENT_KINDS = ["blog", "product", "ad"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export const KIND_LABEL: Record<ContentKind, string> = {
  blog: "블로그 포스트",
  product: "상품 설명",
  ad: "광고 카피",
};

export const KIND_HINT: Record<ContentKind, string> = {
  blog: "네이버 블로그·자사 블로그에 올릴 정보성 글",
  product: "스마트스토어·쇼핑몰 상세페이지 문구",
  ad: "검색광고·SNS·배너에 쓸 짧은 문구 묶음",
};

export const TOPIC_PLACEHOLDER: Record<ContentKind, string> = {
  blog: "예: 성수동 소금빵 맛집이 새벽 6시에 굽는 이유",
  product: "예: 무선 미니 가습기 300ml",
  ad: "예: 수제청 가을 신메뉴 출시",
};

export const TONES = ["friendly", "professional", "emotional", "witty"] as const;
export type Tone = (typeof TONES)[number];

export const TONE_LABEL: Record<Tone, string> = {
  friendly: "친근하게",
  professional: "전문적으로",
  emotional: "감성적으로",
  witty: "재치 있게",
};

export const LENGTHS = ["short", "medium", "long"] as const;
export type Length = (typeof LENGTHS)[number];

export const LENGTH_LABEL: Record<Length, string> = {
  short: "짧게",
  medium: "보통",
  long: "길게",
};

/** Target size (characters including spaces) per kind and length. */
export const LENGTH_TARGET: Record<ContentKind, Record<Length, number>> = {
  blog: { short: 700, medium: 1200, long: 2000 },
  product: { short: 300, medium: 500, long: 800 },
  ad: { short: 200, medium: 350, long: 550 },
};

export const INDUSTRIES = ["F&B", "뷰티", "헬스케어", "교육", "펫", "IT/테크", "가전", "제조", "생활/리빙"] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const MAX_KEYWORDS = 8;
export const MAX_KEYWORD_LENGTH = 20;

/** "소금빵, 성수동 빵집,  소금빵" → ["소금빵", "성수동 빵집"]. Commas, newlines and '#' separate. */
export function parseKeywords(input: string | readonly string[] | undefined | null): string[] {
  const raw = typeof input === "string" ? input : input ? input.join(",") : "";
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[,\n#]/)) {
    const keyword = part.replace(/\s+/g, " ").trim().slice(0, MAX_KEYWORD_LENGTH);
    if (!keyword || seen.has(keyword)) continue;
    seen.add(keyword);
    result.push(keyword);
    if (result.length === MAX_KEYWORDS) break;
  }
  return result;
}

export interface CharacterCount {
  /** 공백 포함 (line breaks excluded). */
  withSpaces: number;
  /** 공백 제외. */
  withoutSpaces: number;
  /** 200자 원고지 매수, one decimal. */
  manuscriptPages: number;
}

export function countCharacters(text: string): CharacterCount {
  const chars = Array.from(text.replace(/\r?\n/g, ""));
  const withSpaces = chars.length;
  const withoutSpaces = chars.filter((c) => !/\s/.test(c)).length;
  return { withSpaces, withoutSpaces, manuscriptPages: Math.round((withSpaces / 200) * 10) / 10 };
}

export type LengthFit = "short" | "fit" | "long";

/** How a text's length compares to its target: within ±20% is a fit. */
export function lengthFit(characters: number, target: number): { fit: LengthFit; difference: number } {
  const difference = characters - target;
  if (characters < target * 0.8) return { fit: "short", difference };
  if (characters > target * 1.2) return { fit: "long", difference };
  return { fit: "fit", difference };
}

/** The text a client pastes: title, blank line, body. */
export function composeCopy(title: string, body: string): string {
  return `${title.trim()}\n\n${body.trim()}\n`;
}

export type BodyBlock =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

/**
 * Drafts are plain text with two light conventions: "## " starts a heading and
 * "- " a list item. Blank lines separate paragraphs.
 */
export function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    if (list.length) blocks.push({ type: "list", items: list });
    paragraph = [];
    list = [];
  };

  for (const rawLine of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
    } else if (/^\s*[-•]\s+/.test(line)) {
      if (paragraph.length) {
        blocks.push({ type: "paragraph", text: paragraph.join("\n") });
        paragraph = [];
      }
      list.push(line.replace(/^\s*[-•]\s+/, ""));
    } else {
      if (list.length) {
        blocks.push({ type: "list", items: list });
        list = [];
      }
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

/** First meaningful prose of a draft, for previews. */
export function excerpt(body: string, maxLength = 120): string {
  const firstParagraph = parseBody(body).find((b) => b.type === "paragraph");
  const text = (firstParagraph?.type === "paragraph" ? firstParagraph.text : body).replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
