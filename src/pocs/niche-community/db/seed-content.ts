import type { ChannelIconKey } from "../domain/inputs";

/**
 * Sample content for a new workspace. Every person, post, meetup and payment is
 * fictional demo data (the UI labels it 샘플). Times are relative to the seed's "now".
 */

export type ChannelKey = "free" | "story" | "tech" | "marketing" | "invest" | "mentor";

export const CHANNELS: {
  key: ChannelKey;
  name: string;
  description: string;
  access: "open" | "premium";
  icon: ChannelIconKey;
}[] = [
  { key: "free", name: "자유게시판", description: "근황, 질문, 커피챗 제안까지 자유롭게", access: "open", icon: "message" },
  { key: "story", name: "창업 이야기", description: "창업 과정의 결정과 숫자를 솔직하게", access: "open", icon: "rocket" },
  { key: "tech", name: "기술 토론", description: "개발, AI, 인프라 선택의 실전 경험", access: "open", icon: "code" },
  { key: "marketing", name: "마케팅 전략", description: "그로스, 퍼포먼스, 콘텐츠 마케팅", access: "open", icon: "megaphone" },
  { key: "invest", name: "투자·펀딩", description: "투자 유치, 지원사업, 투자자 미팅 준비", access: "premium", icon: "coins" },
  { key: "mentor", name: "멘토링", description: "먼저 걸어간 창업가의 조언과 오피스아워", access: "premium", icon: "graduation" },
];

export type PersonKey =
  | "operator"
  | "jihoon"
  | "seoyeon"
  | "minjun"
  | "haeun"
  | "seungwoo"
  | "jia"
  | "taeo"
  | "sejin"
  | "yuna"
  | "hyunwoo"
  | "subin"
  | "minjae";

export interface PersonSeed {
  key: PersonKey;
  nickname: string;
  headline: string;
  bio: string;
  role: "operator" | "member";
  /** Days before the seed's "now". */
  joinedDaysAgo: number;
  /** Premium history: upgrade N days ago, optionally downgraded M days ago. */
  premium?: { upgradedDaysAgo: number; downgradedDaysAgo?: number };
}

/** Days since the community opened (the operator's join date). */
export const COMMUNITY_AGE_DAYS = 200;

export const PEOPLE: PersonSeed[] = [
  {
    key: "operator",
    nickname: "김도윤",
    headline: "스타트업 빌더스 운영자",
    bio: "B2B SaaS를 5년 운영하고 엑싯한 뒤, 창업가들이 서로 숫자를 보여주는 방을 만들고 있어요.",
    role: "operator",
    joinedDaysAgo: COMMUNITY_AGE_DAYS,
  },
  {
    key: "jihoon",
    nickname: "박지훈",
    headline: "AI 문서 자동화 스타트업 대표",
    bio: "시리즈A 준비 중. IR 자료와 투자자 미팅 이야기라면 언제든 커피챗 환영합니다.",
    role: "member",
    joinedDaysAgo: 196,
    premium: { upgradedDaysAgo: 170 },
  },
  {
    key: "seoyeon",
    nickname: "이서연",
    headline: "1인 SaaS 개발 중 · 빌드 로그 연재",
    bio: "회사 다니며 만든 사이드 프로젝트를 본업으로 바꾸는 중. 매주 숫자를 공개합니다.",
    role: "member",
    joinedDaysAgo: 150,
  },
  {
    key: "minjun",
    nickname: "최민준",
    headline: "그로스 마케터 · 퍼포먼스 마케팅",
    bio: "광고비 대비 성과를 집요하게 봅니다. 퍼널 진단 부탁은 댓글로 주세요.",
    role: "member",
    joinedDaysAgo: 188,
    premium: { upgradedDaysAgo: 120 },
  },
  {
    key: "haeun",
    nickname: "정하은",
    headline: "프로덕트 디자이너",
    bio: "B2B 제품의 온보딩과 빈 화면을 좋아합니다. 디자인 리뷰 품앗이 해요.",
    role: "member",
    joinedDaysAgo: 92,
  },
  {
    key: "seungwoo",
    nickname: "한승우",
    headline: "엔젤투자자 · 초기 기업 투자",
    bio: "직접 창업했다가 지금은 초기 팀에 투자합니다. 프리미엄 채널에서 심사 관점을 나눠요.",
    role: "member",
    joinedDaysAgo: 185,
    premium: { upgradedDaysAgo: 180 },
  },
  {
    key: "jia",
    nickname: "윤지아",
    headline: "PM · 창업 준비 중",
    bio: "플랫폼 회사 PM 6년 차. 내년 창업을 목표로 문제를 인터뷰하고 있어요.",
    role: "member",
    joinedDaysAgo: 41,
  },
  {
    key: "taeo",
    nickname: "강태오",
    headline: "전 핀테크 CTO · 기술 멘토",
    bio: "초기 개발팀 채용과 아키텍처 결정을 멘토링합니다. 오피스아워는 멘토링 채널에서.",
    role: "member",
    joinedDaysAgo: 160,
    premium: { upgradedDaysAgo: 150 },
  },
  {
    key: "sejin",
    nickname: "오세진",
    headline: "백엔드 개발자 · 인프라 덕후",
    bio: "작은 팀이 운영 가능한 인프라를 고민합니다. Postgres면 대부분 됩니다.",
    role: "member",
    joinedDaysAgo: 110,
    premium: { upgradedDaysAgo: 95, downgradedDaysAgo: 34 },
  },
  {
    key: "yuna",
    nickname: "서유나",
    headline: "콘텐츠 마케터 · 뉴스레터 운영",
    bio: "구독자 1만 명 뉴스레터를 운영하며 배운 제목 실험을 기록합니다.",
    role: "member",
    joinedDaysAgo: 75,
    premium: { upgradedDaysAgo: 60 },
  },
  {
    key: "hyunwoo",
    nickname: "문현우",
    headline: "예비 창업자 · 퇴사 3개월 차",
    bio: "로컬 푸드 커머스를 준비하고 있어요. 모든 게 처음이라 많이 묻겠습니다.",
    role: "member",
    joinedDaysAgo: 24,
  },
  {
    key: "subin",
    nickname: "배수빈",
    headline: "D2C 커머스 브랜드 대표",
    bio: "생활용품 브랜드를 3년째 운영 중. 재구매와 CRM 이야기를 좋아합니다.",
    role: "member",
    joinedDaysAgo: 130,
    premium: { upgradedDaysAgo: 88 },
  },
  {
    key: "minjae",
    nickname: "조민재",
    headline: "HR SaaS 공동창업자",
    bio: "공동창업 2년 차. 지분, 역할 분담, 첫 채용까지 겪은 일을 나눕니다.",
    role: "member",
    joinedDaysAgo: 175,
    premium: { upgradedDaysAgo: 140, downgradedDaysAgo: 52 },
  },
];

