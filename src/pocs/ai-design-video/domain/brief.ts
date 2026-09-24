import { z } from "zod";
import { ORDER_TYPE_INFO, type OrderType } from "./catalog";
import { josa } from "./josa";

/**
 * The creative brief attached to an order: three concept directions, copy lines,
 * and a storyboard (timed shot list for video, layout frames for design work).
 */

export const briefConceptSchema = z.object({
  title: z.string().describe("콘셉트 이름, 12자 이내"),
  description: z.string().describe("구성·톤·핵심 장면을 2문장 이내로"),
  keywords: z.array(z.string()).describe("무드 키워드 3개"),
  palette: z.array(z.string()).describe("#RRGGBB 형식 색상 3개"),
});

export const storyboardCutSchema = z.object({
  label: z.string().describe("컷/섹션 이름, 예: 후킹, 섹션 2 문제 제기, 시안 A"),
  shot: z.string().describe("샷 크기나 레이아웃, 예: C.U., B.S., F.S., 인서트, 좌우 분할"),
  visual: z.string().describe("화면에 보이는 것"),
  caption: z.string().describe("자막·카피·대사"),
  seconds: z.number().int().nullable().describe("영상이면 컷 길이(초), 디자인이면 null"),
});

export const briefContentSchema = z.object({
  concepts: z.array(briefConceptSchema),
  copyLines: z.array(z.string()),
  storyboard: z.array(storyboardCutSchema),
});

export type BriefConcept = z.infer<typeof briefConceptSchema>;
export type StoryboardCut = z.infer<typeof storyboardCutSchema>;
export type BriefContent = z.infer<typeof briefContentSchema>;

export interface BriefInput {
  type: OrderType;
  title: string;
  clientName: string;
  brief: string;
  quantity: number;
}

const HEX = /^#[0-9a-f]{6}$/i;
const FALLBACK_PALETTE = ["#1f2328", "#f4f5f6", "#d6453d"];

/** Keeps model output inside what the UI can lay out. */
export function normalizeBrief(content: BriefContent): BriefContent {
  return {
    concepts: content.concepts.slice(0, 3).map((concept) => {
      const palette = concept.palette.filter((c) => HEX.test(c.trim())).map((c) => c.trim().toLowerCase());
      return {
        title: concept.title.trim(),
        description: concept.description.trim(),
        keywords: concept.keywords
          .map((k) => k.trim())
          .filter(Boolean)
          .slice(0, 4),
        palette: palette.length >= 2 ? palette.slice(0, 3) : FALLBACK_PALETTE,
      };
    }),
    copyLines: content.copyLines
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6),
    storyboard: content.storyboard.slice(0, 10).map((cut) => ({
      ...cut,
      seconds: cut.seconds !== null && cut.seconds > 0 ? Math.round(cut.seconds) : null,
    })),
  };
}

export function storyboardDuration(cuts: readonly StoryboardCut[]): number | null {
  const timed = cuts.filter((c) => c.seconds !== null);
  if (timed.length === 0) return null;
  return timed.reduce((acc, c) => acc + (c.seconds ?? 0), 0);
}

/** Where each cut starts on the timeline, in seconds (untimed cuts take no time). */
export function cutStarts(cuts: readonly StoryboardCut[]): number[] {
  return cuts.reduce<number[]>(
    (starts, cut, i) => [...starts, i === 0 ? 0 : starts[i - 1] + (cuts[i - 1].seconds ?? 0)],
    [],
  );
}

/** "0:30", "12:05" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Template fallback ────────────────────────────────────────────────────────

const TYPE_WORDS =
  /(썸네일|배너|상세페이지|상세 페이지|숏폼|릴스|쇼츠|영상|편집|로고|브랜딩|패키지|디자인|제작|세트|\d+\s*(종|편|장|컷))/g;
const STOP_WORDS = new Set([
  "그리고",
  "느낌",
  "느낌으로",
  "원해요",
  "부탁드려요",
  "주세요",
  "있는",
  "하는",
  "같은",
  "위한",
  "해서",
  "으로",
  "에서",
]);

/** The work's subject, with format words removed: "여름 신메뉴 수박주스 릴스 3편" → "여름 신메뉴 수박주스". */
export function subjectOf(title: string): string {
  const cleaned = title.replace(TYPE_WORDS, " ").replace(/\s+/g, " ").trim();
  return cleaned || title.trim();
}

