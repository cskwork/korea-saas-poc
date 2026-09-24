import { templateBrief } from "../domain/brief";
import { addDays, daysInMonth, lastMonths } from "../domain/calendar";
import type { OrderStatus, OrderType, PlanKind } from "../domain/catalog";
import { orderCodePrefix } from "../domain/order-code";
import { quotePrice } from "../domain/pricing";
import { DEFAULT_MONTHLY_GOAL } from "../domain/revenue";
import { toolsForType } from "../domain/tools";
import type { briefs, orderEvents, orders, packages, portfolioItems, revisions } from "./schema";

/**
 * Sample studio data, positioned relative to "today" (Asia/Seoul) so the
 * dashboards look alive on any date. Every client and piece here is fictional.
 */

type NewPackage = typeof packages.$inferInsert;
type NewOrder = typeof orders.$inferInsert;
type NewEvent = typeof orderEvents.$inferInsert;
type NewRevision = typeof revisions.$inferInsert;
type NewBrief = typeof briefs.$inferInsert;
type NewPortfolio = typeof portfolioItems.$inferInsert;

export interface SeedRows {
  packages: NewPackage[];
  orders: NewOrder[];
  events: NewEvent[];
  revisions: NewRevision[];
  briefs: NewBrief[];
  portfolio: NewPortfolio[];
  monthlyGoal: number;
}

/** A Seoul wall-clock time on a calendar day, as an instant. */
export function seoulInstant(day: string, hour = 10, minute = 0): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour - 9, minute));
}

/** Small deterministic PRNG so every workspace gets the same sample studio. */
function random(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
  };
}

interface PackageSeed {
  key: string;
  kind: PlanKind;
  orderType: OrderType | null;
  name: string;
  price: number;
  unit: string;
  summary: string;
  includes: string[];
  revisionLimit: number | null;
  turnaroundDays: number;
  featured?: boolean;
}

