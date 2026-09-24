// ============================================
// 크리에이트잇 - AI 디자인 & 영상 제작 대행 POC
// ============================================

// ---- 상수 & 설정 ----
const STATUS_FLOW = ['received', 'in-progress', 'draft-done', 'revising', 'final-review', 'delivered'];
const STATUS_LABELS = {
    'received': '의뢰접수',
    'in-progress': '시안작업중',
    'draft-done': '시안완료',
    'revising': '수정중',
    'final-review': '최종확인',
    'delivered': '납품완료'
};
const STATUS_ICONS = {
    'received': '📩', 'in-progress': '🎨', 'draft-done': '✅',
    'revising': '🔄', 'final-review': '👀', 'delivered': '📦'
};
const PACKAGE_LABELS = {
    'thumbnail': 'SNS 썸네일', 'video': '유튜브 영상',
    'detail-page': '상세페이지', 'logo': '로고/브랜딩', 'bundle': '종합 패키지'
};
const PACKAGE_ICONS = {
    'thumbnail': '📱', 'video': '🎬', 'detail-page': '🛒', 'logo': '✨', 'bundle': '📦'
};

const MONTHLY_GOAL = 15000000; // 월 목표 매출

// ---- 데이터 저장소 ----
const Store = {
    get(key, fallback = []) {
        try {
            const data = localStorage.getItem('createit_' + key);
            return data ? JSON.parse(data) : fallback;
        } catch { return fallback; }
    },
    set(key, value) {
        localStorage.setItem('createit_' + key, JSON.stringify(value));
    }
};

// ---- 유틸리티 ----
function generateOrderId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const orders = Store.get('orders');
    const todayOrders = orders.filter(o => o.id.includes(dateStr));
    const seq = String(todayOrders.length + 1).padStart(3, '0');
    return `ORD-${dateStr}-${seq}`;
}

function formatCurrency(amount) {
    return '₩' + Number(amount).toLocaleString('ko-KR');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2500);
}

// ---- 네비게이션 ----
function navigateTo(page) {
    // 페이지 전환
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('page-' + page)?.classList.remove('hidden');

    // 네비게이션 활성화
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // 모바일 메뉴 닫기
    document.getElementById('mobileMenu').classList.add('hidden');

    // 페이지별 렌더링
    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'orders': renderOrders(); break;
        case 'portfolio': renderPortfolio(); break;
        case 'tools': renderTools(); break;
        case 'revenue': renderRevenue(); break;
        case 'pricing': renderPricing(); break;
    }
}