/* ---- generated members ---- */

export const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "신", "권", "황", "안", "송", "류", "홍"];
export const GIVEN_NAMES = [
  "서준", "하윤", "도현", "지우", "예준", "수아", "시우", "지호", "서윤", "주원", "하린", "건우", "채원", "우진", "지민",
  "현준", "다은", "준서", "소율", "태윤", "가은", "은호", "나연", "재원", "유진", "성민", "예린", "동하", "승아", "라온",
];
export const HEADLINES = [
  "B2B SaaS 창업 2년 차",
  "헬스케어 스타트업 PM",
  "1인 개발자 · 앱 3개 운영",
  "에듀테크 공동창업자",
  "프리랜서 개발자 · 창업 준비",
  "초기 스타트업 재무 담당",
  "UX 리서처",
  "AI 에이전트 스타트업 개발자",
  "로컬 커머스 대표",
  "예비 창업자 · 아이템 검증 중",
  "그로스 해커",
  "액셀러레이터 심사역",
  "스타트업 채용 담당",
  "프롭테크 스타트업 COO",
  "푸드테크 창업 준비 중",
  "모바일 앱 개발자",
];

/* ---- posts ---- */

export interface PostSeed {
  channel: ChannelKey;
  author: PersonKey;
  /** Hours before the seed's "now". */
  hoursAgo: number;
  title: string;
  body: string;
  pinned?: boolean;
  /** Premium-only inside an open channel. */
  premiumOnly?: boolean;
  /** Roughly how many likes (the seed jitters it). */
  appeal: number;
  comments?: { author: PersonKey; body: string; hoursAfter: number }[];
}

