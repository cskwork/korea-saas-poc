// AI 콘텐츠 대행 서비스 - App Logic

// ============================================================
// DATA: 시뮬레이션 데이터
// ============================================================

const contentTemplates = {
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
{{topic}}은 더 이상 선택이 아닌 필수입니다. 지금 바로 시작하여 경쟁에서 앞서 나가세요.`
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

시작이 반입니다. 오늘부터 {{topic}}을 시작해보세요!`
    }
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

지금 주문하시면 특별 할인가로 만나보실 수 있습니다!`
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
🚚 오늘 주문 시 내일 도착 (서울/경기 기준)`
    }
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
서브: "월 29만원부터 | 무료 상담 신청"`
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
지금이 가장 빠른 때입니다."
`
    }
  ]
};

const portfolioItems = [
  { id: 1, category: 'blog', title: '디지털 마케팅 전략 가이드', industry: 'IT/테크', preview: '2026년 디지털 마케팅의 핵심 트렌드와 실행 전략을 담은 심층 블로그 포스트', icon: '📝' },
  { id: 2, category: 'blog', title: '건강식품 시장 분석 리포트', industry: '헬스케어', preview: '국내 건강식품 시장의 성장 동인과 소비자 트렌드를 분석한 인사이트 콘텐츠', icon: '📊' },
  { id: 3, category: 'product', title: '프리미엄 스킨케어 상품 설명', industry: '뷰티', preview: '성분 기반 스토리텔링으로 구매 전환율 42% 향상 달성', icon: '✨' },
  { id: 4, category: 'product', title: '스마트 가전 제품 카탈로그', industry: '가전', preview: '기술 사양을 쉽게 풀어낸 소비자 친화적 상품 설명서', icon: '🏠' },
  { id: 5, category: 'ad', title: '스타트업 런칭 캠페인', industry: 'IT/테크', preview: 'SNS 광고 + 검색 광고 통합 카피로 CPA 35% 절감', icon: '🚀' },
  { id: 6, category: 'ad', title: '오프라인 매장 홍보 카피', industry: 'F&B', preview: '지역 밀착형 광고 카피로 방문 고객 28% 증가', icon: '🏪' },
  { id: 7, category: 'blog', title: 'ESG 경영 트렌드 시리즈', industry: '제조', preview: '중소 제조기업 대상 ESG 도입 사례와 실행 가이드', icon: '🌱' },
  { id: 8, category: 'product', title: '펫용품 온라인 쇼핑몰', industry: '펫', preview: '반려동물 용품 전문 쇼핑몰의 전체 상품 설명 리뉴얼', icon: '🐾' },
  { id: 9, category: 'ad', title: '교육 플랫폼 가입 캠페인', industry: '교육', preview: '학부모 타겟 광고 카피로 무료 체험 전환율 56% 달성', icon: '📚' },
];

const dashboardOrders = [
  { id: 'ORD-2026-001', type: '블로그 포스트', topic: 'AI 마케팅 자동화 트렌드', status: '완료', date: '2026-04-01', completedDate: '2026-04-03' },
  { id: 'ORD-2026-002', type: '상품 설명', topic: '신규 스킨케어 라인 5종', status: '완료', date: '2026-04-02', completedDate: '2026-04-04' },
  { id: 'ORD-2026-003', type: '광고 카피', topic: '봄 시즌 프로모션 캠페인', status: '진행중', date: '2026-04-05', completedDate: null },
  { id: 'ORD-2026-004', type: '블로그 포스트', topic: '중소기업 디지털 전환 가이드', status: '진행중', date: '2026-04-06', completedDate: null },
  { id: 'ORD-2026-005', type: '상품 설명', topic: '여름 신상품 카탈로그', status: '대기중', date: '2026-04-07', completedDate: null },
  { id: 'ORD-2026-006', type: '광고 카피', topic: '네이버 검색광고 리뉴얼', status: '대기중', date: '2026-04-08', completedDate: null },
  { id: 'ORD-2026-007', type: '블로그 포스트', topic: '고객 성공 사례 시리즈', status: '대기중', date: '2026-04-08', completedDate: null },
];

// ============================================================
// APP STATE
// ============================================================

const state = {
  currentSection: 'hero',
  contentType: 'blog',
  portfolioFilter: 'all',
  dashboardFilter: 'all',
  mobileMenuOpen: false,
  generating: false,
};

// ============================================================
// NAVIGATION
// ============================================================