// ---- 대시보드 ----
function renderDashboard() {
    const orders = Store.get('orders');
    const now = new Date();
    const thisMonth = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const delivered = orders.filter(o => o.status === 'delivered');
    const deliveredThisMonth = delivered.filter(o => {
        const d = new Date(o.updatedAt || o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const inProgress = orders.filter(o => !['delivered', 'received'].includes(o.status));
    const monthRevenue = deliveredThisMonth.reduce((sum, o) => sum + (o.price || 0), 0);

    document.getElementById('stat-total').textContent = orders.length;
    document.getElementById('stat-progress').textContent = inProgress.length;
    document.getElementById('stat-delivered').textContent = deliveredThisMonth.length;
    document.getElementById('stat-revenue').textContent = formatCurrency(monthRevenue);

    // 최근 주문 (최신 5개)
    const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const container = document.getElementById('recent-orders');
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">주문이 없습니다. 새 주문을 추가해보세요!</p>';
        return;
    }
    container.innerHTML = recent.map(order => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="navigateTo('orders')">
            <div class="flex items-center gap-3">
                <span class="text-xl">${PACKAGE_ICONS[order.packageType] || '📋'}</span>
                <div>
                    <div class="font-medium text-sm">${order.customerName} - ${PACKAGE_LABELS[order.packageType] || order.packageType}</div>
                    <div class="text-xs text-gray-500">${order.id} · ${formatDate(order.createdAt)}</div>
                </div>
            </div>
            <span class="status-badge status-${order.status}">${STATUS_LABELS[order.status]}</span>
        </div>
    `).join('');
}

// ---- 주문 관리 ----
let currentFilter = 'all';

function renderOrders(filter = currentFilter) {
    currentFilter = filter;
    const orders = Store.get('orders');
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const container = document.getElementById('orders-list');
    if (sorted.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-12">해당 상태의 주문이 없습니다.</p>';
        return;
    }

    container.innerHTML = sorted.map(order => `
        <div class="order-card" onclick="openDetailModal('${order.id}')">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${PACKAGE_ICONS[order.packageType] || '📋'}</span>
                    <div>
                        <div class="font-bold">${order.customerName}</div>
                        <div class="text-sm text-gray-500">${order.id}</div>
                    </div>
                </div>
                <span class="status-badge status-${order.status}">${STATUS_ICONS[order.status]} ${STATUS_LABELS[order.status]}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <div class="text-gray-500">
                    ${PACKAGE_LABELS[order.packageType] || order.packageType} · ${formatDate(order.createdAt)}
                </div>
                <div class="font-bold text-brand-700">${formatCurrency(order.price)}</div>
            </div>
            ${order.description ? `<div class="mt-2 text-sm text-gray-500 truncate">${order.description}</div>` : ''}
            <!-- 워크플로우 프로그레스 -->
            <div class="mt-3">
                <div class="progress-bar">
                    <div class="progress-fill bg-brand-500" style="width: ${getProgressPercent(order.status)}%"></div>
                </div>
                <div class="flex justify-between mt-1 text-xs text-gray-400">
                    <span>의뢰접수</span><span>납품완료</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getProgressPercent(status) {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / STATUS_FLOW.length) * 100);
}

function openOrderModal(orderId = null) {
    const modal = document.getElementById('orderModal');
    const form = document.getElementById('orderForm');
    form.reset();

    if (orderId) {
        const orders = Store.get('orders');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            document.getElementById('orderModalTitle').textContent = '주문 수정';
            document.getElementById('orderId').value = order.id;
            document.getElementById('customerName').value = order.customerName;
            document.getElementById('customerContact').value = order.customerContact || '';
            document.getElementById('packageType').value = order.packageType;
            document.getElementById('orderPrice').value = order.price;
            document.getElementById('orderDesc').value = order.description || '';
        }
    } else {
        document.getElementById('orderModalTitle').textContent = '새 주문 생성';
        document.getElementById('orderId').value = '';
    }

    modal.classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

function saveOrder(e) {
    e.preventDefault();
    const orders = Store.get('orders');
    const id = document.getElementById('orderId').value;

    const orderData = {
        customerName: document.getElementById('customerName').value.trim(),
        customerContact: document.getElementById('customerContact').value.trim(),
        packageType: document.getElementById('packageType').value,
        price: parseInt(document.getElementById('orderPrice').value) || 0,
        description: document.getElementById('orderDesc').value.trim(),
        updatedAt: new Date().toISOString()
    };

    if (id) {
        // 수정
        const idx = orders.findIndex(o => o.id === id);
        if (idx !== -1) {
            orders[idx] = { ...orders[idx], ...orderData };
            showToast('주문이 수정되었습니다 ✏️');
        }
    } else {
        // 생성
        const newOrder = {
            id: generateOrderId(),
            ...orderData,
            status: 'received',
            revisionCount: 0,
            revisionLimit: orderData.packageType === 'bundle' ? 5 : 3,
            statusHistory: [{
                fromStatus: null,
                toStatus: 'received',
                changedAt: new Date().toISOString(),
                note: '주문 접수'
            }],
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        showToast('새 주문이 생성되었습니다 🎉');
    }

    Store.set('orders', orders);
    closeOrderModal();
    renderOrders();
    renderDashboard();
}

function openDetailModal(orderId) {
    const orders = Store.get('orders');
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('detailTitle').textContent = `주문 상세 - ${order.id}`;
    const currentIdx = STATUS_FLOW.indexOf(order.status);

    const content = `
        <div class="space-y-4">
            <!-- 기본 정보 -->
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex justify-between"><span class="text-gray-500">고객명</span><span class="font-medium">${order.customerName}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">연락처</span><span class="font-medium">${order.customerContact || '-'}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">유형</span><span class="font-medium">${PACKAGE_ICONS[order.packageType]} ${PACKAGE_LABELS[order.packageType]}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">금액</span><span class="font-bold text-brand-700">${formatCurrency(order.price)}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">주문일</span><span class="font-medium">${formatDate(order.createdAt)}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">수정횟수</span><span class="font-medium">${order.revisionCount || 0} / ${order.revisionLimit || 3}회</span></div>
            </div>

            ${order.description ? `<div class="bg-gray-50 rounded-lg p-4"><div class="text-gray-500 text-sm mb-1">작업 설명</div><div class="text-sm">${order.description}</div></div>` : ''}

            <!-- 워크플로우 -->
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-bold mb-3">워크플로우 상태</div>
                ${STATUS_FLOW.map((s, i) => {
                    let cls = 'pending';
                    if (i < currentIdx) cls = 'completed';
                    if (i === currentIdx) cls = 'current';
                    return `<div class="workflow-step ${cls}">
                        <span>${STATUS_ICONS[s]}</span>
                        <span>${STATUS_LABELS[s]}</span>
                        ${i === currentIdx ? '<span class="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">현재</span>' : ''}
                        ${i < currentIdx ? '<span class="ml-auto text-xs text-green-500">✓</span>' : ''}
                    </div>`;
                }).join('')}
            </div>

            <!-- 상태 변경 이력 -->
            ${order.statusHistory && order.statusHistory.length > 0 ? `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm font-bold mb-2">변경 이력</div>
                <div class="space-y-1 text-xs text-gray-600">
                    ${order.statusHistory.map(h => `
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">${formatDate(h.changedAt)}</span>
                            <span>${h.fromStatus ? STATUS_LABELS[h.fromStatus] : '(시작)'} → ${STATUS_LABELS[h.toStatus]}</span>
                            ${h.note ? `<span class="text-gray-400">· ${h.note}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}

            <!-- 액션 버튼 -->
            <div class="flex flex-wrap gap-2">
                ${order.status !== 'delivered' ? `
                    <button onclick="changeOrderStatus('${order.id}', 'next')" class="flex-1 bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 text-sm font-medium">
                        다음 단계로 →
                    </button>
                ` : ''}
                ${order.status === 'draft-done' ? `
                    <button onclick="changeOrderStatus('${order.id}', 'revising')" class="flex-1 bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 text-sm font-medium">
                        🔄 수정 요청
                    </button>
                ` : ''}
                ${order.status !== 'delivered' ? `
                    <button onclick="openOrderModal('${order.id}'); closeDetailModal();" class="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
                        ✏️ 수정
                    </button>
                ` : ''}
                <button onclick="deleteOrder('${order.id}')" class="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 text-sm font-medium">
                    🗑️ 삭제
                </button>
            </div>
        </div>
    `;

    document.getElementById('orderDetailContent').innerHTML = content;
    document.getElementById('orderDetailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('orderDetailModal').classList.add('hidden');
}

function changeOrderStatus(orderId, targetStatus) {
    const orders = Store.get('orders');
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let newStatus;
    if (targetStatus === 'next') {
        const currentIdx = STATUS_FLOW.indexOf(order.status);
        if (currentIdx >= STATUS_FLOW.length - 1) return;
        newStatus = STATUS_FLOW[currentIdx + 1];
    } else {
        newStatus = targetStatus;
    }

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'revising') {
        order.revisionCount = (order.revisionCount || 0) + 1;
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
        fromStatus: oldStatus,
        toStatus: newStatus,
        changedAt: new Date().toISOString(),
        note: ''
    });

    Store.set('orders', orders);
    showToast(`상태 변경: ${STATUS_LABELS[newStatus]} ${STATUS_ICONS[newStatus]}`);
    closeDetailModal();
    renderOrders();
    renderDashboard();
}

function deleteOrder(orderId) {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    let orders = Store.get('orders');
    orders = orders.filter(o => o.id !== orderId);
    Store.set('orders', orders);
    showToast('주문이 삭제되었습니다 🗑️');
    closeDetailModal();
    renderOrders();
    renderDashboard();
}

// ---- 포트폴리오 ----
const PORTFOLIO_DATA = [
    { id: 'p1', title: '패션 브랜드 인스타그램 피드', category: 'thumbnail', gradient: 'gradient-1', icon: '👗', tools: ['Canva', 'Midjourney'], description: '시즌 컬렉션 홍보용 인스타그램 피드 9컷 디자인' },
    { id: 'p2', title: '유튜브 채널 인트로 영상', category: 'video', gradient: 'gradient-2', icon: '🎬', tools: ['CapCut', 'Canva'], description: '테크 리뷰 채널 인트로/아웃트로 영상 제작' },
    { id: 'p3', title: '건강식품 쇼핑몰 상세페이지', category: 'detail-page', gradient: 'gradient-3', icon: '🛒', tools: ['Canva', 'ChatGPT'], description: '건강보조식품 상세페이지 3종 디자인' },
    { id: 'p4', title: '카페 로고 & 브랜드 가이드', category: 'logo', gradient: 'gradient-4', icon: '☕', tools: ['Midjourney', 'Canva'], description: '신규 카페 브랜드 로고 및 BI 가이드 제작' },
    { id: 'p5', title: '부동산 유튜브 썸네일 세트', category: 'thumbnail', gradient: 'gradient-5', icon: '🏠', tools: ['Canva', 'Leonardo AI'], description: '부동산 투자 채널 썸네일 10종 세트' },
    { id: 'p6', title: '제품 언박싱 숏폼 영상', category: 'video', gradient: 'gradient-6', icon: '📦', tools: ['CapCut', 'ChatGPT'], description: '전자제품 언박싱 릴스/숏츠 영상 5편' },
    { id: 'p7', title: '화장품 상세페이지', category: 'detail-page', gradient: 'gradient-7', icon: '💄', tools: ['Canva', 'Midjourney'], description: '프리미엄 화장품 라인업 상세페이지' },
    { id: 'p8', title: '스타트업 CI/BI 디자인', category: 'logo', gradient: 'gradient-8', icon: '🚀', tools: ['Midjourney', 'Canva', 'ChatGPT'], description: 'AI 스타트업 기업 아이덴티티 디자인' },
    { id: 'p9', title: '맛집 유튜브 엔딩 영상', category: 'video', gradient: 'gradient-1', icon: '🍜', tools: ['CapCut', 'Canva'], description: '맛집 탐방 채널 엔딩 카드 영상' },
];

let currentPortfolioFilter = 'all';

function renderPortfolio(filter = currentPortfolioFilter) {
    currentPortfolioFilter = filter;
    const items = filter === 'all' ? PORTFOLIO_DATA : PORTFOLIO_DATA.filter(p => p.category === filter);
    const grid = document.getElementById('portfolio-grid');

    grid.innerHTML = items.map(item => `
        <div class="portfolio-card" onclick="openPortfolioDetail('${item.id}')">
            <div class="portfolio-thumb ${item.gradient}">
                <span class="text-5xl drop-shadow-lg">${item.icon}</span>
            </div>
            <div class="p-4">
                <div class="font-bold mb-1">${item.title}</div>
                <div class="text-sm text-gray-500 mb-3">${item.description}</div>
                <div class="flex flex-wrap gap-1">
                    ${item.tools.map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function openPortfolioDetail(id) {
    const item = PORTFOLIO_DATA.find(p => p.id === id);
    if (!item) return;

    document.getElementById('portfolioModalTitle').textContent = item.title;
    document.getElementById('portfolioModalContent').innerHTML = `
        <div class="portfolio-thumb ${item.gradient} rounded-xl mb-4" style="height: 200px;">
            <span class="text-6xl drop-shadow-lg">${item.icon}</span>
        </div>
        <div class="space-y-3">
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-500">카테고리</span>
                <span class="text-sm font-bold">${PACKAGE_LABELS[item.category]}</span>
            </div>
            <div>
                <span class="text-sm font-medium text-gray-500">설명</span>
                <p class="text-sm mt-1">${item.description}</p>
            </div>
            <div>
                <span class="text-sm font-medium text-gray-500">사용 도구</span>
                <div class="flex flex-wrap gap-2 mt-1">
                    ${item.tools.map(t => `<span class="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-medium">${t}</span>`).join('')}
                </div>
            </div>
            <button onclick="navigateTo('pricing'); closePortfolioModal();" class="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 font-medium mt-4">
                이런 작업 의뢰하기 →
            </button>
        </div>
    `;
    document.getElementById('portfolioModal').classList.remove('hidden');
}

function closePortfolioModal() {
    document.getElementById('portfolioModal').classList.add('hidden');
}

// ---- AI 도구 추천 ----
const AI_TOOLS = [
    {
        name: 'Canva', icon: '🎨', categories: ['design'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 1, rating: 4.8,
        features: ['템플릿 기반 디자인', 'SNS 콘텐츠', '프레젠테이션', '동영상 편집'],
        recommended: ['썸네일', '상세페이지', 'SNS 콘텐츠'],
        description: '초보자도 쉽게 사용할 수 있는 올인원 디자인 도구. 무료 플랜으로도 충분한 기능 제공.'
    },
    {
        name: 'Midjourney', icon: '🖼️', categories: ['image'],
        pricing: '유료 ($10~)', pricingType: 'paid',
        difficulty: 2, rating: 4.9,
        features: ['AI 이미지 생성', '고품질 아트워크', '스타일 커스텀', '업스케일링'],
        recommended: ['로고 컨셉', '배경 이미지', '아트워크'],
        description: '최고 품질의 AI 이미지 생성. 프롬프트 기반으로 독창적인 디자인 소스 제작.'
    },
    {
        name: 'CapCut (캡컷)', icon: '🎬', categories: ['video'],
        pricing: '무료', pricingType: 'free',
        difficulty: 1, rating: 4.6,
        features: ['영상 편집', '자동 자막', '효과/전환', '숏폼 최적화'],
        recommended: ['유튜브 영상', '릴스/숏츠', '인트로/아웃트로'],
        description: '무료로 사용 가능한 강력한 영상 편집 도구. TikTok/YouTube 숏폼에 최적화.'
    },
    {
        name: 'ChatGPT', icon: '🤖', categories: ['text'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 1, rating: 4.7,
        features: ['카피라이팅', '콘텐츠 기획', '번역', '스크립트 작성'],
        recommended: ['광고 카피', '영상 스크립트', '상품 설명'],
        description: 'AI 기반 텍스트 생성. 마케팅 카피, 스크립트, 상품 설명 등 다양한 텍스트 작업에 활용.'
    },
    {
        name: 'Leonardo AI', icon: '🎭', categories: ['image'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 2, rating: 4.5,
        features: ['AI 이미지 생성', '스타일 학습', '실시간 편집', '배치 생성'],
        recommended: ['제품 이미지', '배경 제거/변환', '컨셉 아트'],
        description: 'Midjourney 대안으로 무료 크레딧 제공. 상업용 이미지 생성에 적합.'
    },
    {
        name: 'Runway ML', icon: '🎥', categories: ['video', 'image'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 3, rating: 4.4,
        features: ['AI 영상 생성', '배경 제거', '모션 그래픽', '이미지→영상'],
        recommended: ['모션 그래픽', '특수효과', 'AI 영상 생성'],
        description: '차세대 AI 영상 도구. 텍스트/이미지를 영상으로 변환하는 혁신적 기능.'
    },
    {
        name: 'Figma', icon: '✏️', categories: ['design'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 3, rating: 4.7,
        features: ['UI/UX 디자인', '프로토타이핑', '협업 도구', '디자인 시스템'],
        recommended: ['웹 디자인', '앱 디자인', '와이어프레임'],
        description: '전문 UI/UX 디자인 도구. 팀 협업과 프로토타이핑에 최적. 무료 플랜 제공.'
    },
    {
        name: 'Remove.bg', icon: '✂️', categories: ['image'],
        pricing: '무료(제한)', pricingType: 'freemium',
        difficulty: 1, rating: 4.3,
        features: ['배경 제거', '배치 처리', 'API 연동', '고해상도 출력'],
        recommended: ['제품 사진', '프로필 사진', '합성 이미지'],
        description: 'AI 기반 원클릭 배경 제거. 제품 사진, 프로필 사진 편집에 필수.'
    },
    {
        name: 'Suno AI', icon: '🎵', categories: ['video'],
        pricing: '무료/프리미엄', pricingType: 'freemium',
        difficulty: 1, rating: 4.2,
        features: ['AI 음악 생성', '배경 음악', '장르 선택', '가사 생성'],
        recommended: ['영상 배경음악', '광고 음악', '팟캐스트 인트로'],
        description: 'AI로 로열티 프리 음악 생성. 영상 배경음악, 광고 음악 등에 활용 가능.'
    }
];

let currentToolFilter = 'all';

function renderTools(filter = currentToolFilter) {
    currentToolFilter = filter;
    const filtered = filter === 'all' ? AI_TOOLS : AI_TOOLS.filter(t => t.categories.includes(filter));
    const grid = document.getElementById('tools-grid');

    grid.innerHTML = filtered.map(tool => {
        const diffDots = Array.from({length: 3}, (_, i) =>
            `<span class="difficulty-dot ${i < tool.difficulty ? 'bg-brand-500' : 'bg-gray-200'}"></span>`
        ).join('');

        const pricingColors = { free: 'bg-green-100 text-green-700', freemium: 'bg-blue-100 text-blue-700', paid: 'bg-amber-100 text-amber-700' };

        return `
            <div class="tool-card">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">${tool.icon}</span>
                        <div>
                            <div class="font-bold">${tool.name}</div>
                            <span class="text-xs px-2 py-0.5 rounded-full ${pricingColors[tool.pricingType]}">${tool.pricing}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 text-amber-500 text-sm">
                        ⭐ ${tool.rating}
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-3">${tool.description}</p>
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs text-gray-500">난이도</span>
                    <div class="difficulty-dots">${diffDots}</div>
                    <span class="text-xs text-gray-400">${['', '쉬움', '보통', '어려움'][tool.difficulty]}</span>
                </div>
                <div class="mb-3">
                    <div class="text-xs text-gray-500 mb-1">주요 기능</div>
                    <div class="flex flex-wrap gap-1">
                        ${tool.features.map(f => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${f}</span>`).join('')}
                    </div>
                </div>
                <div>
                    <div class="text-xs text-gray-500 mb-1">추천 용도</div>
                    <div class="flex flex-wrap gap-1">
                        ${tool.recommended.map(r => `<span class="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-full">${r}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ---- 수익 분석 ----
function renderRevenue() {
    const orders = Store.get('orders');
    const delivered = orders.filter(o => o.status === 'delivered');
    const now = new Date();

    const totalRev = delivered.reduce((s, o) => s + (o.price || 0), 0);
    const thisMonthDelivered = delivered.filter(o => {
        const d = new Date(o.updatedAt || o.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthRev = thisMonthDelivered.reduce((s, o) => s + (o.price || 0), 0);
    const avgPrice = delivered.length > 0 ? Math.round(totalRev / delivered.length) : 0;
    const goalPercent = Math.min(Math.round((monthRev / MONTHLY_GOAL) * 100), 100);

    document.getElementById('rev-total').textContent = formatCurrency(totalRev);
    document.getElementById('rev-month').textContent = formatCurrency(monthRev);
    document.getElementById('rev-avg').textContent = formatCurrency(avgPrice);
    document.getElementById('rev-goal').textContent = goalPercent + '%';

    drawRevenueChart(orders);
    drawCategoryChart(delivered);
    renderTransactions(delivered);
}

function drawRevenueChart(orders) {
    const canvas = document.getElementById('revenueChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 250 * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = 250;
    ctx.clearRect(0, 0, w, h);

    // 최근 6개월 데이터
    const now = new Date();
    const months = [];
    const revenues = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = `${d.getMonth() + 1}월`;
        months.push(monthLabel);

        const monthOrders = orders.filter(o => {
            if (o.status !== 'delivered') return false;
            const od = new Date(o.updatedAt || o.createdAt);
            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        });
        revenues.push(monthOrders.reduce((s, o) => s + (o.price || 0), 0));
    }

    // 시뮬레이션 데이터 (주문이 적을 때)
    const demoRevenues = [3200000, 5800000, 4500000, 7200000, 9800000, 0];
    const displayRevenues = revenues.some(r => r > 0) ? revenues : demoRevenues.map((v, i) => i === 5 ? revenues[5] : v);

    const maxRev = Math.max(...displayRevenues, MONTHLY_GOAL) * 1.1;
    const padding = { top: 20, right: 20, bottom: 40, left: 70 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // 그리드
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        const val = Math.round(maxRev - (maxRev / 4) * i);
        ctx.fillText(formatCurrency(val), padding.left - 8, y + 4);
    }

    // 목표선
    const goalY = padding.top + chartH * (1 - MONTHLY_GOAL / maxRev);
    ctx.strokeStyle = '#e64980';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, goalY);
    ctx.lineTo(w - padding.right, goalY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e64980';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('목표', w - padding.right + 4, goalY + 4);

    // 바 차트
    const barW = chartW / months.length * 0.6;
    const gap = chartW / months.length;

    displayRevenues.forEach((rev, i) => {
        const x = padding.left + gap * i + (gap - barW) / 2;
        const barH = (rev / maxRev) * chartH;
        const y = padding.top + chartH - barH;

        // 그라디언트
        const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
        grad.addColorStop(0, '#4c6ef5');
        grad.addColorStop(1, '#748ffc');
        ctx.fillStyle = grad;

        // 라운드 바
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // 값 표시
        if (rev > 0) {
            ctx.fillStyle = '#374151';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatCurrency(rev), x + barW / 2, y - 6);
        }

        // X축 레이블
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(months[i], x + barW / 2, h - 10);
    });
}

function drawCategoryChart(delivered) {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 250 * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = 250;
    ctx.clearRect(0, 0, w, h);

    // 카테고리별 집계
    const categories = {};
    delivered.forEach(o => {
        const cat = PACKAGE_LABELS[o.packageType] || o.packageType;
        categories[cat] = (categories[cat] || 0) + (o.price || 0);
    });

    // 데모 데이터
    const demoCategories = {
        'SNS 썸네일': 4200000,
        '유튜브 영상': 5800000,
        '상세페이지': 3500000,
        '로고/브랜딩': 2200000,
        '종합 패키지': 1500000
    };

    const data = Object.keys(categories).length > 0 ? categories : demoCategories;
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    const colors = ['#4c6ef5', '#f06595', '#20c997', '#fab005', '#845ef7', '#ff6b6b'];

    // 도넛 차트
    const cx = w * 0.35;
    const cy = h / 2;
    const outerR = Math.min(cx, cy) - 20;
    const innerR = outerR * 0.55;

    let startAngle = -Math.PI / 2;
    const entries = Object.entries(data);

    entries.forEach(([cat, val], i) => {
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
    });

    // 중앙 텍스트
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('총 매출', cx, cy - 6);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(formatCurrency(total), cx, cy + 14);

    // 범례
    const legendX = w * 0.68;
    let legendY = 30;

    entries.forEach(([cat, val], i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(legendX, legendY, 12, 12);

        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(cat, legendX + 18, legendY + 10);

        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${formatCurrency(val)} (${Math.round(val / total * 100)}%)`, legendX + 18, legendY + 26);

        legendY += 40;
    });
}

function renderTransactions(delivered) {
    const container = document.getElementById('transaction-list');
    const sorted = [...delivered].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 10);

    if (sorted.length === 0) {
        // 데모 트랜잭션
        container.innerHTML = `
            <div class="text-xs text-gray-400 mb-2">* 데모 데이터</div>
            ${[
                { name: '김디자인', type: 'thumbnail', price: 150000, date: '2025.03.28' },
                { name: '이영상', type: 'video', price: 500000, date: '2025.03.25' },
                { name: '박쇼핑', type: 'detail-page', price: 300000, date: '2025.03.22' },
                { name: '최브랜드', type: 'logo', price: 800000, date: '2025.03.18' },
                { name: '정마케팅', type: 'bundle', price: 1200000, date: '2025.03.15' },
            ].map(t => `
                <div class="flex items-center justify-between py-2 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <span>${PACKAGE_ICONS[t.type]}</span>
                        <div>
                            <div class="text-sm font-medium">${t.name}</div>
                            <div class="text-xs text-gray-400">${t.date}</div>
                        </div>
                    </div>
                    <span class="text-sm font-bold text-green-600">+${formatCurrency(t.price)}</span>
                </div>
            `).join('')}
        `;
        return;
    }

    container.innerHTML = sorted.map(o => `
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <div class="flex items-center gap-2">
                <span>${PACKAGE_ICONS[o.packageType]}</span>
                <div>
                    <div class="text-sm font-medium">${o.customerName}</div>
                    <div class="text-xs text-gray-400">${formatDate(o.updatedAt || o.createdAt)}</div>
                </div>
            </div>
            <span class="text-sm font-bold text-green-600">+${formatCurrency(o.price)}</span>
        </div>
    `).join('');
}

// ---- 가격표 ----
const PRICING_DATA = {
    onetime: [
        {
            name: 'SNS 썸네일',
            icon: '📱',
            price: 50000,
            unit: '장',
            description: 'Instagram, YouTube, 블로그 등 SNS 썸네일 디자인',
            includes: ['고해상도 이미지 파일', '1종 디자인', '수정 2회 포함', '24시간 내 납품'],
            popular: false
        },
        {
            name: '유튜브 영상 편집',
            icon: '🎬',
            price: 300000,
            unit: '편',
            description: '유튜브 영상 편집 (인트로/아웃트로/자막 포함)',
            includes: ['최대 15분 영상', '자막 삽입', '인트로/아웃트로', '수정 3회 포함', 'BGM 삽입', '3~5일 납품'],
            popular: true
        },
        {
            name: '쇼핑몰 상세페이지',
            icon: '🛒',
            price: 200000,
            unit: '페이지',
            description: '스마트스토어, 쿠팡 등 상세페이지 디자인',
            includes: ['모바일 최적화', '제품 사진 보정', '카피라이팅', '수정 3회 포함', '3일 내 납품'],
            popular: false
        },
        {
            name: '로고 & 브랜딩',
            icon: '✨',
            price: 500000,
            unit: '건',
            description: '로고 디자인 + 기본 BI 가이드',
            includes: ['로고 시안 3종', '컬러 팔레트', '명함 디자인', '수정 5회 포함', '5~7일 납품', '원본 파일 제공'],
            popular: false
        },
        {
            name: '종합 패키지',
            icon: '🎁',
            price: 800000,
            unit: '세트',
            description: '썸네일 + 영상 + 상세페이지 올인원',
            includes: ['썸네일 5종', '영상 편집 1편', '상세페이지 1종', '수정 5회 포함', '7일 내 납품', '전담 디자이너'],
            popular: false
        }
    ],
    subscription: [
        {
            name: '스타터 플랜',
            icon: '🌱',
            price: 290000,
            unit: '월',
            description: '소규모 사업자/크리에이터를 위한 기본 플랜',
            includes: ['썸네일 10장/월', '간단 수정 무제한', '24시간 응답', '기본 디자인 에셋'],
            popular: false
        },
        {
            name: '프로 플랜',
            icon: '🚀',
            price: 590000,
            unit: '월',
            description: '중소규모 비즈니스를 위한 프리미엄 플랜',
            includes: ['썸네일 20장/월', '영상 편집 2편/월', '상세페이지 2종/월', '수정 무제한', '전담 디자이너', '12시간 응답'],
            popular: true
        },
        {
            name: '엔터프라이즈',
            icon: '🏢',
            price: 1200000,
            unit: '월',
            description: '대규모 콘텐츠가 필요한 기업용 플랜',
            includes: ['디자인 무제한', '영상 편집 5편/월', '상세페이지 무제한', '수정 무제한', '전담 팀 배정', '4시간 응답', '주간 미팅'],
            popular: false
        }
    ]
};

let currentPricingModel = 'onetime';

function renderPricing(model = currentPricingModel) {
    currentPricingModel = model;
    const data = PRICING_DATA[model];
    const container = document.getElementById('pricing-cards');

    container.innerHTML = data.map(pkg => `
        <div class="pricing-card ${pkg.popular ? 'featured' : ''}">
            <div class="text-center mb-4">
                <span class="text-4xl">${pkg.icon}</span>
                <h3 class="text-lg font-bold mt-2">${pkg.name}</h3>
                <p class="text-sm text-gray-500 mt-1">${pkg.description}</p>
            </div>
            <div class="text-center mb-6">
                <span class="text-3xl font-bold text-brand-700">${formatCurrency(pkg.price)}</span>
                <span class="text-gray-500 text-sm">/ ${pkg.unit}</span>
            </div>
            <ul class="space-y-2 mb-6">
                ${pkg.includes.map(item => `
                    <li class="flex items-start gap-2 text-sm">
                        <span class="text-green-500 mt-0.5">✓</span>
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
            <button onclick="handlePricingOrder('${pkg.name}', ${pkg.price}, '${model}')" class="w-full py-3 rounded-lg font-medium text-sm ${pkg.popular ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors">
                ${model === 'subscription' ? '구독 신청하기' : '주문하기'}
            </button>
        </div>
    `).join('');
}

function togglePricingModel(model) {
    document.getElementById('toggleOnetime').classList.toggle('active', model === 'onetime');
    document.getElementById('toggleSubscription').classList.toggle('active', model === 'subscription');
    renderPricing(model);
}

function handlePricingOrder(packageName, price, model) {
    showToast(`${packageName} ${model === 'subscription' ? '구독' : '주문'}이 접수되었습니다! 📧`);
    // 실제로는 주문 폼으로 이동
    navigateTo('orders');
    setTimeout(() => {
        openOrderModal();
        document.getElementById('orderPrice').value = price;
    }, 200);
}

// ---- 데모 데이터 초기화 ----
function initDemoData() {
    const orders = Store.get('orders');
    if (orders.length > 0) return; // 이미 데이터 있으면 스킵

    const demoOrders = [
        {
            id: 'ORD-20250401-001',
            customerName: '김마케팅',
            customerContact: 'kim@marketing.kr',
            packageType: 'thumbnail',
            price: 150000,
            description: '유튜브 채널 썸네일 3종 (밝고 눈에 띄는 디자인)',
            status: 'delivered',
            revisionCount: 1,
            revisionLimit: 3,
            statusHistory: [
                { fromStatus: null, toStatus: 'received', changedAt: '2025-04-01T09:00:00Z', note: '주문 접수' },
                { fromStatus: 'received', toStatus: 'in-progress', changedAt: '2025-04-01T14:00:00Z', note: '' },
                { fromStatus: 'in-progress', toStatus: 'draft-done', changedAt: '2025-04-02T10:00:00Z', note: '' },
                { fromStatus: 'draft-done', toStatus: 'delivered', changedAt: '2025-04-02T16:00:00Z', note: '' }
            ],
            createdAt: '2025-04-01T09:00:00Z',
            updatedAt: '2025-04-02T16:00:00Z'
        },
        {
            id: 'ORD-20250403-001',
            customerName: '이커머스',
            customerContact: 'lee@ecommerce.co.kr',
            packageType: 'detail-page',
            price: 300000,
            description: '스마트스토어 건강식품 상세페이지 (깔끔한 의료/건강 느낌)',
            status: 'in-progress',
            revisionCount: 0,
            revisionLimit: 3,
            statusHistory: [
                { fromStatus: null, toStatus: 'received', changedAt: '2025-04-03T11:00:00Z', note: '주문 접수' },
                { fromStatus: 'received', toStatus: 'in-progress', changedAt: '2025-04-04T09:00:00Z', note: '' }
            ],
            createdAt: '2025-04-03T11:00:00Z',
            updatedAt: '2025-04-04T09:00:00Z'
        },
        {
            id: 'ORD-20250405-001',
            customerName: '박유튜브',
            customerContact: 'park@youtube.kr',
            packageType: 'video',
            price: 500000,
            description: '먹방 유튜브 영상 편집 (10분 분량, 자막+효과음)',
            status: 'draft-done',
            revisionCount: 0,
            revisionLimit: 3,
            statusHistory: [
                { fromStatus: null, toStatus: 'received', changedAt: '2025-04-05T10:00:00Z', note: '주문 접수' },
                { fromStatus: 'received', toStatus: 'in-progress', changedAt: '2025-04-05T15:00:00Z', note: '' },
                { fromStatus: 'in-progress', toStatus: 'draft-done', changedAt: '2025-04-07T11:00:00Z', note: '' }
            ],
            createdAt: '2025-04-05T10:00:00Z',
            updatedAt: '2025-04-07T11:00:00Z'
        },
        {
            id: 'ORD-20250407-001',
            customerName: '최스타트업',
            customerContact: 'choi@startup.io',
            packageType: 'logo',
            price: 500000,
            description: 'AI 스타트업 로고 + 명함 디자인 (미니멀/테크 느낌)',
            status: 'revising',
            revisionCount: 1,
            revisionLimit: 5,
            statusHistory: [
                { fromStatus: null, toStatus: 'received', changedAt: '2025-04-07T08:00:00Z', note: '주문 접수' },
                { fromStatus: 'received', toStatus: 'in-progress', changedAt: '2025-04-07T10:00:00Z', note: '' },
                { fromStatus: 'in-progress', toStatus: 'draft-done', changedAt: '2025-04-08T14:00:00Z', note: '' },
                { fromStatus: 'draft-done', toStatus: 'revising', changedAt: '2025-04-08T17:00:00Z', note: '컬러 톤 변경 요청' }
            ],
            createdAt: '2025-04-07T08:00:00Z',
            updatedAt: '2025-04-08T17:00:00Z'
        },
        {
            id: 'ORD-20250409-001',
            customerName: '정쇼핑몰',
            customerContact: 'jung@shop.kr',
            packageType: 'bundle',
            price: 1200000,
            description: '종합 패키지: 쇼핑몰 런칭 세트 (로고+상세페이지+배너)',
            status: 'received',
            revisionCount: 0,
            revisionLimit: 5,
            statusHistory: [
                { fromStatus: null, toStatus: 'received', changedAt: '2025-04-09T14:00:00Z', note: '주문 접수' }
            ],
            createdAt: '2025-04-09T14:00:00Z',
            updatedAt: '2025-04-09T14:00:00Z'
        }
    ];

    Store.set('orders', demoOrders);
}

// ---- 이벤트 리스너 ----
function initEventListeners() {
    // 네비게이션
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // 모바일 메뉴 토글
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });

    // 주문 필터
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOrders(btn.dataset.filter);
        });
    });

    // 포트폴리오 필터
    document.querySelectorAll('[data-portfolio]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-portfolio]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPortfolio(btn.dataset.portfolio);
        });
    });

    // AI 도구 필터
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools(btn.dataset.tool);
        });
    });

    // 주문 폼 제출
    document.getElementById('orderForm').addEventListener('submit', saveOrder);

    // 모달 외부 클릭 닫기
    ['orderModal', 'orderDetailModal', 'portfolioModal'].forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target === document.getElementById(id)) {
                document.getElementById(id).classList.add('hidden');
            }
        });
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ['orderModal', 'orderDetailModal', 'portfolioModal'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
        }
    });
}

// ---- 초기화 ----
function init() {
    initDemoData();
    initEventListeners();
    navigateTo('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