export const POSTS: PostSeed[] = [
  {
    channel: "free",
    author: "operator",
    hoursAgo: 24 * 21,
    pinned: true,
    appeal: 18,
    title: "스타트업 빌더스 이용 안내: 채널 성격과 글쓰기 규칙",
    body: `반갑습니다, 운영자 김도윤입니다. 이 방의 규칙은 세 가지뿐이에요.

1. 숫자와 경험으로 말해요. "잘 됐다"보다 "전환율 2.1%에서 3.4%"가 서로에게 도움이 됩니다.
2. 대외비 채널(투자·펀딩, 멘토링)의 내용은 밖으로 옮기지 않아요.
3. 질문에는 맥락을 붙여요. 단계, 팀 규모, 이미 해 본 것을 적어 주시면 답이 빨라집니다.

무료 멤버는 하루 3개까지 글을 쓸 수 있고, 프리미엄 멤버는 제한이 없어요. 매달 데모데이와 모각작 모임은 모임 탭에서 신청할 수 있습니다.`,
    comments: [
      { author: "jihoon", body: "숫자로 말하기, 이 방에 오래 있게 되는 이유예요.", hoursAfter: 3 },
      { author: "hyunwoo", body: "처음 왔는데 규칙이 짧아서 좋네요. 잘 부탁드립니다!", hoursAfter: 26 },
    ],
  },
  {
    channel: "story",
    author: "jihoon",
    hoursAgo: 24 * 5 + 3,
    pinned: true,
    appeal: 42,
    title: "시리즈A 투자 유치 후기: IR 자료를 10장으로 줄였더니 달라진 것",
    body: `AI 문서 자동화 스타트업을 운영하는 박지훈입니다. 6개월 걸린 시리즈A 라운드를 마무리하며 배운 점을 정리합니다.

1. IR 자료는 10장 이내로. 첫 미팅은 20분이고, 장표가 많을수록 질문이 흩어져요.
2. PMF는 숫자로 증명. 월별 리텐션 코호트 한 장이 어떤 비전 장표보다 강했습니다.
3. 팀 장표가 생각보다 중요해요. "왜 이 팀이 이 문제를 푸는가"에 절반 이상의 시간을 썼습니다.
4. VC마다 보는 포인트가 달라요. 미팅 후 받은 질문을 스프레드시트로 모아 다음 미팅 전에 장표를 고쳤습니다.

궁금한 점은 댓글로 남겨 주세요. 장표 구성은 프리미엄 채널에 따로 올릴게요.`,
    comments: [
      { author: "seungwoo", body: "축하합니다. 코호트 장표 이야기 공감해요. 심사할 때 가장 먼저 찾는 장표입니다.", hoursAfter: 2 },
      { author: "seoyeon", body: "질문을 시트로 모으는 방법 바로 따라 해 볼게요. 미팅마다 같은 질문에서 막혔거든요.", hoursAfter: 5 },
      { author: "operator", body: "좋은 경험 공유 감사합니다. 공지로 고정해 둘게요.", hoursAfter: 20 },
      { author: "hyunwoo", body: "10장 안에 꼭 들어가야 하는 장표 순서도 궁금합니다!", hoursAfter: 30 },
    ],
  },
  {
    channel: "tech",
    author: "seoyeon",
    hoursAgo: 24 * 3 + 6,
    appeal: 24,
    title: "Next.js와 Remix 사이에서 3주 고민하고 결국 이렇게 골랐어요",
    body: `1인 SaaS를 새로 만들면서 프레임워크를 고민했는데, 결론은 "제품 성격에 따라 다르다"였어요.

Next.js를 고른 이유
- 랜딩과 앱을 한 코드베이스에서, SEO가 중요한 페이지가 많음
- 배포와 미리보기 환경이 간단함
- 막혔을 때 검색되는 자료가 압도적으로 많음

Remix가 나았을 경우
- 폼 처리가 대부분인 내부 도구
- 웹 표준에 가까운 데이터 로딩을 선호할 때

여러분은 어떤 기준으로 고르셨나요?`,
    comments: [
      { author: "jia", body: "PM 입장에선 '막혔을 때 자료가 많은가'가 제일 현실적인 기준 같아요.", hoursAfter: 4 },
      { author: "sejin", body: "저희 팀은 Remix로 갔는데 폼이 많은 어드민에선 만족 중입니다.", hoursAfter: 18 },
      { author: "taeo", body: "1인이면 운영 부담이 적은 쪽이 정답이에요. 좋은 선택입니다.", hoursAfter: 22 },
    ],
  },
  {
    channel: "marketing",
    author: "minjun",
    hoursAgo: 24 * 2 + 2,
    appeal: 21,
    title: "CAC를 절반으로 줄인 건 오디언스 세분화였습니다",
    body: `지난 3개월 동안 고객 획득 비용을 절반 가까이 줄인 과정을 공유합니다.

기존: 넓은 타깃 한 세트 → 클릭 단가는 낮지만 전환이 안 됨
개선: 구매 의도 기준으로 마이크로 세그먼트 7개 → 세그먼트별 소재와 랜딩 분리

가장 효과가 컸던 건 관심사 타깃과 리타깃팅을 섞지 않은 것이었어요. 리타깃팅은 후기 중심 소재, 신규는 문제 제기형 소재로 완전히 나눴습니다.

세그먼트별 실제 수치와 소재 예시는 프리미엄 채널에 정리해 둘게요.`,
    comments: [
      { author: "haeun", body: "세그먼트별로 랜딩을 나누면 디자인 리소스는 어떻게 감당하셨어요?", hoursAfter: 3 },
      { author: "minjun", body: "히어로 섹션과 첫 문장만 바꾸는 템플릿으로 했어요. 전체를 새로 만들 필요는 없더라고요.", hoursAfter: 5 },
      { author: "subin", body: "리타깃팅은 후기 소재, 저희도 똑같이 봤습니다. 효과 확실해요.", hoursAfter: 9 },
    ],
  },
  {
    channel: "free",
    author: "haeun",
    hoursAgo: 24 + 4,
    appeal: 15,
    title: "디자이너가 본 B2B SaaS 온보딩, 잘하는 곳의 공통점 4가지",
    body: `최근 B2B 제품 스무 개의 가입 후 첫 10분을 기록해 봤어요.

1. 빈 화면이 할 일을 알려 줌: "아직 없음" 대신 첫 행동 하나를 제안
2. 샘플 데이터로 시작: 내 데이터가 없어도 제품이 어떻게 보이는지 먼저 보여 줌
3. 설정은 나중에: 가입 직후 설정 화면을 열지 않음
4. 진행 상황이 보임: 체크리스트가 아니라 "다음 한 단계"만 보여 줌

온보딩 개선 중인 분 계시면 화면 캡처 들고 커피챗 해요.`,
    comments: [
      { author: "seoyeon", body: "샘플 데이터로 시작하기, 제 제품에 바로 넣어 볼게요!", hoursAfter: 2 },
      { author: "jia", body: "'다음 한 단계만' 너무 좋네요. 체크리스트가 오히려 부담이었어요.", hoursAfter: 6 },
    ],
  },
  {
    channel: "invest",
    author: "seungwoo",
    hoursAgo: 12,
    appeal: 26,
    title: "초기 투자 심사에서 요즘 가장 많이 묻는 지표 3가지",
    body: `요즘 시드·프리A 심사에서 거의 매번 나오는 질문을 정리했습니다.

1. 월 반복 매출(MRR) 성장률: 절대 금액보다 최근 3개월 기울기를 봅니다.
2. 순매출 유지율(NRR): 기존 고객이 늘어나는지 줄어드는지. 100%를 넘으면 대화가 달라집니다.
3. 고객 획득 비용 대비 생애 가치: 비율 자체보다 계산 근거를 설명할 수 있는지가 중요해요.

숫자가 작아도 괜찮습니다. 숫자를 어떻게 모으고 해석하는지가 팀을 보여 줘요.`,
    comments: [
      { author: "jihoon", body: "NRR 질문은 저희 라운드에서도 매번 나왔어요. 계산 근거 장표 따로 만들길 잘했습니다.", hoursAfter: 2 },
      { author: "subin", body: "커머스는 NRR 대신 재구매율로 설명해도 될까요?", hoursAfter: 4 },
      { author: "seungwoo", body: "네, 코호트별 재구매율이면 충분히 같은 이야기를 할 수 있어요.", hoursAfter: 6 },
    ],
  },
  {
    channel: "story",
    author: "jia",
    hoursAgo: 8,
    appeal: 12,
    title: "PM 출신이 창업 준비하며 빠진 함정 5가지",
    body: `프로덕트 매니저로 일하다 창업을 준비하면서 스스로 발견한 함정들입니다.

1. 기능 추가 중독 → MVP 범위를 매주 줄이는 연습 중
2. 완벽한 기획서 → 문서 대신 5명에게 보여 줄 프로토타입
3. 모든 피드백 반영 → 가장 아픈 고객 한 명에게 집중
4. 데이터만 보고 결정 → 이번 달 목표는 고객 인터뷰 20번
5. 혼자 다 하려고 함 → 공동창업자 찾는 중입니다

특히 3번이 제일 어렵네요. 다들 어떻게 버티셨나요?`,
    comments: [
      { author: "minjae", body: "3번은 '이번 분기에 누구 문제를 푸는가'를 한 문장으로 써 두고 매주 읽었어요.", hoursAfter: 1 },
      { author: "operator", body: "공감합니다. MVP 범위를 줄이는 연습, 모각작에서 같이 해요.", hoursAfter: 2 },
    ],
  },
  {
    channel: "free",
    author: "jia",
    hoursAgo: 3,
    appeal: 6,
    title: "오늘 저녁 성수 근처에서 커피챗 하실 분 계신가요?",
    body: `7시쯤 성수역 근처에 있을 예정이에요. 고객 인터뷰 질문지를 같이 봐 주실 분이면 더 좋고, 그냥 근황 이야기도 환영합니다. 댓글 주시면 연락드릴게요.`,
    comments: [{ author: "hyunwoo", body: "저 근처예요! 인터뷰 질문지 저도 배우고 싶어요.", hoursAfter: 1 }],
  },
  {
    channel: "mentor",
    author: "operator",
    hoursAgo: 24 * 6,
    appeal: 14,
    title: "이달의 오피스아워: 신청 방법과 준비물",
    body: `이번 달 오피스아워는 모임 탭의 "투자 유치 오피스아워"로 신청해 주세요. 한 분당 15분, 선착순입니다.

준비물
- 지금 가장 막힌 질문 한 가지
- 관련 숫자(매출, 전환, 리텐션 중 하나라도)
- 미리 읽어 볼 자료 링크

멘토는 한승우 님(투자), 강태오 님(기술 조직)입니다.`,
    comments: [{ author: "subin", body: "지난달 오피스아워 덕에 가격 정책 바꿨어요. 이번에도 신청합니다.", hoursAfter: 8 }],
  },
  {
    channel: "mentor",
    author: "taeo",
    hoursAgo: 24 * 9 + 5,
    appeal: 22,
    title: "첫 개발자 채용, 코딩 테스트보다 먼저 볼 것",
    body: `초기 팀의 첫 개발자는 기술보다 "모호함을 견디는 방식"이 중요합니다. 제가 면접에서 쓰는 질문 세 가지예요.

1. 요구사항이 한 줄뿐인 기능을 받았을 때 가장 먼저 무엇을 묻나요?
2. 지난 프로젝트에서 스스로 범위를 줄인 경험이 있나요?
3. 장애가 났을 때 가장 먼저 누구에게 무엇을 알리나요?

과제는 짧게, 대신 과제 리뷰 대화를 길게 하세요. 거기서 대부분이 보입니다.`,
    comments: [
      { author: "minjae", body: "과제 리뷰 대화를 길게, 저희 채용에 바로 반영합니다.", hoursAfter: 5 },
      { author: "jihoon", body: "2번 질문 좋네요. 범위를 줄여 본 사람이 확실히 초기 팀에 맞았어요.", hoursAfter: 12 },
    ],
  },
  {
    channel: "invest",
    author: "jihoon",
    hoursAgo: 24 * 15,
    appeal: 30,
    title: "팁스(TIPS) 추천을 받기까지 걸린 4개월 타임라인",
    body: `운영사 첫 미팅부터 추천까지 4개월이 걸렸습니다. 단계별로 무엇을 준비했는지 적어 둡니다.

1개월 차: 운영사 3곳 미팅, 기술 차별성 장표를 따로 만듦
2개월 차: 운영사 투자 검토, 기술 실사 질문 대응
3개월 차: 투자 계약, 사업계획서 초안
4개월 차: 추천 및 서류 보완

가장 시간이 걸린 건 사업계획서의 "기술 개발 목표"를 측정 가능한 문장으로 바꾸는 일이었어요.`,
    comments: [
      { author: "seungwoo", body: "기술 개발 목표를 측정 가능하게 쓰는 게 핵심이죠. 좋은 정리입니다.", hoursAfter: 6 },
      { author: "subin", body: "운영사 미팅 때 가장 많이 받은 질문도 궁금해요.", hoursAfter: 30 },
    ],
  },
  {
    channel: "invest",
    author: "seungwoo",
    hoursAgo: 24 * 25,
    appeal: 19,
    title: "투자 계약서에서 창업자가 놓치기 쉬운 조항",
    body: `첫 투자 계약서를 받으면 밸류에이션만 보게 되는데, 나중에 문제가 되는 건 다른 조항들입니다.

- 동의권·협의권의 범위: 어떤 결정에 투자자 동의가 필요한지
- 우선매수권과 동반매도권: 지분 변동 시 절차
- 주식매수청구권이 발동되는 조건
- 겸업 금지와 창업자 의무 조항

계약서는 꼭 변호사와 함께 검토하세요. 여기 적은 건 체크리스트일 뿐 법률 자문이 아닙니다.`,
    comments: [{ author: "minjae", body: "동의권 범위, 저희도 나중에 알았어요. 미리 봤으면 좋았을 체크리스트입니다.", hoursAfter: 10 }],
  },
  {
    channel: "tech",
    author: "sejin",
    hoursAgo: 24 * 4 + 7,
    appeal: 17,
    title: "Postgres 하나로 큐, 검색, 캐시까지 버틴 1년",
    body: `작은 팀이라 운영할 시스템 수를 줄이는 게 목표였어요. 1년 동안 Postgres 하나로 버틴 방법입니다.

- 작업 큐: SKIP LOCKED로 워커 3개 운영
- 검색: 한국어는 trigram 인덱스로 충분했음
- 캐시: 머티리얼라이즈드 뷰를 5분마다 갱신

한계가 온 건 검색 요청이 초당 수백 건을 넘었을 때였고, 그때 처음 별도 검색 엔진을 붙였습니다.`,
    comments: [
      { author: "taeo", body: "초기엔 이게 정답이라고 봅니다. 시스템 하나 늘 때마다 새벽 알림도 하나 늘어요.", hoursAfter: 3 },
      { author: "seoyeon", body: "SKIP LOCKED 큐 예제 코드 공유 가능하실까요?", hoursAfter: 8 },
    ],
  },
  {
    channel: "tech",
    author: "seoyeon",
    hoursAgo: 24 * 11 + 2,
    appeal: 13,
    title: "정기결제 연동하며 막힌 곳: 빌링키, 실패 재시도, 환불",
    body: `구독 결제를 붙이면서 막힌 지점들입니다.

1. 빌링키 발급은 쉬운데, 카드 만료와 한도 초과 처리가 진짜 일
2. 결제 실패 시 재시도 간격: 1일, 3일, 7일로 세 번
3. 부분 환불은 정책부터 정하고 코드 짜기

결제 실패 알림 문구를 바꾼 뒤 재결제 성공률이 눈에 띄게 올랐어요. "결제 실패"보다 "카드 정보를 확인해 주세요"가 낫더라고요.`,
    comments: [{ author: "subin", body: "재시도 간격 참고할게요. 저희는 매일 시도해서 고객 불만이 있었어요.", hoursAfter: 7 }],
  },
  {
    channel: "marketing",
    author: "minjun",
    hoursAgo: 24 * 9,
    appeal: 16,
    title: "광고비 없이 메신저 채널 친구 1,000명을 모은 방법",
    body: `유료 광고 없이 채널 친구를 모은 순서입니다.

1. 제품 안 "완료 화면"에 채널 추가 버튼 (가장 효과 큼)
2. 친구 전용 쿠폰이 아니라 친구 전용 "정보" 제공
3. 한 달에 두 번 이상 보내지 않기

차단율이 낮게 유지된 게 결국 친구 수를 지켜 줬어요.`,
    comments: [{ author: "yuna", body: "뉴스레터도 발송 빈도가 구독 해지율을 거의 결정하더라고요.", hoursAfter: 4 }],
  },
  {
    channel: "marketing",
    author: "yuna",
    hoursAgo: 24 * 16,
    appeal: 20,
    title: "뉴스레터 오픈율을 올린 제목 실험 12주 기록",
    body: `12주 동안 매주 제목 두 개를 A/B로 보냈습니다. 결과가 분명했던 것만 적어요.

- 숫자가 들어간 제목이 대체로 이김
- 질문형은 주제가 좁을 때만 이김
- 이모지는 차이가 거의 없음
- 발신자 이름을 브랜드명에서 사람 이름으로 바꾼 게 가장 큰 변화

실험 시트 양식이 필요하시면 댓글 주세요.`,
    comments: [
      { author: "minjun", body: "발신자 이름 실험 결과 흥미롭네요. 광고 소재에도 비슷한 경향이 있어요.", hoursAfter: 5 },
      { author: "jia", body: "실험 시트 양식 부탁드려요!", hoursAfter: 9 },
    ],
  },
  {
    channel: "free",
    author: "hyunwoo",
    hoursAgo: 24 * 2 + 9,
    appeal: 19,
    title: "퇴사 3개월 차, 솔직한 생활비 이야기",
    body: `창업 준비하며 가장 불안한 건 통장 잔고였어요. 3개월 동안 써 보니 이렇게 정리됐습니다.

- 고정비를 먼저 줄이고 시작한 게 가장 잘한 일
- 정부 지원사업 일정표를 달력에 전부 넣어 둠
- 6개월치 생활비를 "버틸 수 있는 기간"으로 시각화하니 덜 불안함

다들 준비 기간에 생활비는 어떻게 버티셨는지 궁금해요.`,
    comments: [
      { author: "operator", body: "버틸 수 있는 기간을 눈에 보이게 두는 것, 정말 중요해요. 응원합니다.", hoursAfter: 2 },
      { author: "seoyeon", body: "저는 외주를 주 2일로 제한하고 나머지를 제품에 썼어요.", hoursAfter: 5 },
      { author: "minjae", body: "지원사업 일정표 좋은 방법이네요. 공고 시기가 대부분 몰려 있어요.", hoursAfter: 11 },
    ],
  },
  {
    channel: "free",
    author: "haeun",
    hoursAgo: 24 * 13,
    appeal: 11,
    title: "공유오피스 세 곳을 한 달씩 써 본 후기",
    body: `성수, 강남, 판교의 공유오피스를 한 달씩 써 봤어요.

- 집중: 좌석 간격과 조명이 제일 중요했음
- 네트워킹: 입주사 행사가 많은 곳이 확실히 사람을 만나기 쉬움
- 비용: 고정석보다 자유석 + 회의실 크레딧 조합이 1인 팀엔 적당

결국 지금은 주 3일 공유오피스, 주 2일 집에서 일해요.`,
  },
  {
    channel: "story",
    author: "subin",
    hoursAgo: 24 * 6 + 5,
    appeal: 23,
    title: "재구매율 40%를 넘긴 D2C 브랜드의 첫 100명 고객",
    body: `첫 100명은 광고가 아니라 직접 찾아갔습니다.

1. 제품을 쓸 만한 커뮤니티 10곳에 사용 후기 모집
2. 구매 고객 전원에게 손편지와 사용 팁 카드
3. 30일 뒤 직접 전화해서 불편한 점 인터뷰

세 번째가 재구매율을 만들었어요. 인터뷰 내용으로 리필 제품을 만들었거든요.`,
    comments: [
      { author: "minjun", body: "30일 뒤 전화 인터뷰, 광고로는 절대 못 얻는 인사이트네요.", hoursAfter: 4 },
      { author: "hyunwoo", body: "푸드 커머스 준비 중인데 정말 도움이 됩니다.", hoursAfter: 13 },
    ],
  },
  {
    channel: "story",
    author: "minjae",
    hoursAgo: 24 * 18,
    appeal: 18,
    title: "공동창업자와 지분을 나눌 때 우리가 쓴 기준표",
    body: `셋이서 지분을 나누면서 감정이 상하지 않도록 기준표를 만들었어요.

- 아이디어 기여보다 앞으로 4년의 역할에 가중치
- 풀타임 합류 시점 차이는 베스팅으로 조정
- 초기 자금 기여는 지분이 아니라 대여로 처리

결론보다 "기준을 먼저 합의하고 숫자는 나중에" 순서가 가장 도움이 됐습니다.`,
    comments: [{ author: "jia", body: "공동창업자를 찾는 중이라 저장해 둡니다. 순서가 핵심이네요.", hoursAfter: 20 }],
  },
  {
    channel: "tech",
    author: "sejin",
    hoursAgo: 24 * 22,
    appeal: 21,
    title: "LLM API 비용을 5분의 1로 줄인 캐싱 전략",
    body: `요약 기능의 API 비용이 매출보다 빨리 늘어서 구조를 바꿨습니다.

1. 시스템 프롬프트를 고정해서 프롬프트 캐시 적중률 올리기
2. 같은 문서의 재요약은 결과 캐시에서 응답
3. 긴 문서는 먼저 가벼운 모델로 분류, 필요한 것만 큰 모델로

모델을 바꾸는 것보다 "같은 질문을 두 번 하지 않는 것"이 훨씬 효과가 컸어요.`,
    comments: [
      { author: "jihoon", body: "저희도 1번만으로 비용이 크게 줄었어요. 프롬프트 순서가 중요하더라고요.", hoursAfter: 6 },
      { author: "taeo", body: "분류 단계를 두는 설계 좋습니다. 품질 모니터링만 같이 붙여 두세요.", hoursAfter: 14 },
    ],
  },
  {
    channel: "story",
    author: "operator",
    hoursAgo: 24 * 30,
    appeal: 25,
    title: "커뮤니티 운영 6개월, 유료 멤버십을 열며 배운 것",
    body: `무료로 시작한 이 방에 유료 멤버십을 연 지 몇 달이 됐어요. 운영하며 배운 점입니다.

1. 유료 채널의 가치는 "정보"보다 "누가 있는가"에서 나와요.
2. 가격을 올리는 것보다 이탈을 줄이는 게 먼저였습니다. 모임에 한 번이라도 온 분은 거의 떠나지 않았어요.
3. 운영자가 숫자를 공개하면 멤버도 숫자를 공개합니다.

앞으로도 이 방의 숫자는 여기에서 투명하게 나눌게요.`,
    comments: [
      { author: "seungwoo", body: "모임 참석과 유지율 이야기, 투자 심사에서도 커뮤니티 비즈니스를 볼 때 보는 지표예요.", hoursAfter: 9 },
      { author: "yuna", body: "뉴스레터도 오프라인에서 한 번 만난 독자는 거의 해지하지 않아요.", hoursAfter: 15 },
    ],
  },
  {
    channel: "mentor",
    author: "taeo",
    hoursAgo: 24 * 20,
    appeal: 17,
    title: "시드 투자 이후 CTO가 해야 할 일과 하지 말아야 할 일",
    body: `해야 할 일
- 배포와 장애 대응을 누구나 할 수 있게 문서화
- 채용 기준을 한 페이지로 정리
- 기술 부채 목록을 분기마다 공개

하지 말아야 할 일
- 모든 코드 리뷰를 혼자 붙잡기
- 투자 받았다고 인프라부터 키우기
- 채용 급하다고 기준 낮추기`,
    comments: [{ author: "sejin", body: "'인프라부터 키우기' 뜨끔하네요. 좋은 리스트 감사합니다.", hoursAfter: 11 }],
  },
  {
    channel: "marketing",
    author: "subin",
    hoursAgo: 24 + 9,
    appeal: 14,
    premiumOnly: true,
    title: "숏폼 대신 검색 블로그로 돌아간 이유와 3개월 수치",
    body: `숏폼 영상은 조회수는 높았지만 구매로 이어지지 않았어요. 검색 블로그로 돌아간 뒤 3개월 수치입니다.

- 월 방문자: 숏폼 유입의 3분의 1
- 구매 전환율: 숏폼 유입의 4배
- 콘텐츠 1개당 제작 시간: 절반

구매 의도가 있는 검색어를 먼저 정하고 글을 쓰는 게 핵심이었어요. 키워드 목록 양식은 댓글로 드릴게요.`,
    comments: [{ author: "minjun", body: "구매 의도 검색어 먼저, 광고 키워드 설계와 같은 원리네요.", hoursAfter: 5 }],
  },
];