/** Up to `limit` distinctive words from the brief, in order of appearance. */
export function keywordsOf(text: string, limit = 4): string[] {
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  return [...new Set(words)].slice(0, limit);
}

interface ConceptSeed {
  title: string;
  description: (subject: string) => string;
  keywords: string[];
  palette: string[];
}

const CONCEPTS: Record<OrderType, ConceptSeed[]> = {
  thumbnail: [
    {
      title: "한 줄 대비형",
      description: (s) =>
        `${s}의 핵심을 8자 안팎 한 줄로 크게 쓰고, 인물이나 제품은 반대편에 꽉 차게 클로즈업해요. 목록 화면에서 작게 보여도 읽히는 굵은 외곽선 글자가 기준이에요.`,
      keywords: ["고대비", "클로즈업", "굵은 외곽선"],
      palette: ["#ffd43b", "#111418", "#ffffff"],
    },
    {
      title: "숫자 후킹형",
      description: (s) =>
        `${s}에서 가장 궁금한 숫자(기간, 가격, 순위)를 화면 절반 크기로 올려 클릭 이유를 만들어요. 배경은 단색으로 비워 숫자만 남겨요.`,
      keywords: ["숫자 강조", "단색 배경", "호기심"],
      palette: ["#e03131", "#fff9db", "#1c1c1c"],
    },
    {
      title: "비포·애프터 분할",
      description: (s) =>
        `화면을 좌우로 나눠 ${s} 전과 후를 나란히 보여줘요. 가운데 화살표 하나로 변화를 설명하고, 글자는 한 단어만 둬요.`,
      keywords: ["좌우 분할", "변화", "화살표"],
      palette: ["#495057", "#20c997", "#f8f9fa"],
    },
  ],
  banner: [
    {
      title: "혜택 먼저",
      description: (s) =>
        `${s}의 혜택(할인율, 사은품, 기간)을 왼쪽 2/3에 크게 두고 오른쪽에 제품 단독 컷을 배치해요. 버튼 모양 요소로 클릭 위치를 분명히 해요.`,
      keywords: ["혜택 강조", "제품 단독 컷", "명확한 버튼"],
      palette: ["#1971c2", "#ffffff", "#ffd43b"],
    },
    {
      title: "시즌 무드",
      description: (s) => `계절감이 드러나는 배경 색과 소품으로 ${s}의 분위기를 먼저 전하고, 문구는 짧게 한 줄만 둬요.`,
      keywords: ["계절감", "소품 연출", "짧은 문구"],
      palette: ["#2b8a3e", "#fff4e6", "#e8590c"],
    },
    {
      title: "타이포 중심",
      description: (s) =>
        `사진 없이 ${s} 문구만으로 구성해요. 굵은 고딕과 단색 배경으로 로딩이 빠르고 어떤 지면에도 잘 맞아요.`,
      keywords: ["타이포그래피", "단색", "가벼운 용량"],
      palette: ["#212529", "#f1f3f5", "#fa5252"],
    },
  ],
  detail_page: [
    {
      title: "문제-해결 스토리",
      description: (s) =>
        `첫 화면에서 고객의 불편을 한 문장으로 짚고, 스크롤을 내릴수록 ${josa(s, "이/가")} 그 문제를 푸는 과정을 보여줘요.`,
      keywords: ["공감", "스토리텔링", "스크롤 흐름"],
      palette: ["#0b7285", "#f8f9fa", "#fab005"],
    },
    {
      title: "스펙 비교형",
      description: (s) =>
        `${s}의 핵심 사양을 표와 아이콘으로 정리하고, 비슷한 제품과의 차이를 한눈에 비교해요. 꼼꼼히 따지는 구매자에게 맞아요.`,
      keywords: ["비교표", "사양 정리", "신뢰"],
      palette: ["#343a40", "#e9ecef", "#1c7ed6"],
    },
    {
      title: "라이프스타일 컷",
      description: (s) =>
        `${josa(s, "을/를")} 실제로 쓰는 장면 사진을 크게 쓰고 글은 최소화해요. 감성 구매가 많은 카테고리에 어울려요.`,
      keywords: ["사용 장면", "감성", "큰 사진"],
      palette: ["#a9746e", "#fdf6ec", "#3d3d3d"],
    },
  ],
  short_form: [
    {
      title: "3초 후킹",
      description: (s) =>
        `첫 3초 안에 ${s}의 가장 강한 장면과 질문형 자막을 보여주고, 나머지는 빠른 컷 전환으로 끝까지 보게 만들어요.`,
      keywords: ["첫 3초", "질문형 자막", "빠른 전환"],
      palette: ["#f03e3e", "#111111", "#ffffff"],
    },
    {
      title: "과정 ASMR",
      description: (s) =>
        `${josa(s, "이/가")} 만들어지는 과정을 가까이서 소리와 함께 담아요. 자막은 줄이고 소리와 손동작으로 몰입시켜요.`,
      keywords: ["과정 공개", "현장음", "클로즈업"],
      palette: ["#5c3d2e", "#f5ebe0", "#e9c46a"],
    },
    {
      title: "상황극 POV",
      description: (s) =>
        `"이럴 때 있죠?" 같은 1인칭 상황으로 시작해 ${josa(s, "이/가")} 해결책으로 등장하는 짧은 이야기로 구성해요.`,
      keywords: ["1인칭 시점", "공감 상황", "반전"],
      palette: ["#7048e8", "#f3f0ff", "#212529"],
    },
  ],
  video_edit: [
    {
      title: "하이라이트 오프닝",
      description: (s) =>
        `본편에서 가장 재미있는 10초를 맨 앞에 붙이고 ${s} 본론으로 들어가요. 이탈이 많은 초반을 버티게 해줘요.`,
      keywords: ["콜드 오픈", "하이라이트", "이탈 방지"],
      palette: ["#1c1c1c", "#ffe066", "#ffffff"],
    },
    {
      title: "챕터형 정보 편집",
      description: (s) =>
        `${s} 내용을 3~4개 챕터로 나누고 챕터마다 제목 카드와 요약 자막을 넣어요. 정보성 채널에 맞아요.`,
      keywords: ["챕터 카드", "요약 자막", "정보 전달"],
      palette: ["#1864ab", "#e7f5ff", "#343a40"],
    },
    {
      title: "브이로그 무드",
      description: (s) =>
        `자연스러운 컷과 배경음악 위주로 ${s}의 분위기를 살리고, 자막은 말하는 톤 그대로 짧게 달아요.`,
      keywords: ["자연스러운 컷", "배경음악", "말투 자막"],
      palette: ["#8f6f5a", "#fff8f0", "#51cf66"],
    },
  ],
  logo: [
    {
      title: "워드마크",
      description: (s) =>
        `${s} 이름 글자 자체를 다듬어 로고로 만들어요. 간판, 스티커, 프로필 어디서든 읽히는 것이 기준이에요.`,
      keywords: ["레터링", "가독성", "단색 활용"],
      palette: ["#212529", "#f8f9fa", "#e8590c"],
    },
    {
      title: "심볼 + 이름",
      description: (s) =>
        `${josa(s, "을/를")} 상징하는 단순한 도형 하나와 이름을 조합해요. 심볼만 따로 써도 알아볼 수 있게 만들어요.`,
      keywords: ["심볼", "조합형", "확장성"],
      palette: ["#0ca678", "#ffffff", "#212529"],
    },
    {
      title: "엠블럼",
      description: (s) =>
        `원형이나 방패형 틀 안에 ${s} 이름과 설립 연도 등을 담아 전통 있는 인상을 줘요. 굿즈와 패키지에 잘 어울려요.`,
      keywords: ["배지형", "클래식", "굿즈"],
      palette: ["#862e9c", "#fff0f6", "#343a40"],
    },
  ],
  bundle: [
    {
      title: "하나의 키 비주얼",
      description: (s) =>
        `${s}의 대표 이미지 하나를 정하고 썸네일, 영상, 상세페이지에 같은 색과 글꼴로 반복해 한 캠페인처럼 보이게 해요.`,
      keywords: ["통일감", "키 비주얼", "캠페인"],
      palette: ["#e64980", "#fff0f6", "#212529"],
    },
    {
      title: "채널별 최적화",
      description: (s) =>
        `같은 ${s} 메시지를 채널마다 다르게 풀어요. 썸네일은 한 줄, 숏폼은 3초 후킹, 상세페이지는 스토리로 구성해요.`,
      keywords: ["채널별 구성", "메시지 일관성", "포맷 맞춤"],
      palette: ["#1098ad", "#e3fafc", "#343a40"],
    },
    {
      title: "런칭 카운트다운",
      description: (s) => `${s} 공개일까지 D-7, D-3, D-DAY 순서로 콘텐츠를 나눠 기대감을 쌓는 구성이에요.`,
      keywords: ["순차 공개", "기대감", "날짜 강조"],
      palette: ["#f76707", "#fff4e6", "#1c1c1c"],
    },
  ],
};

