// 스마트셀러 — pure business logic and demo data.
// No DOM access here: app.js renders, this module computes. Covered by tests/core.test.mjs.

export const CATEGORY_FEES = {
    '패션': 5.5, '뷰티': 4.0, '생활': 6.0, '전자기기': 3.5, '식품': 7.0, '기타': 5.0
};

export const CATEGORY_LABELS = {
    '패션': '패션', '뷰티': '뷰티', '생활': '생활/주방', '전자기기': '전자기기', '식품': '식품', '기타': '기타'
};

export const SUPPLIERS = ['도매매', '도매꾹'];

// Demo catalogue. Photos are generated illustrations of generic, unbranded products.
export const MOCK_PRODUCTS = [
    { id: 'P001', name: '여성 플리스 후리스 자켓 겨울 아우터', category: '패션', wholesalePrice: 12000, retailPrice: 29900, supplier: '도매매', alt: '베이지색 플리스 집업 자켓' },
    { id: 'P002', name: '남성 기능성 스포츠 반팔 티셔츠', category: '패션', wholesalePrice: 5500, retailPrice: 15900, supplier: '도매꾹', alt: '네이비 반팔 티셔츠' },
    { id: 'P003', name: '비타민C 세럼 30ml 피부관리', category: '뷰티', wholesalePrice: 3200, retailPrice: 12900, supplier: '도매매', alt: '갈색 유리 스포이트 세럼 병' },
    { id: 'P004', name: '히알루론산 수분크림 50ml', category: '뷰티', wholesalePrice: 4500, retailPrice: 18900, supplier: '도매꾹', alt: '흰색 크림 용기' },
    { id: 'P005', name: '무선 블루투스 이어폰 5.3', category: '전자기기', wholesalePrice: 8000, retailPrice: 24900, supplier: '도매매', alt: '흰색 무선 이어폰과 충전 케이스' },
    { id: 'P006', name: '스테인리스 텀블러 500ml 보온보냉', category: '생활', wholesalePrice: 4000, retailPrice: 15900, supplier: '도매꾹', alt: '세이지 그린 스테인리스 텀블러' },
    { id: 'P007', name: '실리콘 주방 조리도구 5종 세트', category: '생활', wholesalePrice: 6500, retailPrice: 19900, supplier: '도매매', alt: '회색 실리콘 조리도구 다섯 개' },
    { id: 'P008', name: '프리미엄 견과류 믹스넛 1kg', category: '식품', wholesalePrice: 9000, retailPrice: 22900, supplier: '도매꾹', alt: '견과류가 담긴 유리병' },
    { id: 'P009', name: 'LED 무드등 조명 인테리어 램프', category: '전자기기', wholesalePrice: 5000, retailPrice: 16900, supplier: '도매매', alt: '버섯 모양 LED 무드등' },
    { id: 'P010', name: '접이식 경량 우산 자동 3단', category: '생활', wholesalePrice: 3500, retailPrice: 12900, supplier: '도매꾹', alt: '접힌 검정 3단 우산' },
    { id: 'P011', name: '유기농 그래놀라 시리얼 500g', category: '식품', wholesalePrice: 4800, retailPrice: 13900, supplier: '도매매', alt: '크라프트 봉투와 그래놀라' },
    { id: 'P012', name: '여성 크로스백 미니 숄더백', category: '패션', wholesalePrice: 7000, retailPrice: 23900, supplier: '도매꾹', alt: '베이지 미니 크로스백' },
    { id: 'P013', name: '폼클렌징 약산성 150ml', category: '뷰티', wholesalePrice: 2800, retailPrice: 11900, supplier: '도매매', alt: '흰색 클렌징 튜브' },
    { id: 'P014', name: 'C타입 고속 충전 케이블 2m', category: '전자기기', wholesalePrice: 1500, retailPrice: 7900, supplier: '도매꾹', alt: '감긴 흰색 USB-C 케이블' },
    { id: 'P015', name: '다용도 수납 정리함 3단', category: '생활', wholesalePrice: 5500, retailPrice: 17900, supplier: '도매매', alt: '투명 3단 서랍 정리함' },
    { id: 'P016', name: '남성 슬림핏 청바지 데님', category: '패션', wholesalePrice: 11000, retailPrice: 32900, supplier: '도매꾹', alt: '개어 놓은 인디고 청바지' },
    { id: 'P017', name: '선크림 SPF50+ PA++++ 50ml', category: '뷰티', wholesalePrice: 3800, retailPrice: 15900, supplier: '도매매', alt: '흰색 선크림 튜브' },
    { id: 'P018', name: '저칼로리 곤약젤리 10개입', category: '식품', wholesalePrice: 3000, retailPrice: 9900, supplier: '도매꾹', alt: '파스텔색 곤약젤리 파우치' },
];

