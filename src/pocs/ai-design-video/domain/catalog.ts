/**
 * The studio's vocabulary: what it makes (order types, each with the frame it is
 * delivered in) and where an order is in production (status = 콘티 scene).
 */

export const ORDER_TYPES = [
  "thumbnail",
  "banner",
  "detail_page",
  "short_form",
  "video_edit",
  "logo",
  "bundle",
] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

/** Safe-area guides drawn inside a frame, specific to how the format is viewed. */
export type FrameGuide = "title-safe" | "shorts-safe" | "center" | "sections" | "banner" | "set";

export interface FrameSpec {
  /** Width and height of the deliverable's aspect ratio. */
  ratio: readonly [number, number];
  /** Printed beside the frame, e.g. "16:9". */
  aspect: string;
  /** Delivery size, e.g. "1280×720". */
  size: string;
  guide: FrameGuide;
}

export interface OrderTypeInfo {
  label: string;
  /** Compact label for tight table cells. */
  short: string;
  frame: FrameSpec;
  /** Video work gets a timed shot list; design work gets layout frames. */
  motion: boolean;
}

export const ORDER_TYPE_INFO: Record<OrderType, OrderTypeInfo> = {
  thumbnail: {
    label: "SNS·유튜브 썸네일",
    short: "썸네일",
    frame: { ratio: [16, 9], aspect: "16:9", size: "1280×720", guide: "title-safe" },
    motion: false,
  },
  banner: {
    label: "배너",
    short: "배너",
    frame: { ratio: [3, 1], aspect: "3:1", size: "1200×400", guide: "banner" },
    motion: false,
  },
  detail_page: {
    label: "쇼핑몰 상세페이지",
    short: "상세페이지",
    frame: { ratio: [9, 26], aspect: "세로형", size: "860×2480", guide: "sections" },
    motion: false,
  },
  short_form: {
    label: "숏폼·릴스",
    short: "숏폼",
    frame: { ratio: [9, 16], aspect: "9:16", size: "1080×1920", guide: "shorts-safe" },
    motion: true,
  },
  video_edit: {
    label: "유튜브 영상 편집",
    short: "영상 편집",
    frame: { ratio: [16, 9], aspect: "16:9", size: "1920×1080", guide: "title-safe" },
    motion: true,
  },
  logo: {
    label: "로고 & 브랜딩",
    short: "로고",
    frame: { ratio: [1, 1], aspect: "1:1", size: "벡터", guide: "center" },
    motion: false,
  },
  bundle: {
    label: "종합 패키지",
    short: "종합",
    frame: { ratio: [4, 3], aspect: "세트", size: "썸네일·영상·상세", guide: "set" },
    motion: true,
  },
};

export const ORDER_STATUSES = ["received", "drafting", "revision", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** How a frame is drawn at each stage: blue sketch → pencil → red correction → ink. */
export type FrameMedium = "sketch" | "pencil" | "redline" | "ink";

export interface StatusInfo {
  label: string;
  /** Scene number on the sheet (S#1–S#4). */
  scene: number;
  medium: FrameMedium;
  /** One line on what the stage means for the operator. */
  hint: string;
}

export const STATUS_INFO: Record<OrderStatus, StatusInfo> = {
  received: { label: "의뢰접수", scene: 1, medium: "sketch", hint: "브리프 확인 후 시안 작업을 시작해요" },
  drafting: { label: "시안작업", scene: 2, medium: "pencil", hint: "시안을 만들거나 수정본을 작업 중이에요" },
  revision: { label: "수정요청", scene: 3, medium: "redline", hint: "고객 수정 요청을 받아 반영을 기다려요" },
  delivered: { label: "납품완료", scene: 4, medium: "ink", hint: "최종 파일을 전달했어요" },
};

export const OPEN_STATUSES: readonly OrderStatus[] = ["received", "drafting", "revision"];

export type PlanKind = "single" | "subscription";

export const PLAN_LABEL: Record<PlanKind, string> = { single: "단건", subscription: "월 구독" };

export function isOrderType(value: string): value is OrderType {
  return (ORDER_TYPES as readonly string[]).includes(value);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
