// AI 콘텐츠 대행 — pure data and logic.
// No DOM access here: app.js renders, this module computes. Covered by tests/core.test.mjs.

export const TOPIC_MAX = 200;
export const TRAY_LIMIT = 8;

export const CONTENT_TYPES = {
  blog: {
    label: '블로그 포스트',
    short: '블로그',
    placeholder: '블로그 주제를 입력하세요 (예: 디지털 마케팅)',
  },
  product: {
    label: '상품 설명',
    short: '상품 설명',
    placeholder: '상품명 또는 카테고리를 입력하세요 (예: 무선 이어폰)',
  },
  ad: {
    label: '광고 카피',
    short: '광고 카피',
    placeholder: '브랜드/제품명을 입력하세요 (예: 클라우드 서비스)',
  },
};

export const PLANS = {
  starter: { name: '스타터', monthlyLimit: 10, price: '29만원/월' },
  pro: { name: '프로', monthlyLimit: 30, price: '79만원/월' },
  enterprise: { name: '엔터프라이즈', monthlyLimit: Infinity, price: '맞춤 견적' },
};

export const ORDER_STATUSES = ['대기중', '진행중', '완료'];

export const contentTemplates = {
  blog: [
    {
      title: '{{topic}} 완벽 가이드: 2026년 최신 트렌드',
      body: `{{topic}}에 대해 깊이 있게 알아보겠습니다.

최근 {{topic}} 분야는 급격한 변화를 겪고 있습니다. 특히 한국 시장에서의 성장세는 눈에 띄게 두드러지고 있죠.

■ 핵심 포인트 1: 시장 동향
{{topic}} 시장은 2026년 기준 전년 대비 35% 성장하였으며, 특히 중소기업들의 도입률이 크게 증가했습니다.

■ 핵심 포인트 2: 주요 전략
효과적인 {{topic}} 전략을 위해서는 다음 세 가지를 고려해야 합니다:
1. 타겟 고객 분석 및 페르소나 설정
2. 데이터 기반 의사결정 체계 구축
3. 지속적인 A/B 테스트와 최적화

■ 핵심 포인트 3: 실행 방안
실질적인 성과를 위해 단계별 실행 계획을 수립하는 것이 중요합니다. 먼저 현재 상태를 진단하고, 달성 가능한 목표를 설정한 후, 점진적으로 개선해 나가세요.

✅ 결론
{{topic}}은 더 이상 선택이 아닌 필수입니다. 지금 바로 시작하여 경쟁에서 앞서 나가세요.`,
    },
    {
      title: '{{topic}}, 왜 지금 시작해야 할까?',
      body: `안녕하세요, 오늘은 {{topic}}의 중요성에 대해 이야기해보겠습니다.

많은 기업들이 {{topic}}의 필요성은 인식하지만, 실제 도입은 미루고 있는 경우가 많습니다. 하지만 더 이상 미룰 수 없는 이유가 있습니다.

🔹 이유 1: 경쟁사는 이미 시작했습니다
국내 주요 기업의 78%가 이미 {{topic}} 관련 투자를 진행하고 있습니다.

🔹 이유 2: 비용 효율성
초기 투자 대비 평균 3.2배의 ROI를 달성할 수 있으며, 특히 중소기업에서의 효과가 더욱 큽니다.

🔹 이유 3: 고객 기대치 변화
소비자들의 기대 수준이 높아지면서, {{topic}}은 기본적인 서비스 요소가 되었습니다.

📌 지금 바로 실행할 수 있는 3가지 액션:
① 현재 {{topic}} 수준을 점검하세요
② 벤치마킹 대상을 선정하세요
③ 3개월 단위 목표를 수립하세요

시작이 반입니다. 오늘부터 {{topic}}을 시작해보세요!`,
    },
  ],
  product: [
    {
      title: '{{topic}} - 프리미엄 상품 설명',
      body: `✨ {{topic}}

당신의 일상을 한 단계 업그레이드할 프리미엄 제품을 소개합니다.

【제품 특징】
• 최고급 소재 사용으로 뛰어난 내구성
• 인체공학적 설계로 편안한 사용감
• 세련된 디자인으로 어디서나 돋보이는 스타일
• 국내 최고 수준의 품질 관리 시스템

【이런 분께 추천합니다】
✓ 품질에 타협하지 않는 분
✓ 오래 사용할 수 있는 제품을 찾는 분
✓ 합리적인 가격에 프리미엄을 원하는 분

【구매 혜택】
🎁 무료 배송 | 30일 무조건 환불 | 1년 무상 A/S

⭐ 고객 리뷰 평점 4.8/5.0
"기대 이상입니다. 이 가격에 이 품질이라니!" - 김** 님
"재구매 의사 100%. 주변에도 추천하고 있어요." - 이** 님

지금 주문하시면 특별 할인가로 만나보실 수 있습니다!`,
    },
    {
      title: '{{topic}} - 베스트셀러 상품',
      body: `🏆 {{topic}} — 누적 판매 10만 개 돌파!

━━━━━━━━━━━━━━━━━━━━━━
왜 {{topic}}이 베스트셀러일까요?
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 차별화된 기술력
독자적인 기술로 타사 대비 2배 뛰어난 성능을 제공합니다.

2️⃣ 합리적인 가격
불필요한 중간 마진을 제거하여 최적의 가격을 실현했습니다.

3️⃣ 철저한 품질 관리
ISO 인증 공장에서 3단계 품질 검사를 거칩니다.

📦 패키지 구성
- {{topic}} 본품 x 1
- 전용 케이스 x 1
- 사용 설명서 x 1
- 품질 보증서 x 1

💰 특별가: 정가 대비 35% 할인 중!
🚚 오늘 주문 시 내일 도착 (서울/경기 기준)`,
    },
  ],
  ad: [
    {
      title: '{{topic}} - 광고 카피 세트',
      body: `📢 {{topic}} 광고 카피 모음

【헤드라인 옵션】
A. "{{topic}}, 이제 더 스마트하게"
B. "당신이 찾던 {{topic}}, 여기 있습니다"
C. "{{topic}}의 새로운 기준을 만나보세요"

【서브 카피】
• 시간은 줄이고, 효과는 높이고
• 10,000명의 고객이 선택한 이유가 있습니다
• 지금 시작하면 첫 달 50% 할인

【SNS 광고 문구 (카카오/인스타그램)】
🔥 이벤트 중!
{{topic}} 런칭 기념 특별 프로모션
✅ 첫 구매 30% 할인
✅ 무료 체험 7일
✅ 친구 추천 시 추가 혜택

지금 바로 시작하세요 👉 [링크]

【검색 광고 문구 (네이버/구글)】
제목: {{topic}} | 무료체험 가능 | 지금 시작
설명: {{topic}} 전문 서비스. 10,000+ 기업이 신뢰하는 품질. 첫 달 50% 할인 중. 지금 무료로 체험해보세요.

【배너 광고 카피】
메인: "{{topic}}, 성공의 시작"
서브: "월 29만원부터 | 무료 상담 신청"`,
    },
    {
      title: '{{topic}} - 감성 광고 카피',
      body: `💜 {{topic}} 브랜드 광고 카피

【브랜드 스토리형】
"처음 {{topic}}을 시작했을 때,
우리는 단 하나의 약속을 했습니다.
'고객의 성공이 곧 우리의 성공이다.'
그 약속은 오늘도 변하지 않았습니다."

【감성 카피】
• "당신의 내일을 위한 오늘의 선택, {{topic}}"
• "작은 변화가 큰 차이를 만듭니다"
• "{{topic}}과 함께라면, 불가능은 없습니다"

【시즌 프로모션】
🌸 봄맞이 특별 이벤트
{{topic}} 신규 가입 시
→ 첫 3개월 20% 할인
→ 프리미엄 기능 무료 체험
→ 전담 매니저 배정

기간: 한정 수량 소진 시 종료
문의: 1588-XXXX

【리타겟팅 광고】
"아직 고민 중이신가요?
{{topic}}을 경험한 98%의 고객이
'더 일찍 시작할 걸' 이라고 말합니다.
지금이 가장 빠른 때입니다."`,
    },
  ],
};