const PACKAGE_SEEDS: PackageSeed[] = [
  {
    key: "thumbnail",
    kind: "single",
    orderType: "thumbnail",
    name: "SNS·유튜브 썸네일",
    price: 50_000,
    unit: "장",
    summary: "유튜브, 인스타그램, 블로그 대표 이미지",
    includes: ["1280×720 고해상도 PNG", "시안 1종", "수정 2회 포함", "24시간 안에 납품"],
    revisionLimit: 2,
    turnaroundDays: 1,
  },
  {
    key: "banner",
    kind: "single",
    orderType: "banner",
    name: "배너",
    price: 80_000,
    unit: "종",
    summary: "스마트스토어·쿠팡 기획전, 이벤트 배너",
    includes: ["PC·모바일 규격 각 1종", "문구 정리", "수정 2회 포함", "2일 안에 납품"],
    revisionLimit: 2,
    turnaroundDays: 2,
  },
  {
    key: "detail_page",
    kind: "single",
    orderType: "detail_page",
    name: "쇼핑몰 상세페이지",
    price: 200_000,
    unit: "페이지",
    summary: "스마트스토어, 쿠팡 상세페이지 디자인",
    includes: ["모바일 최적화 860px", "제품 사진 보정", "카피라이팅", "수정 3회 포함", "3일 안에 납품"],
    revisionLimit: 3,
    turnaroundDays: 3,
  },
  {
    key: "short_form",
    kind: "single",
    orderType: "short_form",
    name: "숏폼·릴스",
    price: 150_000,
    unit: "편",
    summary: "릴스·쇼츠·틱톡용 15~60초 세로 영상",
    includes: ["9:16 1080×1920", "자막·효과음", "배경음악", "수정 2회 포함", "3일 안에 납품"],
    revisionLimit: 2,
    turnaroundDays: 3,
  },
  {
    key: "video_edit",
    kind: "single",
    orderType: "video_edit",
    name: "유튜브 영상 편집",
    price: 300_000,
    unit: "편",
    summary: "최대 15분 영상, 인트로·아웃트로·자막 포함",
    includes: ["최대 15분", "자막 삽입", "인트로·아웃트로", "배경음악", "수정 3회 포함", "3~5일 안에 납품"],
    revisionLimit: 3,
    turnaroundDays: 5,
    featured: true,
  },
  {
    key: "logo",
    kind: "single",
    orderType: "logo",
    name: "로고 & 브랜딩",
    price: 500_000,
    unit: "건",
    summary: "로고와 기본 BI 가이드",
    includes: ["로고 시안 3종", "컬러 팔레트", "명함 디자인", "수정 5회 포함", "원본 파일 제공", "5~7일 안에 납품"],
    revisionLimit: 5,
    turnaroundDays: 7,
  },
  {
    key: "bundle",
    kind: "single",
    orderType: "bundle",
    name: "종합 패키지",
    price: 800_000,
    unit: "세트",
    summary: "썸네일 + 영상 + 상세페이지를 한 번에",
    includes: ["썸네일 5종", "영상 편집 1편", "상세페이지 1종", "수정 5회 포함", "7일 안에 납품"],
    revisionLimit: 5,
    turnaroundDays: 7,
  },
  {
    key: "starter",
    kind: "subscription",
    orderType: null,
    name: "스타터",
    price: 290_000,
    unit: "월",
    summary: "꾸준히 올리는 소상공인·크리에이터용",
    includes: ["썸네일 10장", "간단 수정 무제한", "24시간 안에 답변", "기본 디자인 소스"],
    revisionLimit: null,
    turnaroundDays: 2,
  },
  {
    key: "pro",
    kind: "subscription",
    orderType: null,
    name: "프로",
    price: 590_000,
    unit: "월",
    summary: "영상까지 매달 필요한 브랜드용",
    includes: ["썸네일 20장", "영상 편집 2편", "상세페이지 2종", "수정 무제한", "12시간 안에 답변"],
    revisionLimit: null,
    turnaroundDays: 3,
    featured: true,
  },
  {
    key: "enterprise",
    kind: "subscription",
    orderType: null,
    name: "엔터프라이즈",
    price: 1_200_000,
    unit: "월",
    summary: "콘텐츠 양이 많은 팀·기업용",
    includes: ["디자인 무제한", "영상 편집 5편", "상세페이지 무제한", "수정 무제한", "4시간 안에 답변", "주간 미팅"],
    revisionLimit: null,
    turnaroundDays: 3,
  },
];

interface Client {
  name: string;
  contact: string;
}

const CLIENTS: Client[] = [
  { name: "귤담카페", contact: "gyuldam@example.com" },
  { name: "숲속꿀벌", contact: "bee-forest@example.com" },
  { name: "하루한끼TV", contact: "harumeal@example.com" },
  { name: "모먼트필라테스", contact: "moment.pilates@example.com" },
  { name: "어반플랜트", contact: "urbanplant@example.com" },
  { name: "코딩하는곰", contact: "codingbear@example.com" },
  { name: "오렌지랩", contact: "hello@orangelab.example" },
  { name: "소소공방", contact: "soso.craft@example.com" },
  { name: "스테이온 펜션", contact: "stayon@example.com" },
  { name: "핏앤런", contact: "fitnrun@example.com" },
  { name: "누리키즈", contact: "nurikids@example.com" },
  { name: "달빛베이커리", contact: "moonbakery@example.com" },
  { name: "청년농부 한결", contact: "hangyeol.farm@example.com" },
  { name: "윤스헤어", contact: "yuns.hair@example.com" },
  { name: "마켓오늘", contact: "market.today@example.com" },
];

