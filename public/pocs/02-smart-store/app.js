// ============================================================
// 스마트셀러 - 네이버 스마트스토어 위탁판매 관리 도구 POC
// ============================================================

(function () {
    'use strict';

    // ─── Constants & Mock Data ───────────────────────────────

    const CATEGORY_FEES = {
        '패션': 5.5, '뷰티': 4.0, '생활': 6.0, '전자기기': 3.5, '식품': 7.0, '기타': 5.0
    };

    const CATEGORY_EMOJI = {
        '패션': '👗', '뷰티': '💄', '생활': '🏠', '전자기기': '📱', '식품': '🍜'
    };

    const MOCK_PRODUCTS = [
        { id: 'P001', name: '여성 플리스 후리스 자켓 겨울 아우터', category: '패션', wholesalePrice: 12000, retailPrice: 29900, supplier: '도매매', emoji: '🧥' },
        { id: 'P002', name: '남성 기능성 스포츠 반팔 티셔츠', category: '패션', wholesalePrice: 5500, retailPrice: 15900, supplier: '도매꾹', emoji: '👕' },
        { id: 'P003', name: '비타민C 세럼 30ml 피부관리', category: '뷰티', wholesalePrice: 3200, retailPrice: 12900, supplier: '도매매', emoji: '💧' },
        { id: 'P004', name: '히알루론산 수분크림 50ml', category: '뷰티', wholesalePrice: 4500, retailPrice: 18900, supplier: '도매꾹', emoji: '🧴' },
        { id: 'P005', name: '무선 블루투스 이어폰 5.3', category: '전자기기', wholesalePrice: 8000, retailPrice: 24900, supplier: '도매매', emoji: '🎧' },
        { id: 'P006', name: '스테인리스 텀블러 500ml 보온보냉', category: '생활', wholesalePrice: 4000, retailPrice: 15900, supplier: '도매꾹', emoji: '🥤' },
        { id: 'P007', name: '실리콘 주방 조리도구 5종 세트', category: '생활', wholesalePrice: 6500, retailPrice: 19900, supplier: '도매매', emoji: '🍳' },
        { id: 'P008', name: '프리미엄 견과류 믹스넛 1kg', category: '식품', wholesalePrice: 9000, retailPrice: 22900, supplier: '도매꾹', emoji: '🥜' },
        { id: 'P009', name: 'LED 무드등 조명 인테리어 램프', category: '전자기기', wholesalePrice: 5000, retailPrice: 16900, supplier: '도매매', emoji: '💡' },
        { id: 'P010', name: '접이식 경량 우산 자동 3단', category: '생활', wholesalePrice: 3500, retailPrice: 12900, supplier: '도매꾹', emoji: '☂️' },
        { id: 'P011', name: '유기농 그래놀라 시리얼 500g', category: '식품', wholesalePrice: 4800, retailPrice: 13900, supplier: '도매매', emoji: '🥣' },
        { id: 'P012', name: '여성 크로스백 미니 숄더백', category: '패션', wholesalePrice: 7000, retailPrice: 23900, supplier: '도매꾹', emoji: '👜' },
        { id: 'P013', name: '폼클렌징 약산성 150ml', category: '뷰티', wholesalePrice: 2800, retailPrice: 11900, supplier: '도매매', emoji: '🧼' },
        { id: 'P014', name: 'C타입 고속 충전 케이블 2m', category: '전자기기', wholesalePrice: 1500, retailPrice: 7900, supplier: '도매꾹', emoji: '🔌' },
        { id: 'P015', name: '다용도 수납 정리함 3단', category: '생활', wholesalePrice: 5500, retailPrice: 17900, supplier: '도매매', emoji: '📦' },
        { id: 'P016', name: '남성 슬림핏 청바지 데님', category: '패션', wholesalePrice: 11000, retailPrice: 32900, supplier: '도매꾹', emoji: '👖' },
        { id: 'P017', name: '선크림 SPF50+ PA++++ 50ml', category: '뷰티', wholesalePrice: 3800, retailPrice: 15900, supplier: '도매매', emoji: '☀️' },
        { id: 'P018', name: '저칼로리 곤약젤리 10개입', category: '식품', wholesalePrice: 3000, retailPrice: 9900, supplier: '도매꾹', emoji: '🍬' },
    ];

    const MOCK_CUSTOMER_NAMES = ['김민수', '이지은', '박서준', '최유리', '정도현', '한소희', '오준혁', '신민아', '강태호', '윤서영', '임채원', '조하나'];
    const MOCK_ADDRESSES = ['서울시 강남구', '부산시 해운대구', '인천시 남동구', '대구시 수성구', '광주시 서구', '대전시 유성구', '울산시 남구', '경기도 성남시'];

    const KEYWORD_DATA = {
        '여성 원피스': { monthly: 145000, competition: '높음', trend: '상승', related: ['여름 원피스', '데이트 원피스', '롱 원피스', '플라워 원피스', '하객룩 원피스', '니트 원피스', '셔츠 원피스'] },
        '무선 이어폰': { monthly: 220000, competition: '높음', trend: '유지', related: ['블루투스 이어폰', '노이즈캔슬링 이어폰', '가성비 이어폰', '운동용 이어폰', '오픈형 이어폰', '에어팟 대안', '이어폰 추천'] },
        '텀블러': { monthly: 89000, competition: '중간', trend: '상승', related: ['보온 텀블러', '스텐 텀블러', '대용량 텀블러', '빨대 텀블러', '예쁜 텀블러', '등산 텀블러', '사무실 텀블러'] },
        '비타민C 세럼': { monthly: 67000, competition: '중간', trend: '상승', related: ['세럼 추천', '미백 세럼', '피부결 세럼', '모공 세럼', '저자극 세럼', '수분 세럼', '안티에이징 세럼'] },
        '수납 정리함': { monthly: 52000, competition: '낮음', trend: '유지', related: ['옷 수납함', '서랍 정리함', '화장품 정리함', '냉장고 정리함', '책상 정리함', '신발 정리함', '주방 정리함'] },
        '남성 반팔': { monthly: 178000, competition: '높음', trend: '계절성', related: ['오버핏 반팔', '무지 반팔', '쿨링 반팔', '기능성 반팔', '브랜드 반팔', '반팔 티셔츠', '린넨 반팔'] },
        '그래놀라': { monthly: 31000, competition: '낮음', trend: '상승', related: ['유기농 그래놀라', '다이어트 시리얼', '오트밀', '아사이볼', '단백질 시리얼', '저칼로리 간식', '아침대용'] },
    };

    // ─── State Management ────────────────────────────────────

    const STATE_KEY = 'smartseller_state';

    function loadState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('State load error', e);
        }
        return { orders: [], listings: [], savedKeywords: [], calcHistory: [] };
    }

    function saveState() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('State save error', e);
        }
    }

    let state = loadState();

    // ─── Utility Functions ───────────────────────────────────

    function formatCurrency(num) {
        return '₩' + Math.round(num).toLocaleString('ko-KR');
    }

    function formatNumber(num) {
        return Math.round(num).toLocaleString('ko-KR');
    }

    function calcMargin(wholesale, retail, category) {
        const feeRate = CATEGORY_FEES[category] || 5.0;
        const fee = retail * (feeRate / 100);
        const profit = retail - wholesale - fee;
        return ((profit / retail) * 100);
    }

    function getMarginColor(margin) {
        if (margin >= 30) return '#22c55e';
        if (margin >= 20) return '#eab308';
        if (margin >= 10) return '#f97316';
        return '#ef4444';
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case '신규주문': return 'badge-new';
            case '처리중': return 'badge-processing';
            case '배송중': return 'badge-shipping';
            case '배송완료': return 'badge-complete';
            case '취소': return 'badge-cancel';
            default: return '';
        }
    }

    function nextStatus(current) {
        const flow = ['신규주문', '처리중', '배송중', '배송완료'];
        const idx = flow.indexOf(current);
        return idx < flow.length - 1 ? flow[idx + 1] : current;
    }

    // ─── Tab Navigation ──────────────────────────────────────

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('active'); });
            tab.classList.add('active');
            const target = document.getElementById('tab-' + tab.dataset.tab);
            target.classList.remove('hidden');
            target.classList.add('active');

            if (tab.dataset.tab === 'analytics') renderAnalytics();
            if (tab.dataset.tab === 'orders') renderOrders();
            if (tab.dataset.tab === 'listing') renderListings();
            if (tab.dataset.tab === 'keywords') renderSavedKeywords();
        });
    });

    // ─── 1. Product Sourcing ─────────────────────────────────

    function renderSourcingGrid() {
        const supplier = document.getElementById('sourcingSupplier').value;
        const category = document.getElementById('sourcingCategory').value;
        const minMargin = parseInt(document.getElementById('marginFilter').value);
        document.getElementById('marginFilterValue').textContent = minMargin + '%';

        let filtered = MOCK_PRODUCTS.filter(p => {
            if (supplier !== 'all' && p.supplier !== supplier) return false;
            if (category !== 'all' && p.category !== category) return false;
            const margin = calcMargin(p.wholesalePrice, p.retailPrice, p.category);
            return margin >= minMargin;
        });

        document.getElementById('productCount').textContent = filtered.length + '개 상품';

        const grid = document.getElementById('sourcingGrid');
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10">조건에 맞는 상품이 없습니다</div>';
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const margin = calcMargin(p.wholesalePrice, p.retailPrice, p.category);
            const marginColor = getMarginColor(margin);
            const profit = p.retailPrice - p.wholesalePrice - (p.retailPrice * (CATEGORY_FEES[p.category] || 5) / 100);
            return `
                <div class="product-card">
                    <div class="product-img">
                        <span>${p.emoji}</span>
                    </div>
                    <div class="p-4">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${p.supplier}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${p.category}</span>
                        </div>
                        <h4 class="font-medium text-sm text-gray-900 mb-2 line-clamp-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</h4>
                        <div class="flex justify-between items-end mb-2">
                            <div>
                                <div class="text-xs text-gray-400">매입가</div>
                                <div class="text-sm font-semibold">${formatCurrency(p.wholesalePrice)}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-gray-400">판매가</div>
                                <div class="text-sm font-semibold text-naver">${formatCurrency(p.retailPrice)}</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-500">예상 마진율</span>
                                <span class="font-bold" style="color:${marginColor}">${margin.toFixed(1)}%</span>
                            </div>
                            <div class="margin-bar">
                                <div class="margin-bar-fill" style="width:${Math.min(margin, 50) * 2}%;background:${marginColor}"></div>
                            </div>
                            <div class="text-xs text-gray-400 mt-1">예상 순수익: ${formatCurrency(profit)}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="selectForListing('${p.id}')" class="flex-1 bg-naver hover:bg-naver-dark text-white text-xs font-medium py-2 rounded-lg transition-colors">
                                ✨ AI 등록
                            </button>
                            <button onclick="showProductDetail('${p.id}')" class="px-3 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                                상세
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    document.getElementById('sourcingSupplier').addEventListener('change', renderSourcingGrid);
    document.getElementById('sourcingCategory').addEventListener('change', renderSourcingGrid);
    document.getElementById('marginFilter').addEventListener('input', renderSourcingGrid);

    window.showProductDetail = function (id) {
        const p = MOCK_PRODUCTS.find(x => x.id === id);
        if (!p) return;
        const margin = calcMargin(p.wholesalePrice, p.retailPrice, p.category);
        const fee = p.retailPrice * (CATEGORY_FEES[p.category] || 5) / 100;
        const profit = p.retailPrice - p.wholesalePrice - fee;

        document.getElementById('modalTitle').textContent = p.name;
        document.getElementById('modalContent').innerHTML = `
            <div class="text-center text-6xl mb-4">${p.emoji}</div>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">도매처</span><span class="font-medium">${p.supplier}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">카테고리</span><span class="font-medium">${p.category}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">매입가</span><span class="font-medium">${formatCurrency(p.wholesalePrice)}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">권장 판매가</span><span class="font-bold text-naver">${formatCurrency(p.retailPrice)}</span></div>
                <hr>
                <div class="flex justify-between"><span class="text-gray-500">네이버 수수료 (${CATEGORY_FEES[p.category] || 5}%)</span><span class="text-red-500">-${formatCurrency(fee)}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">예상 순수익</span><span class="font-bold text-naver">${formatCurrency(profit)}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">마진율</span><span class="font-bold" style="color:${getMarginColor(margin)}">${margin.toFixed(1)}%</span></div>
            </div>
            <button onclick="selectForListing('${p.id}')" class="w-full mt-4 bg-naver hover:bg-naver-dark text-white font-semibold py-3 rounded-lg transition-colors">
                ✨ AI 등록하기
            </button>
        `;
        document.getElementById('productModal').classList.add('show');
    };

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('show');
    });
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
    });

    // ─── 2. AI Listing Creator ───────────────────────────────

    window.selectForListing = function (id) {
        const p = MOCK_PRODUCTS.find(x => x.id === id);
        if (!p) return;

        // Switch to listing tab
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('active'); });
        document.querySelector('[data-tab="listing"]').classList.add('active');
        document.getElementById('tab-listing').classList.remove('hidden');
        document.getElementById('tab-listing').classList.add('active');

        // Fill form
        document.getElementById('listingOriginalName').value = p.name;
        document.getElementById('listingCategory').value = p.category;
        document.getElementById('listingCost').value = p.wholesalePrice;
        document.getElementById('listingPrice').value = p.retailPrice;

        document.getElementById('listingSourceProduct').innerHTML = `
            <div class="text-center">
                <span class="text-5xl">${p.emoji}</span>
                <p class="font-medium mt-2">${p.name}</p>
                <p class="text-sm text-gray-500 mt-1">${p.supplier} | ${formatCurrency(p.wholesalePrice)}</p>
            </div>
        `;

        document.getElementById('productModal').classList.remove('show');
        showToast('상품이 선택되었습니다. AI 생성 버튼을 눌러주세요!');
    };

    document.getElementById('generateListingBtn').addEventListener('click', () => {
        const name = document.getElementById('listingOriginalName').value.trim();
        const category = document.getElementById('listingCategory').value;
        if (!name) { showToast('상품명을 입력해주세요'); return; }

        const btn = document.getElementById('generateListingBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-dots">AI 생성 중</span>';

        // Simulate AI generation delay
        setTimeout(() => {
            const aiTitle = generateAITitle(name, category);
            const aiDesc = generateAIDescription(name, category);
            const aiKws = generateAIKeywords(name, category);
            const aiTags = generateAIHashtags(name, category);

            document.getElementById('aiTitle').textContent = aiTitle;
            document.getElementById('aiDescription').textContent = aiDesc;
            document.getElementById('aiKeywords').innerHTML = aiKws.map(k =>
                `<span class="px-2 py-1 bg-naver-light text-naver text-xs rounded-full font-medium">${k}</span>`
            ).join('');
            document.getElementById('aiHashtags').textContent = aiTags.join(' ');

            document.getElementById('aiResultPlaceholder').classList.add('hidden');
            document.getElementById('aiResult').classList.remove('hidden');

            btn.disabled = false;
            btn.innerHTML = '<span>✨</span> AI 상품 설명 생성';
            showToast('AI 상품 설명이 생성되었습니다!');
        }, 1500);
    });

    function generateAITitle(name, category) {
        const prefixes = {
            '패션': ['[오늘출발]', '[베스트셀러]', '[시즌특가]'],
            '뷰티': ['[피부과추천]', '[1+1특가]', '[인기급상승]'],
            '생활': ['[만족도1위]', '[실용적]', '[가성비갑]'],
            '전자기기': ['[최신형]', '[정품보장]', '[당일배송]'],
            '식품': ['[유기농]', '[맛보장]', '[건강한선택]'],
        };
        const suffixes = ['무료배송', '당일출고', '국내발송', '사은품증정', '한정특가'];
        const prefix = randomChoice(prefixes[category] || ['[추천]']);
        const suffix = randomChoice(suffixes);
        return `${prefix} ${name} ${suffix}`;
    }

    function generateAIDescription(name, category) {
        const templates = {
            '패션': `✨ ${name} ✨

🎯 이런 분께 추천드려요!
• 트렌디한 스타일을 원하시는 분
• 편안하면서도 세련된 룩을 찾으시는 분
• 다양한 코디에 활용하고 싶으신 분

📋 상품 특징
• 부드러운 촉감의 프리미엄 원단 사용
• 체형 커버에 탁월한 실루엣
• 사계절 착용 가능한 베이직 디자인
• 세탁 후에도 변형 없는 뛰어난 내구성

📐 사이즈 가이드
FREE 사이즈 (55~77)

🚚 배송 안내
• 결제 확인 후 1~2일 이내 출고
• 무료 배송 (도서산간 추가 3,000원)

💬 교환/반품
• 수령 후 7일 이내 가능
• 단순 변심 시 반품 배송비 고객 부담`,
            '뷰티': `💎 ${name} 💎

✅ 주요 성분 & 효능
• 고농축 유효 성분 함유
• 피부 장벽 강화 및 수분 공급
• 민감한 피부에도 안심 사용
• 무향료, 무색소, 무파라벤

📌 이런 피부 고민에 추천!
• 건조하고 당기는 피부
• 칙칙하고 톤이 고르지 않은 피부
• 모공 및 피부결 고민

🧪 사용 방법
1. 세안 후 토너로 피부결 정돈
2. 적당량을 손에 덜어 얼굴에 도포
3. 가볍게 두드려 흡수시키기

📦 제품 정보
• 용량: 50ml
• 사용 기한: 제조일로부터 24개월

🚚 당일 출고 (평일 오후 2시 이전 주문 기준)`,
            '생활': `🏠 ${name} 🏠

💡 이 제품이 특별한 이유!
• 실용성과 디자인을 모두 잡았습니다
• 인체에 안전한 소재 사용
• 간편한 사용법과 쉬운 관리
• 어떤 인테리어에도 자연스러운 디자인

📋 상세 스펙
• 소재: 프리미엄 등급 소재 사용
• 크기: 실용적인 적정 사이즈
• 무게: 가벼워서 이동이 편리

🎯 이렇게 활용하세요!
• 가정에서 일상적으로 사용
• 사무실이나 캠핑에서도 활용
• 선물용으로도 적합

⭐ 고객 리뷰 평점 4.8/5.0
🚚 무료배송 | 당일출고`,
            '전자기기': `📱 ${name} 📱

🔋 핵심 스펙
• 최신 기술 적용
• 뛰어난 성능과 안정성
• 호환성 우수 (다양한 기기 지원)
• 긴 배터리 수명 / 내구성

📦 패키지 구성
• 본품 1개
• 충전 케이블
• 사용 설명서
• 보증서

⚡ 주요 기능
• 빠른 연결 및 안정적인 통신
• 직관적인 사용법
• 스마트한 전력 관리
• 컴팩트한 휴대성

🛡️ 품질 보증
• 정품 인증 제품
• 1년 무상 A/S
• 불량 시 무료 교환

🚚 오늘 주문하면 내일 도착!`,
            '식품': `🍽️ ${name} 🍽️

🌿 이 제품의 특별함
• 엄선된 원재료만 사용
• 건강을 생각하는 레시피
• 맛과 영양을 동시에
• 간편하게 즐기는 프리미엄 식품

📋 영양 정보 (1회 제공량 기준)
• 칼로리: 적정 수준
• 단백질, 식이섬유 풍부
• 인공첨가물 무첨가

🍴 이렇게 드세요!
• 그대로 간식으로
• 요리 재료로 활용
• 아이들 간식으로도 안심

📦 보관 방법
• 직사광선을 피해 서늘한 곳에 보관
• 개봉 후 밀봉하여 냉장 보관

⭐ 재구매율 92%!
🚚 신선하게 당일 발송`
        };
        return templates[category] || templates['생활'];
    }

    function generateAIKeywords(name, category) {
        const words = name.split(' ').filter(w => w.length > 1);
        const categoryKws = {
            '패션': ['패션', '코디', 'OOTD', '데일리룩', '스타일'],
            '뷰티': ['뷰티', '스킨케어', '피부관리', '화장품', '더마'],
            '생활': ['생활용품', '인테리어', '리빙', '수납', '정리'],
            '전자기기': ['가전', '전자기기', 'IT', '가성비', '최신'],
            '식품': ['건강식품', '간식', '맛집', '유기농', '홈쿠킹']
        };
        const extras = categoryKws[category] || [];
        return [...words.slice(0, 4), ...extras.slice(0, 3)];
    }

    function generateAIHashtags(name, category) {
        const words = name.split(' ').filter(w => w.length > 1);
        const tags = words.map(w => '#' + w);
        const extras = {
            '패션': ['#패션스타그램', '#오오티디', '#데일리룩', '#코디추천'],
            '뷰티': ['#뷰티스타그램', '#스킨케어', '#화장품추천', '#피부관리'],
            '생활': ['#리빙템', '#집꾸미기', '#생활꿀템', '#가성비'],
            '전자기기': ['#테크', '#IT기기', '#가성비템', '#전자기기'],
            '식품': ['#먹스타그램', '#건강식', '#홈쿠킹', '#맛있는거']
        };
        return [...tags, ...(extras[category] || []).slice(0, 3)];
    }

    document.getElementById('saveListingBtn').addEventListener('click', () => {
        const listing = {
            id: generateId(),
            name: document.getElementById('aiTitle').textContent,
            originalName: document.getElementById('listingOriginalName').value,
            category: document.getElementById('listingCategory').value,
            cost: parseInt(document.getElementById('listingCost').value) || 0,
            price: parseInt(document.getElementById('listingPrice').value) || 0,
            description: document.getElementById('aiDescription').textContent,
            keywords: document.getElementById('aiKeywords').textContent,
            hashtags: document.getElementById('aiHashtags').textContent,
            status: '등록완료',
            createdAt: new Date().toISOString()
        };

        state.listings.push(listing);
        saveState();
        renderListings();
        showToast('상품이 등록되었습니다! 🎉');

        // Reset AI result
        document.getElementById('aiResult').classList.add('hidden');
        document.getElementById('aiResultPlaceholder').classList.remove('hidden');
        document.getElementById('listingOriginalName').value = '';
        document.getElementById('listingCost').value = '';
        document.getElementById('listingPrice').value = '';
    });

    function renderListings() {
        const table = document.getElementById('listingsTable');
        if (state.listings.length === 0) {
            table.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">등록된 상품이 없습니다</td></tr>';
            return;
        }
        table.innerHTML = state.listings.map(l => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium max-w-xs truncate">${l.name}</td>
                <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">${l.category}</td>
                <td class="px-4 py-3 text-sm text-right">${formatCurrency(l.cost)}</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-naver">${formatCurrency(l.price)}</td>
                <td class="px-4 py-3 text-center"><span class="badge badge-complete">${l.status}</span></td>
            </tr>
        `).join('');
    }

    // ─── 3. Order Management ─────────────────────────────────

    function addMockOrder() {
        const products = state.listings.length > 0 ? state.listings : MOCK_PRODUCTS.slice(0, 5);
        const product = randomChoice(products);
        const qty = randomInt(1, 3);
        const price = product.price || product.retailPrice;

        const order = {
            id: 'ORD-' + Date.now().toString().slice(-8),
            productName: product.name || product.originalName,
            customerName: randomChoice(MOCK_CUSTOMER_NAMES),
            address: randomChoice(MOCK_ADDRESSES),
            quantity: qty,
            unitPrice: price,
            totalPrice: price * qty,
            status: '신규주문',
            orderDate: new Date().toISOString(),
            trackingNumber: ''
        };

        state.orders.unshift(order);
        saveState();
        renderOrders();
        showToast('새 주문이 접수되었습니다! 🛒');
    }

    document.getElementById('addMockOrderBtn').addEventListener('click', addMockOrder);

    function renderOrders() {
        // Update counts
        const counts = { '신규주문': 0, '처리중': 0, '배송중': 0, '배송완료': 0 };
        state.orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
        document.getElementById('orderNewCount').textContent = counts['신규주문'];
        document.getElementById('orderProcessingCount').textContent = counts['처리중'];
        document.getElementById('orderShippingCount').textContent = counts['배송중'];
        document.getElementById('orderCompleteCount').textContent = counts['배송완료'];

        // Filter
        const activeFilter = document.querySelector('.order-filter-tab.active')?.dataset.filter || 'all';
        let filtered = state.orders;
        if (activeFilter !== 'all') {
            filtered = state.orders.filter(o => o.status === activeFilter);
        }

        const list = document.getElementById('orderList');
        if (filtered.length === 0) {
            list.innerHTML = '<div class="text-center text-gray-400 py-10">주문이 없습니다</div>';
            return;
        }

        list.innerHTML = filtered.map(o => {
            const date = new Date(o.orderDate);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            const canAdvance = o.status !== '배송완료' && o.status !== '취소';
            return `
                <div class="order-card">
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="badge ${getStatusBadgeClass(o.status)}">${o.status}</span>
                                <span class="text-xs text-gray-400">${o.id}</span>
                            </div>
                            <h4 class="text-sm font-medium truncate">${o.productName}</h4>
                            <div class="text-xs text-gray-500 mt-1">
                                ${o.customerName} · ${o.address} · ${o.quantity}개
                            </div>
                            <div class="text-xs text-gray-400 mt-1">${dateStr}</div>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <div class="text-sm font-bold text-naver">${formatCurrency(o.totalPrice)}</div>
                            ${canAdvance ? `<button onclick="advanceOrder('${o.id}')" class="mt-2 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">${nextStatus(o.status)}으로</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.advanceOrder = function (orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;
        const newStatus = nextStatus(order.status);
        order.status = newStatus;
        if (newStatus === '배송중') {
            order.trackingNumber = '6' + Math.random().toString().slice(2, 14);
        }
        saveState();
        renderOrders();
        showToast(`주문 상태: ${newStatus}`);
    };

    document.querySelectorAll('.order-filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.order-filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderOrders();
        });
    });

    // ─── 4. Profit Calculator ────────────────────────────────

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const category = document.getElementById('calcCategory').value;
        const cost = parseInt(document.getElementById('calcCost').value) || 0;
        const price = parseInt(document.getElementById('calcPrice').value) || 0;
        const shipping = parseInt(document.getElementById('calcShipping').value) || 0;
        const quantity = parseInt(document.getElementById('calcQuantity').value) || 1;

        if (cost <= 0 || price <= 0) { showToast('매입가와 판매가를 입력해주세요'); return; }

        const feeRate = parseFloat(category);
        const fee = price * (feeRate / 100);
        const unitProfit = price - cost - fee - shipping;
        const marginRate = (unitProfit / price * 100);
        const monthlyProfit = unitProfit * quantity;
        const monthlyRevenue = price * quantity;
        const totalFee = fee * quantity;
        const totalShipping = shipping * quantity;

        const isProfit = unitProfit > 0;

        document.getElementById('calcResult').innerHTML = `
            <!-- Summary -->
            <div class="p-4 rounded-xl ${isProfit ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} text-center mb-4">
                <div class="text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}">개당 순수익</div>
                <div class="text-3xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}">${formatCurrency(unitProfit)}</div>
                <div class="text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}">마진율 ${marginRate.toFixed(1)}%</div>
            </div>

            <!-- Breakdown -->
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">판매가</span>
                    <span class="font-medium">${formatCurrency(price)}</span>
                </div>
                <div class="flex justify-between text-red-500">
                    <span>- 매입가</span>
                    <span>${formatCurrency(cost)}</span>
                </div>
                <div class="flex justify-between text-red-500">
                    <span>- 네이버 수수료 (${feeRate}%)</span>
                    <span>${formatCurrency(fee)}</span>
                </div>
                <div class="flex justify-between text-red-500">
                    <span>- 배송비</span>
                    <span>${formatCurrency(shipping)}</span>
                </div>
                <hr>
                <div class="flex justify-between font-bold">
                    <span>= 개당 순수익</span>
                    <span class="${isProfit ? 'text-naver' : 'text-red-500'}">${formatCurrency(unitProfit)}</span>
                </div>
            </div>

            <!-- Monthly Projection -->
            <div class="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 class="font-semibold text-sm mb-3">📅 월간 예상 (${quantity}개 판매 기준)</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">월 매출</span>
                        <span class="font-medium">${formatCurrency(monthlyRevenue)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">월 수수료 합계</span>
                        <span class="text-red-500">-${formatCurrency(totalFee)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">월 배송비 합계</span>
                        <span class="text-red-500">-${formatCurrency(totalShipping)}</span>
                    </div>
                    <hr>
                    <div class="flex justify-between font-bold text-base">
                        <span>월 순수익</span>
                        <span class="${isProfit ? 'text-naver' : 'text-red-500'}">${formatCurrency(monthlyProfit)}</span>
                    </div>
                </div>
            </div>

            <!-- Visual bar -->
            <div class="mt-4">
                <div class="text-xs text-gray-500 mb-2">비용 구조</div>
                <div class="flex rounded-lg overflow-hidden h-8 text-xs font-medium">
                    <div class="bg-red-400 flex items-center justify-center text-white" style="width:${(cost / price * 100).toFixed(0)}%">${(cost / price * 100).toFixed(0)}%</div>
                    <div class="bg-orange-400 flex items-center justify-center text-white" style="width:${(fee / price * 100).toFixed(0)}%">${(fee / price * 100).toFixed(0)}%</div>
                    <div class="bg-yellow-400 flex items-center justify-center text-white" style="width:${(shipping / price * 100).toFixed(0)}%">${(shipping / price * 100).toFixed(0)}%</div>
                    <div class="${isProfit ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center text-white" style="width:${Math.max(0, marginRate).toFixed(0)}%">${marginRate.toFixed(0)}%</div>
                </div>
                <div class="flex text-xs mt-1 gap-3">
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400"></span>매입</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-400"></span>수수료</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400"></span>배송</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span>수익</span>
                </div>
            </div>
        `;

        // Add to history
        const categoryName = document.getElementById('calcCategory').selectedOptions[0].text.split('(')[0].trim();
        state.calcHistory.unshift({
            name: categoryName + ' 상품',
            cost, price, fee: fee.toFixed(0), profit: unitProfit.toFixed(0),
            margin: marginRate.toFixed(1)
        });
        if (state.calcHistory.length > 10) state.calcHistory = state.calcHistory.slice(0, 10);
        saveState();
        renderCalcHistory();
    });

    function renderCalcHistory() {
        const table = document.getElementById('calcHistoryTable');
        if (state.calcHistory.length === 0) {
            table.innerHTML = '<tr><td colspan="6" class="px-3 py-6 text-center text-gray-400">계산 내역이 없습니다</td></tr>';
            return;
        }
        table.innerHTML = state.calcHistory.map(h => {
            const profitColor = parseFloat(h.profit) > 0 ? 'text-naver' : 'text-red-500';
            return `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-3 py-2">${h.name}</td>
                    <td class="px-3 py-2 text-right">${formatCurrency(h.cost)}</td>
                    <td class="px-3 py-2 text-right">${formatCurrency(h.price)}</td>
                    <td class="px-3 py-2 text-right text-red-500">${formatCurrency(h.fee)}</td>
                    <td class="px-3 py-2 text-right font-medium ${profitColor}">${formatCurrency(h.profit)}</td>
                    <td class="px-3 py-2 text-right font-medium ${profitColor}">${h.margin}%</td>
                </tr>
            `;
        }).join('');
    }

    // ─── 5. Keyword Research ─────────────────────────────────

    document.getElementById('keywordSearchBtn').addEventListener('click', performKeywordSearch);
    document.getElementById('keywordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performKeywordSearch();
    });

    function performKeywordSearch() {
        const input = document.getElementById('keywordInput').value.trim();
        if (!input) { showToast('키워드를 입력해주세요'); return; }

        // Try exact match or generate mock data
        const data = KEYWORD_DATA[input] || generateMockKeywordData(input);

        const compColor = { '낮음': 'comp-low', '중간': 'comp-medium', '높음': 'comp-high' };
        const trendEmoji = { '상승': '📈', '유지': '➡️', '하락': '📉', '계절성': '🔄' };

        // Stats cards
        document.getElementById('keywordStats').innerHTML = `
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">월간 검색량</div>
                <div class="text-lg font-bold text-gray-900">${formatNumber(data.monthly)}</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">경쟁도</div>
                <div class="text-lg font-bold"><span class="badge ${compColor[data.competition]}">${data.competition}</span></div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">트렌드</div>
                <div class="text-lg font-bold">${trendEmoji[data.trend] || '➡️'} ${data.trend}</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">추천 점수</div>
                <div class="text-lg font-bold text-naver">${data.competition === '낮음' ? '⭐⭐⭐' : data.competition === '중간' ? '⭐⭐' : '⭐'}</div>
            </div>
        `;

        // Related keywords
        const relatedTable = document.getElementById('relatedKeywordsTable');
        relatedTable.innerHTML = data.related.map(kw => {
            const searches = randomInt(5000, data.monthly);
            const comp = randomChoice(['낮음', '중간', '높음']);
            const score = comp === '낮음' ? randomInt(80, 95) : comp === '중간' ? randomInt(50, 79) : randomInt(20, 49);
            return `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-4 py-2 font-medium">${kw}</td>
                    <td class="px-4 py-2 text-right">${formatNumber(searches)}</td>
                    <td class="px-4 py-2 text-center"><span class="badge ${compColor[comp]}">${comp}</span></td>
                    <td class="px-4 py-2 text-center">
                        <span class="text-sm font-bold ${score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}">${score}점</span>
                    </td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="saveKeyword('${kw}')" class="text-naver hover:text-naver-dark text-lg">⭐</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('keywordResults').classList.remove('hidden');
        showToast(`"${input}" 키워드 분석 완료!`);
    }

    function generateMockKeywordData(keyword) {
        const monthlyBase = randomInt(10000, 200000);
        const competitions = ['낮음', '중간', '높음'];
        const trends = ['상승', '유지', '하락'];
        const words = keyword.split(' ');

        const related = [];
        const prefixes = ['가성비', '프리미엄', '추천', '인기', '베스트', '신상', '할인'];
        const suffixes = ['추천', '순위', '비교', '리뷰', '가격', '할인', '후기'];

        for (let i = 0; i < 7; i++) {
            if (i < 3) related.push(randomChoice(prefixes) + ' ' + keyword);
            else if (i < 5) related.push(keyword + ' ' + randomChoice(suffixes));
            else related.push(words[0] + ' ' + randomChoice(suffixes));
        }

        return {
            monthly: monthlyBase,
            competition: randomChoice(competitions),
            trend: randomChoice(trends),
            related
        };
    }

    window.saveKeyword = function (kw) {
        if (state.savedKeywords.includes(kw)) {
            showToast('이미 저장된 키워드입니다');
            return;
        }
        state.savedKeywords.push(kw);
        saveState();
        renderSavedKeywords();
        showToast(`"${kw}" 키워드 저장 완료!`);
    };

    function renderSavedKeywords() {
        const container = document.getElementById('savedKeywordsList');
        if (state.savedKeywords.length === 0) {
            container.innerHTML = '<span class="text-gray-400 text-sm">저장된 키워드가 없습니다</span>';
            return;
        }
        container.innerHTML = state.savedKeywords.map(kw => `
            <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-naver-light text-naver rounded-full text-sm font-medium">
                ⭐ ${kw}
                <button onclick="removeKeyword('${kw}')" class="ml-1 hover:text-red-500 text-xs">✕</button>
            </span>
        `).join('');
    }

    window.removeKeyword = function (kw) {
        state.savedKeywords = state.savedKeywords.filter(k => k !== kw);
        saveState();
        renderSavedKeywords();
        showToast('키워드가 삭제되었습니다');
    };

    // ─── 6. Sales Analytics ──────────────────────────────────

    let revenueChart, ordersChart, categoryChart;

    function renderAnalytics() {
        const days = parseInt(document.getElementById('analyticsPeriod').value);
        const salesData = generateMockSalesData(days);

        // KPI Cards
        const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
        const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
        const totalProfit = salesData.reduce((s, d) => s + d.profit, 0);
        const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

        document.getElementById('kpiRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('kpiOrders').textContent = totalOrders + '건';
        document.getElementById('kpiProfit').textContent = formatCurrency(totalProfit);
        document.getElementById('kpiMargin').textContent = avgMargin.toFixed(1) + '%';

        document.getElementById('kpiRevenueChange').textContent = '+' + randomInt(5, 25) + '%';
        document.getElementById('kpiOrdersChange').textContent = '+' + randomInt(3, 18) + '%';
        document.getElementById('kpiProfitChange').textContent = '+' + randomInt(7, 30) + '%';
        document.getElementById('kpiMarginChange').textContent = '+' + randomInt(1, 5) + '%p';

        const labels = salesData.map(d => d.date);

        // Revenue Chart
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '매출',
                    data: salesData.map(d => d.revenue),
                    borderColor: '#03C75A',
                    backgroundColor: 'rgba(3, 199, 90, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }, {
                    label: '순수익',
                    data: salesData.map(d => d.profit),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
                scales: {
                    y: { ticks: { callback: v => (v / 10000).toFixed(0) + '만' } }
                }
            }
        });

        // Orders Chart
        if (ordersChart) ordersChart.destroy();
        ordersChart = new Chart(document.getElementById('ordersChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '주문수',
                    data: salesData.map(d => d.orders),
                    backgroundColor: 'rgba(3, 199, 90, 0.6)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        // Category Chart
        const categoryData = {};
        salesData.forEach(d => {
            if (!categoryData[d.category]) categoryData[d.category] = 0;
            categoryData[d.category] += d.revenue;
        });

        if (categoryChart) categoryChart.destroy();
        const catLabels = Object.keys(categoryData);
        const catValues = Object.values(categoryData);
        categoryChart = new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catValues,
                    backgroundColor: ['#03C75A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } }
                }
            }
        });

        // Bestseller
        const bestProducts = [...MOCK_PRODUCTS]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((p, i) => ({
                ...p,
                sales: randomInt(20, 100),
                revenue: p.retailPrice * randomInt(20, 100)
            }))
            .sort((a, b) => b.revenue - a.revenue);

        document.getElementById('bestsellerList').innerHTML = bestProducts.map((p, i) => `
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span class="text-lg font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}">${i + 1}</span>
                <span class="text-2xl">${p.emoji}</span>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">${p.name}</div>
                    <div class="text-xs text-gray-500">${p.sales}건 판매</div>
                </div>
                <div class="text-sm font-bold text-naver">${formatCurrency(p.revenue)}</div>
            </div>
        `).join('');
    }

    function generateMockSalesData(days) {
        const data = [];
        const categories = ['패션', '뷰티', '생활', '전자기기', '식품'];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

            const baseOrders = randomInt(3, 15);
            const baseRevenue = baseOrders * randomInt(15000, 35000);
            const profit = baseRevenue * (randomInt(15, 35) / 100);

            data.push({
                date: dateStr,
                orders: baseOrders,
                revenue: baseRevenue,
                profit: Math.round(profit),
                category: randomChoice(categories)
            });
        }
        return data;
    }

    document.getElementById('analyticsPeriod').addEventListener('change', renderAnalytics);

    // ─── Initialization ──────────────────────────────────────

    function init() {
        renderSourcingGrid();
        renderListings();
        renderOrders();
        renderCalcHistory();
        renderSavedKeywords();

        // Generate initial mock orders if none exist
        if (state.orders.length === 0) {
            const statuses = ['신규주문', '처리중', '배송중', '배송완료'];
            for (let i = 0; i < 8; i++) {
                const product = randomChoice(MOCK_PRODUCTS);
                const qty = randomInt(1, 3);
                const daysAgo = randomInt(0, 14);
                const orderDate = new Date();
                orderDate.setDate(orderDate.getDate() - daysAgo);

                state.orders.push({
                    id: 'ORD-' + (10000000 + i),
                    productName: product.name,
                    customerName: randomChoice(MOCK_CUSTOMER_NAMES),
                    address: randomChoice(MOCK_ADDRESSES),
                    quantity: qty,
                    unitPrice: product.retailPrice,
                    totalPrice: product.retailPrice * qty,
                    status: statuses[Math.min(i, statuses.length - 1) % statuses.length],
                    orderDate: orderDate.toISOString(),
                    trackingNumber: i >= 3 ? '6' + Math.random().toString().slice(2, 14) : ''
                });
            }
            saveState();
            renderOrders();
        }
    }

    init();

})();