export const MOCK_CUSTOMER_NAMES = ['김민수', '이지은', '박서준', '최유리', '정도현', '한소희', '오준혁', '신민아', '강태호', '윤서영', '임채원', '조하나'];
export const MOCK_ADDRESSES = ['서울시 강남구', '부산시 해운대구', '인천시 남동구', '대구시 수성구', '광주시 서구', '대전시 유성구', '울산시 남구', '경기도 성남시'];

export const KEYWORD_DATA = {
    '여성 원피스': { monthly: 145000, competition: '높음', trend: '상승', related: ['여름 원피스', '데이트 원피스', '롱 원피스', '플라워 원피스', '하객룩 원피스', '니트 원피스', '셔츠 원피스'] },
    '무선 이어폰': { monthly: 220000, competition: '높음', trend: '유지', related: ['블루투스 이어폰', '노이즈캔슬링 이어폰', '가성비 이어폰', '운동용 이어폰', '오픈형 이어폰', '에어팟 대안', '이어폰 추천'] },
    '텀블러': { monthly: 89000, competition: '중간', trend: '상승', related: ['보온 텀블러', '스텐 텀블러', '대용량 텀블러', '빨대 텀블러', '예쁜 텀블러', '등산 텀블러', '사무실 텀블러'] },
    '비타민C 세럼': { monthly: 67000, competition: '중간', trend: '상승', related: ['세럼 추천', '미백 세럼', '피부결 세럼', '모공 세럼', '저자극 세럼', '수분 세럼', '안티에이징 세럼'] },
    '수납 정리함': { monthly: 52000, competition: '낮음', trend: '유지', related: ['옷 수납함', '서랍 정리함', '화장품 정리함', '냉장고 정리함', '책상 정리함', '신발 정리함', '주방 정리함'] },
    '남성 반팔': { monthly: 178000, competition: '높음', trend: '계절성', related: ['오버핏 반팔', '무지 반팔', '쿨링 반팔', '기능성 반팔', '브랜드 반팔', '반팔 티셔츠', '린넨 반팔'] },
    '그래놀라': { monthly: 31000, competition: '낮음', trend: '상승', related: ['유기농 그래놀라', '다이어트 시리얼', '오트밀', '아사이볼', '단백질 시리얼', '저칼로리 간식', '아침대용'] },
};

export const ORDER_FLOW = ['신규주문', '처리중', '배송중', '배송완료'];
export const ORDER_STATUSES = [...ORDER_FLOW, '취소'];

// ─── Formatting ───────────────────────────────────────────

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function formatCurrency(num) {
    const n = Math.round(Number(num) || 0);
    return (n < 0 ? '-₩' : '₩') + Math.abs(n).toLocaleString('ko-KR');
}

export function formatNumber(num) {
    return Math.round(Number(num) || 0).toLocaleString('ko-KR');
}