const HISTORY_TITLES: Record<OrderType, string[]> = {
  thumbnail: ["유튜브 썸네일", "인스타 피드 썸네일", "블로그 대표 이미지"],
  banner: ["스마트스토어 메인 배너", "이벤트 배너", "쿠팡 기획전 배너"],
  detail_page: ["신제품 상세페이지", "리뉴얼 상세페이지", "선물세트 상세페이지"],
  short_form: ["매장 소개 릴스", "신메뉴 숏폼", "제품 언박싱 쇼츠"],
  video_edit: ["브이로그 편집", "인터뷰 영상 편집", "리뷰 영상 편집"],
  logo: ["로고 & 명함", "BI 리뉴얼", "간판용 로고"],
  bundle: ["오픈 런칭 패키지", "시즌 캠페인 세트"],
};

const REVISION_NOTES = [
  "제목 글자를 조금 더 크게 키워 주세요.",
  "배경색을 브랜드 컬러(진한 초록)로 바꿔 주세요.",
  "제품 사진을 두 번째 컷으로 교체해 주세요.",
  "자막 오타 두 군데 수정 부탁드려요.",
  "배경음악을 더 밝은 곡으로 바꿔 주세요.",
  "로고 위치를 오른쪽 위로 옮겨 주세요.",
  "첫 3초를 더 짧게 잘라 주세요.",
  "가격 문구는 빼 주세요.",
];

/** Weighted mix of what a small studio actually sells most. */
const TYPE_MIX: OrderType[] = [
  "thumbnail",
  "thumbnail",
  "thumbnail",
  "short_form",
  "short_form",
  "detail_page",
  "detail_page",
  "video_edit",
  "video_edit",
  "banner",
  "logo",
  "bundle",
];

interface OpenOrderSeed {
  client: number;
  type: OrderType;
  packageKey: string;
  title: string;
  brief: string;
  referenceLinks?: string[];
  quantity: number;
  rush?: boolean;
  status: OrderStatus;
  /** Days from today; negative is overdue. */
  due: number;
  /** Days before today the order came in. */
  receivedAgo: number;
  revisionNotes?: string[];
  withBrief?: boolean;
}

