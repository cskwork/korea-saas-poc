import type { OrderType } from "./catalog";

/**
 * AI tools the studio works with (reference notes carried over from the studio's
 * original tool list). Plans and prices of third-party tools change; the UI says so.
 */

export const TOOL_USES = ["design", "image", "video", "text", "audio"] as const;
export type ToolUse = (typeof TOOL_USES)[number];

export const TOOL_USE_LABEL: Record<ToolUse, string> = {
  design: "디자인",
  image: "이미지 생성",
  video: "영상 편집",
  text: "텍스트·카피",
  audio: "음악·사운드",
};

export type ToolPricing = "free" | "freemium" | "paid";

export const TOOL_PRICING_LABEL: Record<ToolPricing, string> = {
  free: "무료",
  freemium: "무료 + 유료 플랜",
  paid: "유료",
};

export interface AiTool {
  name: string;
  uses: readonly ToolUse[];
  pricing: ToolPricing;
  /** 1 쉬움 · 2 보통 · 3 어려움 */
  difficulty: 1 | 2 | 3;
  strengths: readonly string[];
  /** Order types this tool is part of the studio's default kit for. */
  kitFor: readonly OrderType[];
  note: string;
}

export const DIFFICULTY_LABEL = { 1: "쉬움", 2: "보통", 3: "어려움" } as const;

export const AI_TOOLS: readonly AiTool[] = [
  {
    name: "Canva",
    uses: ["design"],
    pricing: "freemium",
    difficulty: 1,
    strengths: ["템플릿", "SNS 규격", "간단한 영상"],
    kitFor: ["thumbnail", "banner", "detail_page", "bundle"],
    note: "템플릿으로 빠르게 시안을 여러 개 뽑을 때 쓰는 기본 도구예요.",
  },
  {
    name: "Figma",
    uses: ["design"],
    pricing: "freemium",
    difficulty: 3,
    strengths: ["정밀 레이아웃", "컴포넌트", "협업 공유"],
    kitFor: ["detail_page", "logo"],
    note: "상세페이지처럼 길고 정밀한 레이아웃, 로고 벡터 정리에 써요.",
  },
  {
    name: "Midjourney",
    uses: ["image"],
    pricing: "paid",
    difficulty: 2,
    strengths: ["고품질 이미지", "스타일 지정", "업스케일"],
    kitFor: ["thumbnail", "logo", "banner"],
    note: "로고 콘셉트, 배경 아트워크처럼 분위기가 중요한 이미지를 만들어요.",
  },
  {
    name: "Leonardo AI",
    uses: ["image"],
    pricing: "freemium",
    difficulty: 2,
    strengths: ["무료 크레딧", "제품 이미지", "배치 생성"],
    kitFor: ["detail_page", "banner"],
    note: "제품 연출 컷과 배경 변환을 무료 크레딧 안에서 시험해요.",
  },
  {
    name: "Remove.bg",
    uses: ["image"],
    pricing: "freemium",
    difficulty: 1,
    strengths: ["배경 제거", "일괄 처리"],
    kitFor: ["thumbnail", "detail_page", "banner"],
    note: "인물·제품 누끼를 한 번에 따요. 고해상도는 유료예요.",
  },
  {
    name: "CapCut",
    uses: ["video"],
    pricing: "freemium",
    difficulty: 1,
    strengths: ["자동 자막", "숏폼 템플릿", "효과·전환"],
    kitFor: ["short_form", "video_edit", "bundle"],
    note: "숏폼과 유튜브 편집의 기본 도구예요. 자동 자막으로 시간을 가장 많이 줄여요.",
  },
  {
    name: "Runway",
    uses: ["video", "image"],
    pricing: "freemium",
    difficulty: 3,
    strengths: ["이미지→영상", "배경 제거", "모션 생성"],
    kitFor: ["short_form"],
    note: "정지 이미지를 짧은 움직임으로 바꾸는 인서트 컷에 써요.",
  },
  {
    name: "ChatGPT",
    uses: ["text"],
    pricing: "freemium",
    difficulty: 1,
    strengths: ["카피 초안", "대본", "기획 정리"],
    kitFor: ["thumbnail", "detail_page", "short_form", "video_edit", "bundle"],
    note: "카피 후보와 영상 대본 초안을 빠르게 늘어놓을 때 써요.",
  },
  {
    name: "Suno",
    uses: ["audio"],
    pricing: "freemium",
    difficulty: 1,
    strengths: ["배경음악 생성", "장르 지정"],
    kitFor: ["short_form", "video_edit"],
    note: "영상 배경음악을 장르와 길이에 맞춰 만들어요. 상업 이용 조건은 플랜마다 달라요.",
  },
];

export const TOOL_NAMES = AI_TOOLS.map((tool) => tool.name);

export function toolsForType(type: OrderType): AiTool[] {
  return AI_TOOLS.filter((tool) => tool.kitFor.includes(type));
}

export interface ToolUsage {
  total: number;
  byType: Partial<Record<OrderType, number>>;
}

/** How many orders used each tool, overall and per order type (names outside the catalogue are ignored). */
export function toolUsage(orders: readonly { type: OrderType; tools: readonly string[] }[]): Map<string, ToolUsage> {
  const usage = new Map<string, ToolUsage>(TOOL_NAMES.map((name) => [name, { total: 0, byType: {} }]));
  for (const order of orders) {
    for (const name of new Set(order.tools)) {
      const entry = usage.get(name);
      if (!entry) continue;
      entry.total += 1;
      entry.byType[order.type] = (entry.byType[order.type] ?? 0) + 1;
    }
  }
  return usage;
}