export function toInt(value) {
    const n = parseInt(String(value ?? '').replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
}

// ─── Margin maths (Naver category fee applied everywhere) ──

export function feeRateOf(category) {
    return CATEGORY_FEES[category] ?? CATEGORY_FEES['기타'];
}

export function productEconomics(wholesale, retail, category) {
    const feeRate = feeRateOf(category);
    const fee = retail * (feeRate / 100);
    const profit = retail - wholesale - fee;
    const margin = retail > 0 ? (profit / retail) * 100 : 0;
    return { feeRate, fee, profit, margin };
}

export function calcProfit({ cost, price, shipping = 0, quantity = 1, feeRate }) {
    const fee = price * (feeRate / 100);
    const unitProfit = price - cost - fee - shipping;
    const marginRate = price > 0 ? (unitProfit / price) * 100 : 0;
    const qty = Math.max(1, quantity);
    return {
        fee,
        unitProfit,
        marginRate,
        monthlyRevenue: price * qty,
        monthlyFee: fee * qty,
        monthlyShipping: shipping * qty,
        monthlyProfit: unitProfit * qty,
        quantity: qty,
        isProfit: unitProfit > 0,
        // Share of the sale price taken by each cost; profit share is never negative.
        shares: price > 0 ? {
            cost: (cost / price) * 100,
            fee: (fee / price) * 100,
            shipping: (shipping / price) * 100,
            profit: Math.max(0, marginRate),
        } : { cost: 0, fee: 0, shipping: 0, profit: 0 },
    };
}

export function validateCalcInput({ cost, price }) {
    const errors = {};
    if (!(cost > 0)) errors.cost = '매입가를 1원 이상 입력해주세요';
    if (!(price > 0)) errors.price = '판매가를 1원 이상 입력해주세요';
    return errors;
}

// ─── Sourcing screener ────────────────────────────────────

export const SORTS = {
    margin: { label: '마진율 높은순', compare: (a, b) => b.margin - a.margin },
    profit: { label: '순수익 높은순', compare: (a, b) => b.profit - a.profit },
    cost: { label: '매입가 낮은순', compare: (a, b) => a.wholesalePrice - b.wholesalePrice },
    price: { label: '판매가 낮은순', compare: (a, b) => a.retailPrice - b.retailPrice },
    name: { label: '상품명순', compare: (a, b) => a.name.localeCompare(b.name, 'ko') },
};

export function screenProducts(products, { supplier = 'all', category = 'all', minMargin = 0, query = '', sort = 'margin' } = {}) {
    const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
    const rows = products
        .map(p => ({ ...p, ...productEconomics(p.wholesalePrice, p.retailPrice, p.category) }))
        .filter(p => {
            if (supplier !== 'all' && p.supplier !== supplier) return false;
            if (category !== 'all' && p.category !== category) return false;
            if (q && !p.name.toLowerCase().includes(q)) return false;
            return p.margin >= minMargin;
        });
    const sorter = SORTS[sort] || SORTS.margin;
    return rows.sort(sorter.compare);
}

// ─── Orders ───────────────────────────────────────────────

export function nextStatus(current) {
    const idx = ORDER_FLOW.indexOf(current);
    return idx >= 0 && idx < ORDER_FLOW.length - 1 ? ORDER_FLOW[idx + 1] : current;
}

export function canAdvance(order) {
    return ORDER_FLOW.includes(order.status) && order.status !== '배송완료';
}

export function canCancel(order) {
    return order.status === '신규주문' || order.status === '처리중';
}

export function countByStatus(orders) {
    const counts = Object.fromEntries(ORDER_STATUSES.map(s => [s, 0]));
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
}

export function filterOrders(orders, { status = 'all', query = '' } = {}) {
    const q = query.trim().toLowerCase();
    return orders.filter(o => {
        if (status !== 'all' && o.status !== status) return false;
        if (!q) return true;
        return [o.id, o.productName, o.customerName, o.address, o.trackingNumber]
            .some(v => String(v || '').toLowerCase().includes(q));
    });
}

// ─── Deterministic demo data ──────────────────────────────
// Demo numbers are seeded, so the same keyword or period always shows the same figures.

export function hashSeed(text) {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.codePointAt(0);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

export function seededRandom(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeRng(seedText) {
    const rand = seededRandom(hashSeed(seedText));
    return {
        int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
        pick: arr => arr[Math.floor(rand() * arr.length)],
    };
}

const COMPETITION_SCORE = { '낮음': [80, 95], '중간': [50, 79], '높음': [20, 49] };

export function keywordReport(keyword) {
    const kw = keyword.trim().replace(/\s+/g, ' ');
    const rng = makeRng('kw:' + kw);
    const known = KEYWORD_DATA[kw];
    const base = known || {
        monthly: rng.int(10000, 200000),
        competition: rng.pick(['낮음', '중간', '높음']),
        trend: rng.pick(['상승', '유지', '하락']),
        related: (() => {
            const prefixes = ['가성비', '프리미엄', '추천', '인기', '베스트', '신상', '할인'];
            const suffixes = ['추천', '순위', '비교', '리뷰', '가격', '할인', '후기'];
            const first = kw.split(' ')[0];
            const list = [];
            for (let i = 0; list.length < 7 && i < 40; i++) {
                const cand = i < 3 ? `${rng.pick(prefixes)} ${kw}` : i < 5 ? `${kw} ${rng.pick(suffixes)}` : `${first} ${rng.pick(suffixes)}`;
                if (!list.includes(cand) && cand !== kw) list.push(cand);
            }
            return list;
        })(),
    };
    const related = base.related.map(term => {
        const comp = rng.pick(['낮음', '중간', '높음']);
        const [lo, hi] = COMPETITION_SCORE[comp];
        return { term, monthly: rng.int(5000, Math.max(5000, base.monthly)), competition: comp, score: rng.int(lo, hi) };
    });
    const stars = base.competition === '낮음' ? 3 : base.competition === '중간' ? 2 : 1;
    return { keyword: kw, monthly: base.monthly, competition: base.competition, trend: base.trend, stars, related };
}

const SALES_CATEGORIES = ['패션', '뷰티', '생활', '전자기기', '식품'];

function dayLabel(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// One seeded sales history per calendar day; periods are windows onto the same history.
export function salesHistory(totalDays, today = new Date()) {
    const out = [];
    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const rng = makeRng('day:' + date.toISOString().slice(0, 10));
        const orders = rng.int(3, 15);
        const revenue = orders * rng.int(15000, 35000);
        out.push({
            date: dayLabel(date),
            orders,
            revenue,
            profit: Math.round(revenue * (rng.int(15, 35) / 100)),
            category: rng.pick(SALES_CATEGORIES),
        });
    }
    return out;
}

export function summarize(days) {
    const revenue = days.reduce((s, d) => s + d.revenue, 0);
    const orders = days.reduce((s, d) => s + d.orders, 0);
    const profit = days.reduce((s, d) => s + d.profit, 0);
    return { revenue, orders, profit, margin: revenue > 0 ? (profit / revenue) * 100 : 0 };
}

export function pctChange(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
}

export function analyticsReport(period, today = new Date()) {
    const history = salesHistory(period * 2, today);
    const previous = history.slice(0, period);
    const current = history.slice(period);
    const now = summarize(current);
    const before = summarize(previous);
    const byCategory = {};
    current.forEach(d => { byCategory[d.category] = (byCategory[d.category] || 0) + d.revenue; });
    const categoryShare = Object.entries(byCategory)
        .map(([category, revenue]) => ({ category, revenue, share: now.revenue ? (revenue / now.revenue) * 100 : 0 }))
        .sort((a, b) => b.revenue - a.revenue);
    const rng = makeRng('best:' + period + ':' + dayLabel(today));
    const bestsellers = MOCK_PRODUCTS
        .map(p => ({ ...p, sales: rng.int(20, 100) }))
        .map(p => ({ ...p, revenue: p.retailPrice * p.sales }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    return {
        days: current,
        totals: now,
        change: {
            revenue: pctChange(now.revenue, before.revenue),
            orders: pctChange(now.orders, before.orders),
            profit: pctChange(now.profit, before.profit),
            margin: now.margin - before.margin,
        },
        categoryShare,
        bestsellers,
    };
}

// ─── Listing copy generator (template based, demo) ────────

// Naver Shopping's product-name guidance discourages promotional phrases (무료배송, 특가, 1위 …)
// and unverifiable claims in the name, so the title is the product name plus one plain
// category search term, never a bracketed promo prefix. `pick` chooses among neutral terms.
export function generateTitle(name, category, pick = list => list[0]) {
    const terms = {
        '패션': ['데일리', '데일리룩'],
        '뷰티': ['스킨케어', '데일리 스킨케어'],
        '생활': ['생활용품', '리빙'],
        '전자기기': ['IT 액세서리', '생활가전'],
        '식품': ['간식', '간편식'],
    };
    const clean = String(name).replace(/\s+/g, ' ').trim();
    const options = (terms[category] || []).filter(t => !clean.includes(t));
    return options.length ? `${clean} ${pick(options)}` : clean;
}

export function generateKeywords(name, category) {
    const words = name.split(' ').filter(w => w.length > 1);
    const categoryKws = {
        '패션': ['패션', '코디', 'OOTD', '데일리룩', '스타일'],
        '뷰티': ['뷰티', '스킨케어', '피부관리', '화장품', '더마'],
        '생활': ['생활용품', '인테리어', '리빙', '수납', '정리'],
        '전자기기': ['가전', '전자기기', 'IT', '가성비', '최신'],
        '식품': ['건강식품', '간식', '맛집', '유기농', '홈쿠킹']
    };
    return [...new Set([...words.slice(0, 4), ...(categoryKws[category] || []).slice(0, 3)])];
}

export function generateHashtags(name, category) {
    const words = name.split(' ').filter(w => w.length > 1);
    const extras = {
        '패션': ['#패션스타그램', '#오오티디', '#데일리룩', '#코디추천'],
        '뷰티': ['#뷰티스타그램', '#스킨케어', '#화장품추천', '#피부관리'],
        '생활': ['#리빙템', '#집꾸미기', '#생활꿀템', '#가성비'],
        '전자기기': ['#테크', '#IT기기', '#가성비템', '#전자기기'],
        '식품': ['#먹스타그램', '#건강식', '#홈쿠킹', '#맛있는거']
    };
    return [...new Set([...words.map(w => '#' + w.replace(/\s/g, '')), ...(extras[category] || []).slice(0, 3)])];
}

export const TABS = [
    { id: 'sourcing', code: '1001', label: '상품 소싱' },
    { id: 'listing', code: '1002', label: 'AI 등록' },
    { id: 'orders', code: '2001', label: '주문 관리' },
    { id: 'calculator', code: '3001', label: '수익 계산' },
    { id: 'keywords', code: '4001', label: '키워드' },
    { id: 'analytics', code: '5001', label: '매출 분석' },
];

// Resolves a URL hash, screen code (1001) or position (1-6) to a tab id.
export function resolveTab(input) {
    const value = String(input || '').replace(/^#/, '').trim();
    const byId = TABS.find(t => t.id === value);
    if (byId) return byId.id;
    const byCode = TABS.find(t => t.code === value);
    if (byCode) return byCode.id;
    const n = parseInt(value, 10);
    if (String(n) === value && n >= 1 && n <= TABS.length) return TABS[n - 1].id;
    return null;
}