const OPEN_ORDERS: OpenOrderSeed[] = [
  {
    client: 7,
    type: "short_form",
    packageKey: "short_form",
    title: "도자기 물레 과정 숏폼",
    brief: "물레 돌리는 손을 가까이서 보여주는 ASMR 느낌. 원데이 클래스 예약으로 이어지게 마지막에 안내 넣어 주세요.",
    quantity: 1,
    status: "revision",
    due: -1,
    receivedAgo: 6,
    revisionNotes: [
      "첫 장면을 완성된 그릇으로 바꿔 주세요.",
      "배경음악을 잔잔한 피아노로 바꿔 주세요.",
      "마지막 예약 안내 자막을 더 크게 해 주세요.",
    ],
  },
  {
    client: 3,
    type: "thumbnail",
    packageKey: "thumbnail",
    title: "회원 모집 인스타 썸네일 5종",
    brief: "10월 신규 회원 모집. 밝고 깨끗한 톤, 강사 사진 활용, '첫 달 체험' 문구가 잘 보이게.",
    quantity: 5,
    status: "drafting",
    due: 0,
    receivedAgo: 2,
  },
  {
    client: 1,
    type: "detail_page",
    packageKey: "detail_page",
    title: "아카시아 꿀 선물세트 상세페이지",
    brief: "추석 선물용. 고급스럽지만 너무 무겁지 않게. 양봉장 사진 다수 있음. 원산지와 용량 정보 표 꼭 넣어 주세요.",
    referenceLinks: ["https://example.com/ref/honey-gift", "경쟁사 상세페이지 캡처 3장 (메일 첨부)"],
    quantity: 1,
    status: "revision",
    due: 1,
    receivedAgo: 5,
    revisionNotes: ["첫 화면 사진을 더 밝게, 선물 포장 컷을 추가해 주세요."],
    withBrief: true,
  },
  {
    client: 9,
    type: "short_form",
    packageKey: "short_form",
    title: "10분 홈트 루틴 쇼츠",
    brief: "촬영본 있음(세로 4분). 내일 오전 업로드 예정이라 급해요. 동작 이름 자막, 카운트 효과음.",
    quantity: 1,
    rush: true,
    status: "received",
    due: 1,
    receivedAgo: 0,
  },
  {
    client: 0,
    type: "short_form",
    packageKey: "short_form",
    title: "가을 신메뉴 귤라떼 릴스 3편",
    brief: "제주 감귤로 만든 가을 한정 라떼. 따뜻하고 청량한 느낌, 20~30대 여성 타깃, 매장 방문 유도.",
    referenceLinks: ["https://example.com/ref/cafe-reels"],
    quantity: 3,
    status: "drafting",
    due: 2,
    receivedAgo: 3,
    withBrief: true,
  },
  {
    client: 4,
    type: "banner",
    packageKey: "banner",
    title: "스마트스토어 가을 기획전 배너",
    brief: "몬스테라, 올리브나무 등 대형 식물 할인전. PC 메인 배너와 모바일 배너 각 1종.",
    quantity: 2,
    status: "received",
    due: 3,
    receivedAgo: 1,
  },
  {
    client: 10,
    type: "banner",
    packageKey: "banner",
    title: "유아 놀이매트 쿠팡 배너 2종",
    brief: "안전 인증 받은 제품이라 인증 마크가 보이게. 파스텔 톤.",
    quantity: 2,
    status: "drafting",
    due: 3,
    receivedAgo: 2,
  },
  {
    client: 2,
    type: "video_edit",
    packageKey: "video_edit",
    title: "부산 돼지국밥 투어 편집 (18분)",
    brief: "원본 42분. 국밥집 3곳 비교. 먹는 장면 리액션 살리고 가게 정보 자막으로.",
    quantity: 1,
    status: "received",
    due: 5,
    receivedAgo: 1,
  },
  {
    client: 6,
    type: "logo",
    packageKey: "logo",
    title: "AI 스타트업 로고 & 명함",
    brief: "회사명 '오렌지랩'. 미니멀하고 테크 느낌, 주황색은 꼭 들어가게. 명함 앞뒷면.",
    quantity: 1,
    status: "drafting",
    due: 6,
    receivedAgo: 8,
    revisionNotes: ["심볼을 조금 더 둥글게 다듬어 주세요.", "영문 표기를 추가한 버전도 보고 싶어요."],
  },
  {
    client: 8,
    type: "detail_page",
    packageKey: "detail_page",
    title: "독채 펜션 예약 상세페이지",
    brief: "숲속 독채 펜션. 객실·바비큐장·계곡 사진 위주, 예약 방법과 환불 규정을 명확하게.",
    quantity: 1,
    status: "received",
    due: 8,
    receivedAgo: 0,
  },
  {
    client: 11,
    type: "bundle",
    packageKey: "bundle",
    title: "추석 선물세트 런칭 패키지",
    brief: "명절 한정 쿠키 선물세트. 썸네일, 30초 홍보 영상, 상세페이지를 같은 무드로.",
    quantity: 1,
    status: "drafting",
    due: 10,
    receivedAgo: 4,
  },
];