/** 이서연's weekly build log (the seed writes one per week, newest first). */
export const BUILD_LOG = {
  author: "seoyeon" as PersonKey,
  channel: "story" as ChannelKey,
  weeks: 10,
  /** Hours before "now" of the most recent log. */
  latestHoursAgo: 24 * 1 + 2,
  signups: [34, 51, 70, 88, 104, 131, 152, 173, 196, 212],
  paid: [0, 0, 1, 1, 2, 3, 4, 6, 7, 9],
  focus: [
    "랜딩 페이지 문구를 세 번 바꿈",
    "가입 직후 샘플 데이터 넣기",
    "첫 유료 고객 인터뷰",
    "가격 페이지를 월간·연간으로 분리",
    "온보딩 메일 3통 자동화",
    "결제 실패 안내 문구 수정",
    "팀 초대 기능 출시",
    "검색 유입용 가이드 글 4개",
    "해지 사유 설문 추가",
    "첫 연간 결제 고객",
  ],
};

export const GENERIC_COMMENTS = [
  "정리 감사합니다. 저장해 두고 다시 볼게요.",
  "저희도 비슷한 고민 중이었는데 방향이 잡히네요.",
  "혹시 이 부분 조금 더 자세히 들을 수 있을까요? 다음 모임 때 여쭤볼게요.",
  "숫자까지 공개해 주셔서 정말 도움이 됩니다.",
  "공감합니다. 저희 팀에도 공유했어요.",
  "좋은 글 감사합니다. 다음 편도 기다릴게요.",
];