function copyLines(type: OrderType, subject: string, keywords: string[]): string[] {
  const k = keywords[0] ?? subject;
  const short = subject.length > 12 ? subject.slice(0, 12).trim() : subject;
  switch (type) {
    case "thumbnail":
      return [
        `${short}, 이거 하나면 끝`,
        `아무도 몰랐던 ${k}`,
        `3분 만에 정리하는 ${short}`,
        `${k} 전후 비교`,
        `이건 진짜 사세요`,
      ];
    case "banner":
      return [
        `${subject} 지금 만나보세요`,
        `이번 주만 ${k} 특가`,
        `${short} 신규 오픈`,
        `첫 구매 혜택 받기`,
        `오늘 주문하면 내일 도착`,
      ];
    case "detail_page":
      return [
        `${subject}, 왜 다들 이것만 찾을까요?`,
        `매일 쓰는 거라 ${k}부터 달라야 하니까`,
        `한 번 써보면 다시 돌아갈 수 없어요`,
        `꼼꼼하게 비교해 보세요`,
        `지금 주문하면 가장 빨리 받아요`,
      ];
    case "short_form":
      return [
        `${short} 이렇게 만들어요`,
        `이거 모르면 손해예요`,
        `끝까지 보면 ${k} 나와요`,
        `저장해두고 따라 해보세요`,
        `프로필 링크에서 바로 주문`,
      ];
    case "video_edit":
      return [
        `오늘은 ${subject} 이야기`,
        `결론부터 말하면`,
        `여기서부터가 진짜예요`,
        `구독과 좋아요는 큰 힘이 돼요`,
        `다음 영상에서 ${k} 더 자세히`,
      ];
    case "logo":
      return [
        `${subject}`,
        `${subject} · since ${new Date().getFullYear()}`,
        `${josa(k, "을/를")} 담은 한 글자`,
        `작게 써도 알아보는 로고`,
        `간판부터 스티커까지 한 가지로`,
      ];
    case "bundle":
      return [
        `${subject} 드디어 공개`,
        `D-7, 곧 만나요`,
        `${k} 하나로 달라지는 하루`,
        `런칭 기념 혜택 확인하기`,
        `지금 바로 만나보세요`,
      ];
  }
}