const PORTFOLIO_SEEDS: Omit<NewPortfolio, "workspaceId">[] = [
  {
    title: "가을 신상 인스타그램 피드 9컷",
    category: "thumbnail",
    clientLabel: "여성 의류 쇼핑몰",
    headline: "가을, 레이어드의 계절",
    summary:
      "시즌 컬렉션 홍보용 피드 9컷. 코디 사진 위에 짧은 문구를 얹고 3×3 격자에서 한 장의 그림처럼 이어지게 구성했어요.",
    tools: ["Canva", "Midjourney"],
    palette: ["#8a4b2a", "#f2e6d8", "#2b2522"],
  },
  {
    title: "부동산 투자 채널 썸네일 10종",
    category: "thumbnail",
    clientLabel: "부동산 투자 유튜버",
    headline: "지금 사면 늦을까?",
    summary:
      "질문형 한 줄 카피와 인물 클로즈업을 반복한 시리즈 썸네일. 목록에서 채널이 한눈에 알아보이도록 색을 고정했어요.",
    tools: ["Canva", "Remove.bg", "ChatGPT"],
    palette: ["#ffd43b", "#15171a", "#ffffff"],
  },
  {
    title: "테크 리뷰 채널 인트로·아웃트로",
    category: "video_edit",
    clientLabel: "IT 리뷰 유튜버",
    headline: "언박싱 먼저 보고 갈게요",
    summary: "5초 인트로와 15초 엔딩 카드. 채널 로고가 움직이며 등장하고 다음 영상 추천 자리를 만들었어요.",
    tools: ["CapCut", "Canva"],
    palette: ["#1f6feb", "#0d1117", "#e6edf3"],
  },
  {
    title: "맛집 탐방 채널 엔딩 영상",
    category: "video_edit",
    clientLabel: "맛집 탐방 유튜버",
    headline: "다음 맛집은 어디?",
    summary: "매 편 끝에 붙는 엔딩 카드. 다음 편 예고 컷이 들어갈 자리를 두고 구독 안내를 자연스럽게 넣었어요.",
    tools: ["CapCut", "Suno"],
    palette: ["#e8590c", "#fff4e6", "#212529"],
  },
  {
    title: "건강식품 상세페이지 3종",
    category: "detail_page",
    clientLabel: "건강식품 스마트스토어",
    headline: "하루 한 포, 가볍게",
    summary: "제품 3종을 같은 틀로 만든 상세페이지. 섭취 방법과 원료 정보를 표로 정리해 모바일에서 읽기 쉽게 했어요.",
    tools: ["Canva", "ChatGPT", "Leonardo AI"],
    palette: ["#2f9e44", "#f4fce3", "#1b1b1b"],
  },
  {
    title: "비건 화장품 라인 상세페이지",
    category: "detail_page",
    clientLabel: "비건 화장품 브랜드",
    headline: "피부에 쉼표 하나",
    summary: "성분 이야기 중심의 긴 상세페이지. 제품 연출 컷은 AI로 배경을 만들고 실제 제품 사진을 합성했어요.",
    tools: ["Figma", "Midjourney", "Remove.bg"],
    palette: ["#b197fc", "#f8f0fc", "#343a40"],
  },
  {
    title: "소형 가전 언박싱 숏폼 5편",
    category: "short_form",
    clientLabel: "소형 가전 브랜드",
    headline: "3초 만에 세척 끝",
    summary: "첫 3초에 결과 장면을 먼저 보여주는 구성의 쇼츠 5편. 자동 자막을 다듬고 효과음으로 리듬을 만들었어요.",
    tools: ["CapCut", "ChatGPT"],
    palette: ["#12b886", "#e6fcf5", "#212529"],
  },
  {
    title: "동네 로스터리 카페 로고",
    category: "logo",
    clientLabel: "로스터리 카페",
    headline: "모카로스터리",
    summary:
      "원두 모양을 단순화한 심볼과 한글 워드마크. 컵 홀더, 스티커, 간판에 같은 로고를 쓸 수 있게 단색 버전도 만들었어요.",
    tools: ["Midjourney", "Figma"],
    palette: ["#5c3d2e", "#f5ebe0", "#c08457"],
  },
  {
    title: "AI 스타트업 CI 디자인",
    category: "logo",
    clientLabel: "AI 스타트업",
    headline: "라온랩",
    summary: "회사 이름의 첫 글자를 변형한 심볼과 워드마크, 명함과 발표 자료 표지까지 한 벌로 정리했어요.",
    tools: ["Midjourney", "Figma", "ChatGPT"],
    palette: ["#4263eb", "#edf2ff", "#141517"],
  },
  {
    title: "리빙 편집숍 가을 기획전 배너",
    category: "banner",
    clientLabel: "리빙 편집숍",
    headline: "가을 리빙, 천천히 바꾸기",
    summary: "PC와 모바일 규격을 한 번에 만든 기획전 배너. 제품 누끼와 따뜻한 배경색만으로 구성했어요.",
    tools: ["Canva", "Remove.bg"],
    palette: ["#d9480f", "#fff9f5", "#343a40"],
  },
  {
    title: "수제 쿠키 브랜드 런칭 세트",
    category: "bundle",
    clientLabel: "수제 쿠키 브랜드",
    headline: "오늘 구운 쿠키",
    summary: "썸네일 5종, 30초 홍보 영상, 상세페이지를 같은 색과 글꼴로 맞춘 런칭 세트예요.",
    tools: ["Canva", "CapCut", "ChatGPT"],
    palette: ["#f08c00", "#fff9db", "#3b2f2f"],
  },
];

