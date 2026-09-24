import type { LineItem } from "./money";

/**
 * Deterministic estimate draft from a client's request (the no-AI path of "요청서로 초안 만들기").
 * Keywords map to typical feature blocks with conservative hours for a solo developer; planning and
 * QA/deployment are always included. The developer is expected to adjust every line.
 */

interface FeatureRule {
  title: string;
  hours: number;
  keywords: readonly string[];
}

const FEATURE_RULES: readonly FeatureRule[] = [
  { title: "UI/UX 디자인 (주요 화면 시안)", hours: 24, keywords: ["디자인", "ui", "ux", "피그마", "figma", "시안"] },
  { title: "반응형 퍼블리싱", hours: 16, keywords: ["랜딩", "홈페이지", "웹사이트", "반응형", "퍼블리싱", "소개 페이지"] },
  { title: "회원가입 · 로그인 (소셜 포함)", hours: 16, keywords: ["로그인", "회원", "가입", "인증", "소셜", "카카오 로그인"] },
  { title: "결제 · 구독 연동", hours: 24, keywords: ["결제", "구독", "pg", "토스", "카드", "정기결제"] },
  { title: "관리자 페이지", hours: 24, keywords: ["관리자", "어드민", "admin", "백오피스", "대시보드"] },
  { title: "게시판 · 리뷰 · 댓글", hours: 16, keywords: ["게시판", "커뮤니티", "댓글", "리뷰", "후기"] },
  { title: "예약 · 일정 관리", hours: 20, keywords: ["예약", "일정", "캘린더", "스케줄"] },
  { title: "채팅 · 알림", hours: 20, keywords: ["채팅", "메시지", "알림", "푸시", "알림톡"] },
  { title: "지도 · 위치 기반 기능", hours: 16, keywords: ["지도", "위치", "배달", "주변", "gps"] },
  { title: "검색 · 필터", hours: 8, keywords: ["검색", "필터", "정렬"] },
  { title: "외부 API 연동", hours: 12, keywords: ["api", "연동", "크롤링", "외부 서비스"] },
  { title: "앱 빌드 · 스토어 등록", hours: 12, keywords: ["앱", "ios", "안드로이드", "android", "react native", "flutter", "스토어"] },
];

export interface EstimateDraft {
  items: LineItem[];
  /** One-line Korean explanation of how the draft was made. */
  summary: string;
}

export function draftEstimateFromBrief(brief: string, hourlyRate: number): EstimateDraft {
  const text = brief.toLowerCase();
  const matched = FEATURE_RULES.filter((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  const features = matched.length > 0 ? matched : [{ title: "핵심 기능 개발", hours: 32, keywords: [] }];

  const featureHours = features.reduce((sum, feature) => sum + feature.hours, 0);
  const planningHours = featureHours >= 80 ? 16 : 8;
  const qaHours = Math.max(8, Math.round(featureHours * 0.15));

  const line = (title: string, hours: number): LineItem => ({ title, unit: "hour", quantity: hours, unitPrice: hourlyRate });
  const items = [
    line("요구사항 정리 · 화면 설계", planningHours),
    ...features.map((feature) => line(feature.title, feature.hours)),
    line("QA · 배포 · 인수인계", qaHours),
  ];

  const summary =
    matched.length > 0
      ? `요청서에서 ${matched.length}개 기능 키워드를 찾아 기본 시간으로 채웠어요. 범위에 맞게 시간을 조정하세요.`
      : "요청서에서 알려진 기능 키워드를 찾지 못해 기본 구성으로 채웠어요. 기능별로 줄을 나눠 주세요.";
  return { items, summary };
}