function storyboard(type: OrderType, subject: string, copies: string[], quantity: number): StoryboardCut[] {
  switch (type) {
    case "short_form":
      return [
        {
          label: "후킹",
          shot: "C.U.",
          visual: `${subject}의 가장 강렬한 장면을 첫 프레임에`,
          caption: copies[1],
          seconds: 3,
        },
        {
          label: "상황",
          shot: "B.S.",
          visual: "고객이 겪는 상황이나 궁금증을 한 장면으로",
          caption: "이럴 때 있죠?",
          seconds: 4,
        },
        {
          label: "과정",
          shot: "인서트 ×3",
          visual: "손동작·제품 디테일 컷을 1초씩 빠르게",
          caption: copies[0],
          seconds: 6,
        },
        {
          label: "결과",
          shot: "F.S.",
          visual: `완성된 ${josa(subject, "을/를")} 한 화면에 전부`,
          caption: copies[2],
          seconds: 5,
        },
        { label: "행동 유도", shot: "로고 카드", visual: "로고와 주문·방문 방법", caption: copies[4], seconds: 4 },
      ];
    case "video_edit":
      return [
        {
          label: "콜드 오픈",
          shot: "하이라이트",
          visual: "본편에서 가장 반응이 클 10초",
          caption: copies[1],
          seconds: 10,
        },
        { label: "인트로", shot: "타이틀 카드", visual: "채널 로고와 영상 제목", caption: copies[0], seconds: 5 },
        {
          label: "챕터 1",
          shot: "B.S.",
          visual: "주제 소개와 배경 설명",
          caption: "챕터 제목 카드 삽입",
          seconds: 120,
        },
        {
          label: "챕터 2",
          shot: "인서트 교차",
          visual: "본론 내용과 참고 화면 교차 편집",
          caption: copies[2],
          seconds: 180,
        },
        { label: "챕터 3", shot: "B.S.", visual: "정리와 개인 의견", caption: "핵심 요약 자막", seconds: 90 },
        { label: "아웃트로", shot: "엔딩 카드", visual: "다음 영상 추천과 구독 버튼", caption: copies[3], seconds: 15 },
      ];
    case "detail_page":
      return [
        {
          label: "섹션 1 첫 화면",
          shot: "풀 이미지",
          visual: `${subject} 대표 컷과 한 줄 헤드라인`,
          caption: copies[0],
          seconds: null,
        },
        {
          label: "섹션 2 공감",
          shot: "텍스트 + 아이콘",
          visual: "고객이 겪는 불편 3가지",
          caption: copies[1],
          seconds: null,
        },
        {
          label: "섹션 3 해결",
          shot: "제품 클로즈업",
          visual: "문제를 푸는 핵심 포인트",
          caption: copies[2],
          seconds: null,
        },
        {
          label: "섹션 4 특징",
          shot: "3단 그리드",
          visual: "특징 3가지를 사진과 짧은 설명으로",
          caption: "특징별 한 줄 설명",
          seconds: null,
        },
        {
          label: "섹션 5 구성·사용법",
          shot: "단계 이미지",
          visual: "구성품과 사용 순서",
          caption: "순서대로 따라 하기",
          seconds: null,
        },
        {
          label: "섹션 6 신뢰",
          shot: "인증·후기 자리",
          visual: "실제 인증서, 실제 구매 후기 캡처를 받아 배치",
          caption: copies[3],
          seconds: null,
        },
        {
          label: "섹션 7 구매 안내",
          shot: "정보 표",
          visual: "배송·교환 안내와 구매 버튼",
          caption: copies[4],
          seconds: null,
        },
      ];
    case "thumbnail": {
      const count = Math.min(Math.max(quantity, 3), 5);
      const layouts = ["좌 글자 · 우 인물", "숫자 전면", "좌우 분할", "중앙 제품 + 테두리 글자", "상하 분할"];
      return Array.from({ length: count }, (_, i) => ({
        label: `시안 ${String.fromCharCode(65 + i)}`,
        shot: layouts[i],
        visual: `${subject} — ${layouts[i]} 구도`,
        caption: copies[i % copies.length],
        seconds: null,
      }));
    }
    case "banner":
      return [
        {
          label: "시안 A",
          shot: "좌 문구 · 우 제품",
          visual: "혜택 문구 2줄과 제품 단독 컷",
          caption: copies[1],
          seconds: null,
        },
        {
          label: "시안 B",
          shot: "배경 사진 + 중앙 문구",
          visual: "분위기 사진 위 한 줄 문구",
          caption: copies[0],
          seconds: null,
        },
        {
          label: "모바일 변형",
          shot: "1:1 재배치",
          visual: "같은 요소를 정사각형에 맞춰 재배치",
          caption: copies[3],
          seconds: null,
        },
      ];
    case "logo":
      return [
        { label: "시안 1", shot: "워드마크", visual: `${subject} 글자 레터링`, caption: copies[0], seconds: null },
        {
          label: "시안 2",
          shot: "심볼 + 이름",
          visual: "단순 도형 심볼과 이름 조합",
          caption: copies[1],
          seconds: null,
        },
        { label: "시안 3", shot: "엠블럼", visual: "원형 틀 안에 이름과 연도", caption: copies[1], seconds: null },
        {
          label: "적용 예시",
          shot: "명함 · 간판",
          visual: "명함 앞뒷면과 간판에 적용",
          caption: copies[4],
          seconds: null,
        },
      ];
    case "bundle":
      return [
        {
          label: "키 비주얼",
          shot: "메인 컷",
          visual: `${subject} 대표 이미지와 색·글꼴 규칙`,
          caption: copies[0],
          seconds: null,
        },
        {
          label: "썸네일 세트",
          shot: "16:9 ×5",
          visual: "키 비주얼을 변주한 썸네일 5종",
          caption: copies[1],
          seconds: null,
        },
        {
          label: "홍보 영상",
          shot: "30초 편집",
          visual: "후킹 3초 → 제품 → 혜택 → 로고",
          caption: copies[2],
          seconds: 30,
        },
        {
          label: "상세페이지",
          shot: "7개 섹션",
          visual: "첫 화면부터 구매 안내까지",
          caption: copies[3],
          seconds: null,
        },
      ];
  }
}