export const portfolioItems = [
  { id: 1, category: 'blog', title: '디지털 마케팅 전략 가이드', industry: 'IT/테크', preview: '2026년 디지털 마케팅의 핵심 트렌드와 실행 전략을 담은 심층 블로그 포스트' },
  { id: 2, category: 'blog', title: '건강식품 시장 분석 리포트', industry: '헬스케어', preview: '국내 건강식품 시장의 성장 동인과 소비자 트렌드를 분석한 인사이트 콘텐츠' },
  { id: 3, category: 'product', title: '프리미엄 스킨케어 상품 설명', industry: '뷰티', preview: '성분 기반 스토리텔링으로 구매 전환율 42% 향상 달성' },
  { id: 4, category: 'product', title: '스마트 가전 제품 카탈로그', industry: '가전', preview: '기술 사양을 쉽게 풀어낸 소비자 친화적 상품 설명서' },
  { id: 5, category: 'ad', title: '스타트업 런칭 캠페인', industry: 'IT/테크', preview: 'SNS 광고 + 검색 광고 통합 카피로 CPA 35% 절감' },
  { id: 6, category: 'ad', title: '오프라인 매장 홍보 카피', industry: 'F&B', preview: '지역 밀착형 광고 카피로 방문 고객 28% 증가' },
  { id: 7, category: 'blog', title: 'ESG 경영 트렌드 시리즈', industry: '제조', preview: '중소 제조기업 대상 ESG 도입 사례와 실행 가이드' },
  { id: 8, category: 'product', title: '펫용품 온라인 쇼핑몰', industry: '펫', preview: '반려동물 용품 전문 쇼핑몰의 전체 상품 설명 리뉴얼' },
  { id: 9, category: 'ad', title: '교육 플랫폼 가입 캠페인', industry: '교육', preview: '학부모 타겟 광고 카피로 무료 체험 전환율 56% 달성' },
];