function initNavigation() {
  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
      mobileMenu.classList.toggle('open', state.mobileMenuOpen);
      menuBtn.innerHTML = state.mobileMenuOpen
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });
  }

  // Close mobile menu on nav click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (state.mobileMenuOpen) {
        state.mobileMenuOpen = false;
        mobileMenu.classList.remove('open');
        menuBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
      }
    });
  });

  // Navbar background on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-white', 'shadow-md');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-white', 'shadow-md');
      navbar.classList.add('bg-transparent');
    }
  });
}

// ============================================================
// CONTENT GENERATOR
// ============================================================

function initContentGenerator() {
  const typeBtns = document.querySelectorAll('.content-type-btn');
  const generateBtn = document.getElementById('generate-btn');
  const topicInput = document.getElementById('topic-input');

  // Content type selection
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
      });
      btn.classList.remove('bg-gray-100', 'text-gray-700');
      btn.classList.add('bg-indigo-600', 'text-white');
      state.contentType = btn.dataset.type;
      updatePlaceholder();
    });
  });

  // Generate button
  if (generateBtn) {
    generateBtn.addEventListener('click', generateContent);
  }

  // Enter key
  if (topicInput) {
    topicInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') generateContent();
    });
  }
}

function updatePlaceholder() {
  const topicInput = document.getElementById('topic-input');
  const placeholders = {
    blog: '블로그 주제를 입력하세요 (예: 디지털 마케팅)',
    product: '상품명 또는 카테고리를 입력하세요 (예: 무선 이어폰)',
    ad: '브랜드/제품명을 입력하세요 (예: 클라우드 서비스)',
  };
  if (topicInput) {
    topicInput.placeholder = placeholders[state.contentType] || '';
  }
}