/**
 * Deterministic Korean brief used without an API key (or when the AI call fails):
 * built from the order's type, subject and brief keywords.
 */
export function templateBrief(input: BriefInput): BriefContent {
  const subject = subjectOf(input.title);
  const keywords = keywordsOf(`${input.brief} ${subject}`);
  const copies = copyLines(input.type, subject, keywords);
  const concepts = CONCEPTS[input.type].map((seed) => ({
    title: seed.title,
    description: seed.description(subject),
    keywords: [...seed.keywords],
    palette: [...seed.palette],
  }));
  return {
    concepts,
    copyLines: copies,
    storyboard: storyboard(input.type, subject, copies, input.quantity),
  };
}

export function briefPrompt(input: BriefInput): string {
  const info = ORDER_TYPE_INFO[input.type];
  return [
    `작업 유형: ${info.label} (${info.frame.aspect}, ${info.frame.size})`,
    `작업명: ${input.title}`,
    `고객: ${input.clientName}`,
    `수량: ${input.quantity}`,
    `고객 요청 사항:\n${input.brief || "(별도 요청 없음)"}`,
    "",
    info.motion
      ? "storyboard에는 컷 4~7개를 순서대로, 컷마다 seconds(초)를 넣어 주세요."
      : "storyboard에는 시안이나 섹션 3~7개를 넣고 seconds는 null로 두세요.",
  ].join("\n");
}

export const BRIEF_SYSTEM_PROMPT = [
  "당신은 1인 AI 디자인·영상 제작 스튜디오 '크리에이트잇'의 크리에이티브 디렉터입니다.",
  "고객 주문을 바탕으로 제작 전에 쓸 브리프를 만듭니다.",
  "concepts: 서로 확실히 다른 콘셉트 방향 3개. 각 방향에 무드 키워드 3개와 #RRGGBB 색상 3개.",
  "copyLines: 실제 화면에 올릴 수 있는 한국어 카피 5개. 썸네일은 14자 이내.",
  "storyboard: 제작 순서대로 된 콘티.",
  "과장 광고, 확인되지 않은 수치, 가짜 후기는 쓰지 않습니다. 모든 문장은 한국어 해요체입니다.",
].join("\n");