export const demoOrders = [
  { id: 'ORD-2026-001', type: '블로그 포스트', topic: 'AI 마케팅 자동화 트렌드', status: '완료', date: '2026-04-01', completedDate: '2026-04-03' },
  { id: 'ORD-2026-002', type: '상품 설명', topic: '신규 스킨케어 라인 5종', status: '완료', date: '2026-04-02', completedDate: '2026-04-04' },
  { id: 'ORD-2026-003', type: '광고 카피', topic: '봄 시즌 프로모션 캠페인', status: '진행중', date: '2026-04-05', completedDate: null },
  { id: 'ORD-2026-004', type: '블로그 포스트', topic: '중소기업 디지털 전환 가이드', status: '진행중', date: '2026-04-06', completedDate: null },
  { id: 'ORD-2026-005', type: '상품 설명', topic: '여름 신상품 카탈로그', status: '대기중', date: '2026-04-07', completedDate: null },
  { id: 'ORD-2026-006', type: '광고 카피', topic: '네이버 검색광고 리뉴얼', status: '대기중', date: '2026-04-08', completedDate: null },
  { id: 'ORD-2026-007', type: '블로그 포스트', topic: '고객 성공 사례 시리즈', status: '대기중', date: '2026-04-08', completedDate: null },
];

// ------------------------------------------------------------
// Text helpers
// ------------------------------------------------------------

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Validates a topic. Returns { ok, topic } or { ok: false, error }. */
export function validateTopic(raw) {
  const topic = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!topic) return { ok: false, error: '주제를 입력해주세요' };
  if (topic.length > TOPIC_MAX) return { ok: false, error: `${TOPIC_MAX}자 이내로 입력해주세요` };
  return { ok: true, topic };
}

export function fillTemplate(template, topic) {
  return {
    title: template.title.replaceAll('{{topic}}', topic),
    body: template.body.replaceAll('{{topic}}', topic),
  };
}

/**
 * Builds a draft for a type and topic. `pick` chooses the template index; `avoid` skips the
 * template used last time when there is an alternative, so "다른 시안" always changes the draft.
 */