export const BUILD_LOG_COMMENTS = [
  "매주 숫자 공개하는 거 정말 멋져요. 응원합니다!",
  "유료 전환 축하드려요. 다음 주도 기다릴게요.",
  "이번 주 실험 결과 궁금했는데 감사합니다.",
  "꾸준함이 제일 무섭다는 걸 보여 주시네요.",
];

/* ---- meetups ---- */

export interface MeetupSeed {
  title: string;
  description: string;
  /** Days from the seed's "now" (negative = past); "saturday" = the next Saturday, "past-saturday" = two weeks before it. */
  day: number | "saturday" | "past-saturday";
  time: string;
  durationMinutes: number;
  location: string;
  format: "offline" | "online";
  capacity: number;
  access: "open" | "premium";
  /** How many members RSVP. */
  going: number;
}

export const MEETUPS: MeetupSeed[] = [
  {
    title: "월간 데모데이",
    description: "멤버 다섯 팀이 5분씩 지금 만드는 것을 보여 주고, 5분씩 질문을 받습니다. 발표 신청은 댓글로.",
    day: -45,
    time: "19:30",
    durationMinutes: 150,
    location: "성수동 공유오피스 라운지 (샘플 장소)",
    format: "offline",
    capacity: 30,
    access: "open",
    going: 26,
  },
  {
    title: "IR 피칭 리허설",
    description: "투자 미팅을 앞둔 멤버가 실제처럼 발표하고, 엔젤투자자 멤버가 질문합니다.",
    day: -32,
    time: "20:00",
    durationMinutes: 90,
    location: "온라인 (참석 확정 후 링크 안내)",
    format: "online",
    capacity: 10,
    access: "premium",
    going: 9,
  },
  {
    title: "월간 데모데이",
    description: "이번 달 데모데이. 발표 팀은 5분 발표와 5분 질의응답, 끝나고 가벼운 네트워킹.",
    day: -17,
    time: "19:30",
    durationMinutes: 150,
    location: "성수동 공유오피스 라운지 (샘플 장소)",
    format: "offline",
    capacity: 30,
    access: "open",
    going: 28,
  },
  {
    title: "모각작: 토요일 오전 집중 작업",
    description: "모여서 각자 작업해요. 시작할 때 오늘 할 일 한 줄, 끝날 때 한 일 한 줄을 공유합니다.",
    day: "past-saturday",
    time: "10:00",
    durationMinutes: 180,
    location: "강남역 스터디 라운지 (샘플 장소)",
    format: "offline",
    capacity: 12,
    access: "open",
    going: 11,
  },
  {
    title: "모각작: 토요일 오전 집중 작업",
    description: "모여서 각자 작업해요. 노트북과 오늘 끝낼 일 하나만 가져오세요.",
    day: "saturday",
    time: "10:00",
    durationMinutes: 180,
    location: "강남역 스터디 라운지 (샘플 장소)",
    format: "offline",
    capacity: 12,
    access: "open",
    going: 9,
  },
  {
    title: "월간 데모데이",
    description: "이번 달도 다섯 팀이 무대에 섭니다. 발표하고 싶은 멤버는 운영자에게 알려 주세요. 청중 참석은 누구나.",
    day: 9,
    time: "19:30",
    durationMinutes: 150,
    location: "성수동 공유오피스 라운지 (샘플 장소)",
    format: "offline",
    capacity: 30,
    access: "open",
    going: 14,
  },
  {
    title: "투자 유치 오피스아워",
    description: "엔젤투자자 멤버와 1:1 15분. 지금 가장 막힌 질문 하나와 관련 숫자를 준비해 오세요.",
    day: 13,
    time: "20:00",
    durationMinutes: 120,
    location: "온라인 (참석 확정 후 링크 안내)",
    format: "online",
    capacity: 8,
    access: "premium",
    going: 8,
  },
];
