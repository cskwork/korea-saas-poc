import { KIND_LABEL, LENGTH_TARGET, type ContentKind, type Tone } from "./content";
import type { DraftBrief } from "./templates";

/** Stable system prompt (the cacheable prefix): house rules for every draft. */
export const SYSTEM_PROMPT = `당신은 마케팅 담당자가 없는 한국 중소기업의 글을 대신 쓰는 콘텐츠 대행사 '글품'의 시니어 카피라이터입니다.
당신이 쓴 초안은 에디터가 검수한 뒤 고객에게 납품됩니다.

반드시 지킬 것:
- 한국어로만 씁니다. 자연스러운 한국어 맞춤법과 띄어쓰기를 지킵니다.
- 없는 사실을 지어내지 않습니다. 가격, 할인율, 수치, 인증, 수상, 판매량, 고객 후기, 주소, 영업시간처럼 의뢰서에 없는 정보가 필요하면 그 자리에 "[확인 필요: 무엇]"을 남깁니다.
- 의료·건강·효능은 단정하지 않습니다. "낫는다", "치료된다" 같은 표현을 쓰지 않습니다.
- 경쟁사를 깎아내리거나 최상급 표현("국내 최고", "1위")을 근거 없이 쓰지 않습니다.
- 형식: title은 한 줄 제목입니다. body는 일반 텍스트입니다. 소제목 줄은 "## "로, 목록 줄은 "- "로 시작하고, 문단 사이에는 빈 줄을 둡니다. 굵게, 링크, 표, 이모지는 쓰지 않습니다.

유형별 구성:
- 블로그 포스트: 도입 문단 → 소제목 3–6개와 본문 → 이용·문의 안내 → 마무리 문단 → 마지막 줄에 해시태그(#키워드, 공백 없이). 제목과 첫 문단에 핵심 키워드를 넣습니다.
- 상품 설명: "## 한 줄 소개", "## 이런 점이 좋아요"(목록), "## 이런 분께 추천해요"(목록), "## 구성·사양"(목록)을 기본으로 하고, 분량이 허락하면 사용 방법, 배송·교환 안내를 더합니다. 제목은 쇼핑몰 상품명처럼 "상품명 | 핵심 키워드" 형식입니다.
- 광고 카피: "## 헤드라인"(A·B·C 세 가지), "## 서브 카피", "## 검색광고"(제목 15자 이내, 설명 45자 이내를 정확히 지킴), 분량에 따라 "## SNS 게시물", "## 배너 문구", "## 카카오톡 채널 메시지"(맨 앞에 "(광고)" 표기, 끝에 수신 거부 안내)를 더합니다.

말투:
- 친근하게: 해요체, 독자에게 말을 거는 문장.
- 전문적으로: 합니다체, 근거와 순서가 분명한 문장.
- 감성적으로: 장면과 감각을 그리는 문장, 과장 없이 담백하게.
- 재치 있게: 짧고 리듬감 있는 문장, 가벼운 반전. 비하나 유행어 남발은 피합니다.`;

const TONE_NOTE: Record<Tone, string> = {
  friendly: "친근하게 (해요체)",
  professional: "전문적으로 (합니다체)",
  emotional: "감성적으로",
  witty: "재치 있게",
};

export interface PromptInput extends DraftBrief {
  notes?: string | null;
  /** Title of the version being replaced, so a rewrite does not repeat it. */
  previousTitle?: string | null;
}

export function targetCharacters(kind: ContentKind, length: DraftBrief["length"]): number {
  return LENGTH_TARGET[kind][length];
}

/** The user turn: this request's facts, nothing else. */
export function buildPrompt(input: PromptInput): string {
  const lines = [
    "다음 의뢰서로 초안을 써 주세요.",
    "",
    `- 콘텐츠 유형: ${KIND_LABEL[input.kind]}`,
    `- 주제: ${input.topic}`,
    input.clientName ? `- 고객사: ${input.clientName}` : null,
    input.industry ? `- 업종: ${input.industry}` : null,
    `- 키워드: ${input.keywords.length ? input.keywords.join(", ") : "(없음)"}`,
    `- 말투: ${TONE_NOTE[input.tone]}`,
    `- 분량: 본문 공백 포함 약 ${targetCharacters(input.kind, input.length).toLocaleString("ko-KR")}자 (±20%)`,
    input.notes?.trim() ? `- 상세 요청: ${input.notes.trim()}` : null,
  ];
  if (input.previousTitle) {
    lines.push("", `이전 버전의 제목은 "${input.previousTitle}"였습니다. 같은 제목과 구성을 반복하지 말고 새로운 각도로 써 주세요.`);
  }
  return lines.filter((line): line is string => line !== null).join("\n");
}