async function generateContent() {
  const topicInput = document.getElementById('topic-input');
  const resultArea = document.getElementById('generation-result');
  const generateBtn = document.getElementById('generate-btn');

  const topic = topicInput.value.trim();
  if (!topic) {
    showToast('주제를 입력해주세요', 'warning');
    topicInput.focus();
    return;
  }

  if (topic.length > 200) {
    showToast('200자 이내로 입력해주세요', 'warning');
    return;
  }

  if (state.generating) return;
  state.generating = true;

  // Show loading
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<div class="spinner mx-auto" style="width:20px;height:20px;border-width:2px;"></div>';
  resultArea.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12">
      <div class="spinner mb-4"></div>
      <p class="text-gray-500">AI가 콘텐츠를 생성하고 있습니다...</p>
    </div>
  `;

  // Simulate AI generation delay
  await sleep(1500 + Math.random() * 1000);

  // Pick random template
  const templates = contentTemplates[state.contentType];
  const template = templates[Math.floor(Math.random() * templates.length)];

  const title = template.title.replace(/\{\{topic\}\}/g, topic);
  const body = template.body.replace(/\{\{topic\}\}/g, topic);

  // Animate result
  resultArea.innerHTML = `
    <div class="fade-in-up">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-bold text-gray-900">${title}</h4>
        <button onclick="copyContent()" class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          복사
        </button>
      </div>
      <div class="generated-content text-gray-700 bg-gray-50 rounded-lg p-4 text-sm leading-relaxed" id="generated-text">${body.replace(/\n/g, '<br>')}</div>
      <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>AI가 생성한 데모 콘텐츠입니다. 실제 서비스에서는 더 정교한 맞춤 콘텐츠를 제공합니다.</span>
      </div>
    </div>
  `;

  // Reset button
  generateBtn.disabled = false;
  generateBtn.innerHTML = '✨ 콘텐츠 생성하기';
  state.generating = false;
}

function copyContent() {
  const text = document.getElementById('generated-text')?.innerText;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('콘텐츠가 복사되었습니다!', 'success');
    }).catch(() => {
      showToast('복사에 실패했습니다', 'error');
    });
  }
}

// ============================================================
// PORTFOLIO
// ============================================================

function initPortfolio() {
  renderPortfolio('all');

  document.querySelectorAll('.portfolio-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.portfolio-filter-btn').forEach(b => {
        b.classList.remove('tab-active', 'text-indigo-600');
        b.classList.add('text-gray-500');
      });
      btn.classList.add('tab-active', 'text-indigo-600');
      btn.classList.remove('text-gray-500');
      renderPortfolio(btn.dataset.filter);
    });
  });
}

function renderPortfolio(filter) {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const items = filter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === filter);

  const categoryNames = { blog: '블로그', product: '상품 설명', ad: '광고 카피' };
  const categoryColors = {
    blog: 'bg-blue-100 text-blue-700',
    product: 'bg-green-100 text-green-700',
    ad: 'bg-purple-100 text-purple-700'
  };

  grid.innerHTML = items.map(item => `
    <div class="card-hover bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="portfolio-placeholder h-36 ${categoryColors[item.category].split(' ')[0]}">
        <span class="text-4xl">${item.icon}</span>
      </div>
      <div class="p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs px-2 py-1 rounded-full ${categoryColors[item.category]}">${categoryNames[item.category]}</span>
          <span class="text-xs text-gray-400">${item.industry}</span>
        </div>
        <h4 class="font-semibold text-gray-900 text-sm mb-1">${item.title}</h4>
        <p class="text-xs text-gray-500 leading-relaxed">${item.preview}</p>
      </div>
    </div>
  `).join('');
}

// ============================================================
// DASHBOARD
// ============================================================

function initDashboard() {
  renderDashboardStats();
  renderDashboardOrders('all');

  document.querySelectorAll('.dashboard-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dashboard-filter-btn').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-600');
      });
      btn.classList.remove('bg-gray-100', 'text-gray-600');
      btn.classList.add('bg-indigo-600', 'text-white');
      renderDashboardOrders(btn.dataset.filter);
    });
  });
}

function renderDashboardStats() {
  const total = dashboardOrders.length;
  const completed = dashboardOrders.filter(o => o.status === '완료').length;
  const inProgress = dashboardOrders.filter(o => o.status === '진행중').length;
  const pending = dashboardOrders.filter(o => o.status === '대기중').length;

  const statsData = [
    { label: '전체 주문', value: total, icon: '📋', color: 'bg-indigo-50 text-indigo-700' },
    { label: '진행 중', value: inProgress, icon: '⚡', color: 'bg-yellow-50 text-yellow-700' },
    { label: '완료', value: completed, icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: '대기 중', value: pending, icon: '⏳', color: 'bg-gray-50 text-gray-700' },
  ];

  const statsGrid = document.getElementById('dashboard-stats');
  if (statsGrid) {
    statsGrid.innerHTML = statsData.map(stat => `
      <div class="card-hover ${stat.color} rounded-xl p-4 text-center">
        <div class="text-2xl mb-1">${stat.icon}</div>
        <div class="text-2xl font-bold">${stat.value}</div>
        <div class="text-xs mt-1 opacity-75">${stat.label}</div>
      </div>
    `).join('');
  }
}

function renderDashboardOrders(filter) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  const orders = filter === 'all'
    ? dashboardOrders
    : dashboardOrders.filter(o => o.status === filter);

  const statusStyles = {
    '완료': 'bg-green-100 text-green-700',
    '진행중': 'bg-yellow-100 text-yellow-700',
    '대기중': 'bg-gray-100 text-gray-600',
  };

  const statusDots = {
    '완료': 'bg-green-500',
    '진행중': 'bg-yellow-500 pulse-dot',
    '대기중': 'bg-gray-400',
  };

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-gray-400">해당 상태의 주문이 없습니다</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4 text-sm font-mono text-gray-500">${order.id}</td>
      <td class="py-3 px-4">
        <div class="text-sm font-medium text-gray-900">${order.topic}</div>
        <div class="text-xs text-gray-400">${order.type}</div>
      </td>
      <td class="py-3 px-4">
        <span class="status-badge ${statusStyles[order.status]}">
          <span class="w-2 h-2 rounded-full ${statusDots[order.status]} inline-block"></span>
          ${order.status}
        </span>
      </td>
      <td class="py-3 px-4 text-sm text-gray-500">${order.date}</td>
      <td class="py-3 px-4 text-sm text-gray-500">${order.completedDate || '-'}</td>
    </tr>
  `).join('');
}

// ============================================================
// UTILITIES
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-indigo-500',
  };

  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg fade-in-up text-sm`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ============================================================
// COUNTER ANIMATION
// ============================================================

function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target.toLocaleString() + suffix;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current).toLocaleString() + suffix;
      }
    }, 16);
  });
}

// Intersection Observer for counter animation
function initCounterObserver() {
  const statsSection = document.getElementById('stats-section');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(statsSection);
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initContentGenerator();
  initPortfolio();
  initDashboard();
  initCounterObserver();
  updatePlaceholder();
});