export function makeDraft(type, topic, { pick = Math.random, avoid = -1, now = new Date() } = {}) {
  const templates = contentTemplates[type];
  if (!templates) throw new Error(`Unknown content type: ${type}`);
  let index = Math.floor(pick() * templates.length) % templates.length;
  if (index === avoid && templates.length > 1) index = (index + 1) % templates.length;
  const { title, body } = fillTemplate(templates[index], topic);
  return {
    id: `d-${now.getTime().toString(36)}-${index}`,
    type,
    topic,
    templateIndex: index,
    title,
    body,
    createdAt: now.toISOString(),
  };
}

// ------------------------------------------------------------
// Proof tray (saved drafts)
// ------------------------------------------------------------

function isDraft(value) {
  return Boolean(value) && typeof value === 'object'
    && typeof value.id === 'string' && value.type in CONTENT_TYPES
    && typeof value.topic === 'string' && typeof value.title === 'string'
    && typeof value.body === 'string' && typeof value.createdAt === 'string';
}

/** Newest first, de-duplicated by id, capped at TRAY_LIMIT. */
export function addToTray(tray, draft) {
  return [draft, ...tray.filter((d) => d.id !== draft.id)].slice(0, TRAY_LIMIT);
}

export function removeFromTray(tray, id) {
  return tray.filter((d) => d.id !== id);
}

export function parseTray(json) {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.filter(isDraft).slice(0, TRAY_LIMIT) : [];
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------

function isOrder(value) {
  return Boolean(value) && typeof value === 'object'
    && /^ORD-\d{4}-\d{3,}$/.test(value.id) && typeof value.type === 'string'
    && typeof value.topic === 'string' && ORDER_STATUSES.includes(value.status)
    && /^\d{4}-\d{2}-\d{2}$/.test(value.date);
}

/** Returns stored orders, or null when storage holds nothing usable (caller falls back to demo data). */
export function parseOrders(json) {
  if (json == null) return null;
  try {
    const value = JSON.parse(json);
    if (!Array.isArray(value)) return null;
    const orders = value.filter(isOrder);
    return orders.length === value.length ? orders : null;
  } catch {
    return null;
  }
}

/** Calendar date in Asia/Seoul as YYYY-MM-DD. */
export function seoulDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function nextOrderId(orders, year) {
  const prefix = `ORD-${year}-`;
  const max = orders
    .filter((o) => o.id.startsWith(prefix))
    .reduce((m, o) => Math.max(m, Number(o.id.slice(prefix.length)) || 0), 0);
  return prefix + String(max + 1).padStart(3, '0');
}

export function ordersThisMonth(orders, today) {
  const month = today.slice(0, 7);
  return orders.filter((o) => o.date.startsWith(month)).length;
}

/** Can one more order be placed this month on the chosen plan? No plan means no limit is shown or enforced. */
export function allowance(orders, planKey, today) {
  const plan = PLANS[planKey];
  const used = ordersThisMonth(orders, today);
  if (!plan) return { plan: null, used, limit: null, remaining: null, canOrder: true };
  const limit = plan.monthlyLimit;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  return { plan, used, limit, remaining, canOrder: remaining > 0 };
}

export function createOrder(orders, draft, today) {
  return {
    id: nextOrderId(orders, today.slice(0, 4)),
    type: CONTENT_TYPES[draft.type].label,
    topic: draft.topic,
    status: '대기중',
    date: today,
    completedDate: null,
  };
}

export function countByStatus(orders) {
  const counts = { all: orders.length };
  for (const s of ORDER_STATUSES) counts[s] = orders.filter((o) => o.status === s).length;
  return counts;
}

export function filterOrders(orders, { status = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return orders.filter((o) => (status === 'all' || o.status === status)
    && (!q || o.topic.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.type.toLowerCase().includes(q)));
}

/** Days between order and completion, or null when not completed. */
export function leadDays(order) {
  if (!order.completedDate) return null;
  const ms = Date.parse(`${order.completedDate}T00:00:00Z`) - Date.parse(`${order.date}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function filterPortfolio(items, filter) {
  return filter === 'all' ? items : items.filter((i) => i.category === filter);
}