export function buildSeedRows(workspaceId: string, today: string, now: Date = new Date()): SeedRows {
  const rng = random(20260924);
  /** Seoul wall-clock instant, never later than now (sample work cannot happen in the future). */
  const at = (day: string, hour = 10, minute = 0) => {
    const instant = seoulInstant(day, hour, minute);
    return instant > now ? now : instant;
  };
  const packageRows = PACKAGE_SEEDS.map((p, index) => ({
    id: crypto.randomUUID(),
    workspaceId,
    kind: p.kind,
    orderType: p.orderType,
    name: p.name,
    price: p.price,
    unit: p.unit,
    summary: p.summary,
    includes: p.includes,
    revisionLimit: p.revisionLimit,
    turnaroundDays: p.turnaroundDays,
    featured: p.featured ?? false,
    sortOrder: index,
  }));
  const packageByKey = new Map(PACKAGE_SEEDS.map((p, i) => [p.key, packageRows[i]]));

  const orderRows: NewOrder[] = [];
  const eventRows: NewEvent[] = [];
  const revisionRows: NewRevision[] = [];
  const briefRows: NewBrief[] = [];
  const codeCounters = new Map<string, number>();

  const nextCode = (day: string) => {
    const prefix = orderCodePrefix(day);
    const n = (codeCounters.get(prefix) ?? 0) + 1;
    codeCounters.set(prefix, n);
    return `${prefix}${String(n).padStart(3, "0")}`;
  };

  interface Timeline {
    receivedOn: string;
    /** Rounds of revision: [requested day, resolved day | null]. */
    rounds: { requestedOn: string; resolvedOn: string | null; note: string; extraFee: number }[];
    startedOn: string | null;
    deliveredOn: string | null;
  }

  const addOrder = (
    order: Omit<NewOrder, "id" | "workspaceId" | "code" | "createdAt" | "updatedAt" | "revisionsUsed" | "extraFees">,
    timeline: Timeline,
  ) => {
    const id = crypto.randomUUID();
    const extraFees = timeline.rounds.reduce((acc, r) => acc + r.extraFee, 0);
    const createdAt = at(timeline.receivedOn, rng.int(9, 17), rng.int(0, 59));
    const lastDay =
      timeline.deliveredOn ?? timeline.rounds.at(-1)?.requestedOn ?? timeline.startedOn ?? timeline.receivedOn;
    orderRows.push({
      ...order,
      id,
      workspaceId,
      code: nextCode(timeline.receivedOn),
      extraFees,
      revisionsUsed: timeline.rounds.length,
      deliveredAt: timeline.deliveredOn ? at(timeline.deliveredOn, 18, rng.int(0, 59)) : null,
      createdAt,
      updatedAt: at(lastDay, 18),
    });
    eventRows.push({ workspaceId, orderId: id, fromStatus: null, toStatus: "received", note: "주문 접수", createdAt });
    if (timeline.startedOn) {
      eventRows.push({
        workspaceId,
        orderId: id,
        fromStatus: "received",
        toStatus: "drafting",
        note: "",
        createdAt: at(timeline.startedOn, 11),
      });
    }
    timeline.rounds.forEach((round, index) => {
      revisionRows.push({
        workspaceId,
        orderId: id,
        round: index + 1,
        note: round.note,
        extraFee: round.extraFee,
        requestedAt: at(round.requestedOn, 15),
        resolvedAt: round.resolvedOn ? at(round.resolvedOn, 10) : null,
      });
      eventRows.push({
        workspaceId,
        orderId: id,
        fromStatus: "drafting",
        toStatus: "revision",
        note: `수정 ${index + 1}차: ${round.note}`,
        createdAt: at(round.requestedOn, 15),
      });
      if (round.resolvedOn) {
        eventRows.push({
          workspaceId,
          orderId: id,
          fromStatus: "revision",
          toStatus: "drafting",
          note: "",
          createdAt: at(round.resolvedOn, 10),
        });
      }
    });
    if (timeline.deliveredOn) {
      eventRows.push({
        workspaceId,
        orderId: id,
        fromStatus: "drafting",
        toStatus: "delivered",
        note: "최종 파일 전달",
        createdAt: at(timeline.deliveredOn, 18),
      });
    }
    return id;
  };

  // Delivered history: the last eleven months plus the current month so far.
  const currentMonth = today.slice(0, 7);
  const todayDay = Number(today.slice(8, 10));
  lastMonths(currentMonth, 12).forEach((month, index) => {
    const isCurrent = month === currentMonth;
    const count = isCurrent ? Math.max(3, Math.round((9 + index) * (todayDay / daysInMonth(month)))) : 7 + index;
    const lastDeliverable = isCurrent ? Math.max(todayDay - 1, 1) : daysInMonth(month);
    for (let i = 0; i < count; i++) {
      const type = rng.pick(TYPE_MIX);
      const pkg = packageByKey.get(type)!;
      const client = rng.pick(CLIENTS);
      const quantity =
        type === "thumbnail" ? rng.int(2, 6) : type === "banner" || type === "short_form" ? rng.int(1, 3) : 1;
      const rush = rng.next() < 0.08;
      const deliveredOn = `${month}-${String(rng.int(1, lastDeliverable)).padStart(2, "0")}`;
      const receivedOn = addDays(deliveredOn, -(pkg.turnaroundDays + rng.int(0, 3)));
      const limit = pkg.revisionLimit ?? 3;
      const roundCount = Math.min(rng.int(0, limit + 1), limit + 1);
      const rounds = Array.from({ length: roundCount }, (_, r) => {
        const requestedOn = addDays(receivedOn, 1 + r);
        return {
          requestedOn: requestedOn < deliveredOn ? requestedOn : deliveredOn,
          resolvedOn: requestedOn < deliveredOn ? requestedOn : deliveredOn,
          note: rng.pick(REVISION_NOTES),
          extraFee: pkg.revisionLimit !== null && r >= pkg.revisionLimit ? Math.round(pkg.price * 0.2) : 0,
        };
      });
      addOrder(
        {
          clientName: client.name,
          clientContact: client.contact,
          type,
          title: `${rng.pick(HISTORY_TITLES[type])}${quantity > 1 ? ` ${quantity}${type === "thumbnail" ? "장" : "종"}` : ""}`,
          brief: "",
          referenceLinks: [],
          packageId: pkg.id,
          packageName: pkg.name,
          plan: "single",
          quantity,
          rush,
          price: quotePrice({ unitPrice: pkg.price, quantity, rush }),
          revisionLimit: pkg.revisionLimit,
          status: "delivered",
          dueDate: addDays(receivedOn, pkg.turnaroundDays + 1),
          tools: toolsForType(type)
            .slice(0, rng.int(2, 3))
            .map((t) => t.name),
        },
        { receivedOn, startedOn: addDays(receivedOn, 0), rounds, deliveredOn },
      );
    }

    // Monthly subscriptions, delivered at month end (the current month is still open).
    const subscribers: [number, string][] =
      index >= 3
        ? [
            [5, "pro"],
            [13, "starter"],
          ]
        : [[13, "starter"]];
    if (index >= 8) subscribers.push([14, "enterprise"]);
    for (const [clientIndex, key] of subscribers) {
      const pkg = packageByKey.get(key)!;
      const client = CLIENTS[clientIndex];
      const type: OrderType = key === "starter" ? "thumbnail" : "bundle";
      const receivedOn = `${month}-01`;
      const monthEnd = `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
      addOrder(
        {
          clientName: client.name,
          clientContact: client.contact,
          type,
          title: `${Number(month.slice(5))}월 ${pkg.name} 구독 작업분`,
          brief: pkg.includes.slice(0, 3).join(", "),
          referenceLinks: [],
          packageId: pkg.id,
          packageName: pkg.name,
          plan: "subscription",
          quantity: 1,
          rush: false,
          price: pkg.price,
          revisionLimit: null,
          status: isCurrent ? "drafting" : "delivered",
          dueDate: monthEnd,
          tools: toolsForType(type)
            .slice(0, 3)
            .map((t) => t.name),
        },
        { receivedOn, startedOn: receivedOn, rounds: [], deliveredOn: isCurrent ? null : monthEnd },
      );
    }
  });

  // Work in progress, positioned around today.
  for (const seed of OPEN_ORDERS) {
    const pkg = packageByKey.get(seed.packageKey)!;
    const client = CLIENTS[seed.client];
    const receivedOn = addDays(today, -seed.receivedAgo);
    const notes = seed.revisionNotes ?? [];
    const rounds = notes.map((note, i) => {
      const requestedOn = addDays(receivedOn, Math.min(1 + i, seed.receivedAgo));
      const isLast = i === notes.length - 1;
      const extraFee = pkg.revisionLimit !== null && i >= pkg.revisionLimit ? Math.round(pkg.price * 0.2) : 0;
      return { requestedOn, resolvedOn: isLast && seed.status === "revision" ? null : requestedOn, note, extraFee };
    });
    const id = addOrder(
      {
        clientName: client.name,
        clientContact: client.contact,
        type: seed.type,
        title: seed.title,
        brief: seed.brief,
        referenceLinks: seed.referenceLinks ?? [],
        packageId: pkg.id,
        packageName: pkg.name,
        plan: "single",
        quantity: seed.quantity,
        rush: seed.rush ?? false,
        price: quotePrice({ unitPrice: pkg.price, quantity: seed.quantity, rush: seed.rush ?? false }),
        revisionLimit: pkg.revisionLimit,
        status: seed.status,
        dueDate: addDays(today, seed.due),
        tools:
          seed.status === "received"
            ? []
            : toolsForType(seed.type)
                .slice(0, 2)
                .map((t) => t.name),
      },
      {
        receivedOn,
        startedOn: seed.status === "received" ? null : addDays(receivedOn, seed.receivedAgo > 0 ? 1 : 0),
        rounds,
        deliveredOn: null,
      },
    );
    if (seed.withBrief) {
      const content = templateBrief({
        type: seed.type,
        title: seed.title,
        clientName: client.name,
        brief: seed.brief,
        quantity: seed.quantity,
      });
      briefRows.push({ workspaceId, orderId: id, source: "template", ...content, createdAt: at(receivedOn, 16) });
    }
  }

  const portfolio = PORTFOLIO_SEEDS.map((item, index) => ({
    ...item,
    workspaceId,
    createdAt: at(addDays(today, -(index * 9 + 3)), 12),
  }));

  return {
    packages: packageRows,
    orders: orderRows,
    events: eventRows,
    revisions: revisionRows,
    briefs: briefRows,
    portfolio,
    monthlyGoal: DEFAULT_MONTHLY_GOAL,
  };
}
