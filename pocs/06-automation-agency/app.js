// 06-automation-agency: 업무 자동화 대행 서비스 - AutoMate Pro
// Vanilla JS SPA with localStorage persistence

(function() {
  'use strict';

  // ========== DATA ==========

  const AUTOMATION_PACKAGES = [
    {
      id: 'pkg-001', name: '엑셀 자동화 패키지',
      category: '제조', type: '데이터처리',
      description: '반복적인 엑셀 작업을 자동화합니다. 데이터 수집, 정리, 보고서 생성까지 원클릭으로 처리됩니다.',
      tools: ['Google Apps Script', 'Make'],
      estimatedHours: 20, monthlySavingHours: 40,
      price: { setup: 1500000, monthly: 300000 },
      popularity: 95,
      details: '매일 반복되는 엑셀 작업을 자동화하여 월 40시간 이상 절감할 수 있습니다. 데이터 수집부터 가공, 보고서 생성까지 전 과정을 자동화합니다.'
    },
    {
      id: 'pkg-002', name: '이메일 자동응답 시스템',
      category: '서비스', type: '커뮤니케이션',
      description: '고객 문의에 자동으로 응답하고 분류하는 시스템. 응답 시간을 90% 단축합니다.',
      tools: ['Zapier', 'Gmail API'],
      estimatedHours: 15, monthlySavingHours: 30,
      price: { setup: 1000000, monthly: 200000 },
      popularity: 88,
      details: '고객 문의 이메일을 자동 분류하고, 템플릿 기반 자동 응답을 보냅니다. 긴급 문의는 즉시 담당자에게 알림이 전송됩니다.'
    },
    {
      id: 'pkg-003', name: '재고 관리 자동화',
      category: '유통', type: '데이터처리',
      description: '재고 수준 모니터링, 자동 발주, 재고 보고서를 자동으로 생성합니다.',
      tools: ['n8n', 'Google Sheets'],
      estimatedHours: 30, monthlySavingHours: 50,
      price: { setup: 2000000, monthly: 400000 },
      popularity: 82,
      details: '실시간 재고 모니터링, 최소 재고량 도달 시 자동 발주, 일/주/월 재고 보고서 자동 생성.'
    },
    {
      id: 'pkg-004', name: '소셜미디어 자동 포스팅',
      category: '서비스', type: '커뮤니케이션',
      description: '인스타그램, 페이스북, 블로그 등 멀티채널 자동 포스팅 및 분석 리포트.',
      tools: ['Make', 'Buffer API'],
      estimatedHours: 10, monthlySavingHours: 20,
      price: { setup: 800000, monthly: 150000 },
      popularity: 90,
      details: '콘텐츠 캘린더에 따라 자동으로 멀티채널에 포스팅하고, 성과를 분석하여 리포트를 생성합니다.'
    },
    {
      id: 'pkg-005', name: '급여 정산 자동화',
      category: 'IT', type: '결제정산',
      description: '근태 데이터 기반 급여 자동 계산, 명세서 생성, 이체 데이터 자동 생성.',
      tools: ['Google Apps Script', 'n8n'],
      estimatedHours: 25, monthlySavingHours: 35,
      price: { setup: 1800000, monthly: 350000 },
      popularity: 75,
      details: '근태 시스템과 연동하여 급여를 자동 계산하고, 급여 명세서를 자동 생성하여 발송합니다.'
    },
    {
      id: 'pkg-006', name: '고객 데이터 통합 관리',
      category: 'IT', type: '데이터처리',
      description: '여러 플랫폼의 고객 데이터를 자동으로 통합하고 CRM을 업데이트합니다.',
      tools: ['Zapier', 'Make', 'Google Sheets'],
      estimatedHours: 20, monthlySavingHours: 25,
      price: { setup: 1200000, monthly: 250000 },
      popularity: 85,
      details: '네이버, 쿠팡, 자사몰 등 다양한 채널의 고객 데이터를 자동으로 수집하고 통합 관리합니다.'
    },
    {
      id: 'pkg-007', name: '일일 리포트 자동 생성',
      category: '제조', type: '리포팅',
      description: '매일 아침 자동으로 전일 실적 리포트를 생성하여 관계자에게 발송합니다.',
      tools: ['Google Apps Script', 'Slack API'],
      estimatedHours: 12, monthlySavingHours: 15,
      price: { setup: 700000, monthly: 150000 },
      popularity: 78,
      details: '생산 실적, 매출, 재고 현황 등을 자동으로 집계하여 아침 9시에 리포트를 발송합니다.'
    },
    {
      id: 'pkg-008', name: '주문 처리 자동화',
      category: '유통', type: '데이터처리',
      description: '온라인 주문 접수부터 배송 추적까지 전 과정을 자동화합니다.',
      tools: ['n8n', 'Make', '택배 API'],
      estimatedHours: 35, monthlySavingHours: 60,
      price: { setup: 2500000, monthly: 500000 },
      popularity: 92,
      details: '쇼핑몰 주문 자동 접수, 송장 자동 생성, 배송 추적, 고객 알림까지 원스톱 자동화.'
    },
    {
      id: 'pkg-009', name: '회의록 자동 정리',
      category: '서비스', type: '커뮤니케이션',
      description: '화상회의 녹음을 텍스트로 변환하고, 핵심 내용과 액션아이템을 자동 추출합니다.',
      tools: ['Zapier', 'OpenAI API', 'Notion API'],
      estimatedHours: 15, monthlySavingHours: 20,
      price: { setup: 900000, monthly: 200000 },
      popularity: 70,
      details: 'Zoom/Google Meet 회의 녹음을 자동 전사하고, AI로 요약 및 액션아이템을 추출하여 Notion에 정리합니다.'
    },
    {
      id: 'pkg-010', name: '세금계산서 자동 발행',
      category: '기타', type: '결제정산',
      description: '매출 데이터 기반 세금계산서 자동 발행 및 국세청 전송.',
      tools: ['Google Apps Script', 'Make'],
      estimatedHours: 18, monthlySavingHours: 25,
      price: { setup: 1300000, monthly: 250000 },
      popularity: 80,
      details: '매출 발생 시 자동으로 세금계산서를 발행하고, 국세청에 전송합니다. 미수금 관리도 자동화됩니다.'
    }
  ];

  const DEMO_PROJECTS = [
    { id: 'prj-001', clientName: '(주)한국제조', packageIds: ['pkg-001', 'pkg-007'], status: '유지보수', progress: 100, assignee: '김자동', startDate: '2025-01-15', dueDate: '2025-02-15', notes: '정상 운영 중' },
    { id: 'prj-002', clientName: '스마트유통', packageIds: ['pkg-003', 'pkg-008'], status: '개발', progress: 65, assignee: '김자동', startDate: '2025-03-01', dueDate: '2025-04-01', notes: '주문처리 모듈 개발 중' },
    { id: 'prj-003', clientName: '디지털서비스랩', packageIds: ['pkg-002', 'pkg-004'], status: '테스트', progress: 85, assignee: '박자동', startDate: '2025-02-20', dueDate: '2025-03-20', notes: '최종 QA 진행 중' },
    { id: 'prj-004', clientName: '넥스트IT', packageIds: ['pkg-005', 'pkg-006'], status: '분석', progress: 20, assignee: '김자동', startDate: '2025-03-15', dueDate: '2025-04-30', notes: '요구사항 분석 단계' },
    { id: 'prj-005', clientName: '그린마트', packageIds: ['pkg-003'], status: '대기', progress: 0, assignee: '미배정', startDate: '', dueDate: '', notes: '견적 승인 대기' },
    { id: 'prj-006', clientName: '코리아무역', packageIds: ['pkg-010', 'pkg-001'], status: '배포', progress: 95, assignee: '박자동', startDate: '2025-02-01', dueDate: '2025-03-15', notes: '배포 후 안정화 모니터링' }
  ];

  const WORKFLOW_TEMPLATES = [
    {
      name: '이메일 → 자동응답',
      desc: '수신 이메일 분류 및 자동 회신',
      nodes: [
        { id: 'n1', type: 'trigger', label: '📧 이메일 수신', x: 80, y: 80, connections: ['n2'] },
        { id: 'n2', type: 'condition', label: '🔀 문의 분류', x: 280, y: 80, connections: ['n3', 'n4'] },
        { id: 'n3', type: 'action', label: '✉️ 자동 응답', x: 480, y: 30, connections: [] },
        { id: 'n4', type: 'action', label: '🔔 담당자 알림', x: 480, y: 140, connections: [] }
      ]
    },
    {
      name: '주문 → 배송 자동화',
      desc: '주문 접수부터 배송까지 자동 처리',
      nodes: [
        { id: 'n1', type: 'trigger', label: '🛒 주문 접수', x: 60, y: 100, connections: ['n2'] },
        { id: 'n2', type: 'action', label: '📋 주문 확인', x: 230, y: 100, connections: ['n3'] },
        { id: 'n3', type: 'condition', label: '📦 재고 확인', x: 400, y: 100, connections: ['n4', 'n5'] },
        { id: 'n4', type: 'action', label: '🚚 배송 처리', x: 570, y: 50, connections: [] },
        { id: 'n5', type: 'action', label: '⚠️ 품절 알림', x: 570, y: 170, connections: [] }
      ]
    },
    {
      name: '엑셀 → 보고서 자동화',
      desc: '데이터 수집부터 보고서 생성까지',
      nodes: [
        { id: 'n1', type: 'trigger', label: '⏰ 매일 9시', x: 80, y: 90, connections: ['n2'] },
        { id: 'n2', type: 'action', label: '📊 데이터 수집', x: 260, y: 90, connections: ['n3'] },
        { id: 'n3', type: 'action', label: '🔄 데이터 가공', x: 440, y: 90, connections: ['n4'] },
        { id: 'n4', type: 'action', label: '📄 보고서 생성', x: 620, y: 90, connections: [] }
      ]
    }
  ];

  const STATUS_CONFIG = {
    '대기': { color: 'gray', dot: '#9ca3af', badge: 'badge-gray' },
    '분석': { color: 'yellow', dot: '#f59e0b', badge: 'badge-yellow' },
    '개발': { color: 'blue', dot: '#2563eb', badge: 'badge-blue' },
    '테스트': { color: 'purple', dot: '#7c3aed', badge: 'badge-purple' },
    '배포': { color: 'green', dot: '#059669', badge: 'badge-green' },
    '유지보수': { color: 'green', dot: '#059669', badge: 'badge-green' }
  };

  // ========== STATE ==========

  let state = {
    currentPage: 'dashboard',
    projects: [],
    quotes: [],
    workflowNodes: [],
    selectedFilter: '전체',
    annualPricing: false
  };

  // ========== INIT ==========

  function init() {
    loadState();
    if (state.projects.length === 0) {
      state.projects = JSON.parse(JSON.stringify(DEMO_PROJECTS));
      saveState();
    }
    setupNavigation();
    renderPage(state.currentPage);
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('automate-pro-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem('automate-pro-state', JSON.stringify({
        projects: state.projects,
        quotes: state.quotes,
        workflowNodes: state.workflowNodes
      }));
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  }

  // ========== NAVIGATION ==========

  function setupNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const page = tab.dataset.page;
        navigateTo(page);
        // Close mobile menu
        document.getElementById('navTabs').classList.remove('show');
      });
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
      document.getElementById('navTabs').classList.toggle('show');
    });

    document.getElementById('navLogo').addEventListener('click', () => {
      navigateTo('dashboard');
    });
  }

  function navigateTo(page) {
    state.currentPage = page;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-tab[data-page="${page}"]`);
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`page-${page}`);
    if (section) {
      section.classList.add('active');
      section.classList.add('fade-in');
    }

    renderPage(page);
  }

  function renderPage(page) {
    switch(page) {
      case 'dashboard': renderDashboard(); break;
      case 'catalog': renderCatalog(); break;
      case 'roi': renderROI(); break;
      case 'workflow': renderWorkflow(); break;
      case 'projects': renderProjects(); break;
      case 'quote': renderQuote(); break;
      case 'pricing': renderPricing(); break;
    }
  }

  // ========== DASHBOARD ==========

  function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    const activeProjects = state.projects.filter(p => !['대기', '유지보수'].includes(p.status)).length;
    const maintenanceProjects = state.projects.filter(p => p.status === '유지보수').length;
    const monthlyRevenue = state.projects
      .filter(p => p.status === '유지보수')
      .reduce((sum, p) => {
        return sum + p.packageIds.reduce((s, pid) => {
          const pkg = AUTOMATION_PACKAGES.find(pk => pk.id === pid);
          return s + (pkg ? pkg.price.monthly : 0);
        }, 0);
      }, 0);
    const totalQuotes = state.quotes.length;

    container.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">진행 중 프로젝트</div>
          <div class="stat-value">${activeProjects}</div>
          <div class="stat-change">↑ 활발히 진행 중</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">유지보수 고객</div>
          <div class="stat-value">${maintenanceProjects}</div>
          <div class="stat-change">구독 중인 고객</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">월 구독 수익</div>
          <div class="stat-value">${formatKRW(monthlyRevenue)}</div>
          <div class="stat-change">↑ 월간 반복 수익</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">생성된 견적</div>
          <div class="stat-value">${totalQuotes}</div>
          <div class="stat-change">누적 견적 수</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="card" style="grid-column: span 1;">
          <h3 style="font-weight:700; margin-bottom:1rem; font-size:1rem;">📊 프로젝트 현황</h3>
          <div id="dashboard-project-status"></div>
        </div>
        <div class="card" style="grid-column: span 1;">
          <h3 style="font-weight:700; margin-bottom:1rem; font-size:1rem;">🔥 인기 자동화 패키지</h3>
          <div id="dashboard-popular"></div>
        </div>
      </div>

      <div class="card">
        <h3 style="font-weight:700; margin-bottom:1rem; font-size:1rem;">📋 최근 프로젝트</h3>
        <div id="dashboard-recent-projects"></div>
      </div>
    `;

    // Project status breakdown
    const statusContainer = document.getElementById('dashboard-project-status');
    const statuses = ['대기', '분석', '개발', '테스트', '배포', '유지보수'];
    statusContainer.innerHTML = statuses.map(s => {
      const count = state.projects.filter(p => p.status === s).length;
      const pct = state.projects.length > 0 ? (count / state.projects.length * 100) : 0;
      return `
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
            <span><span class="status-dot" style="background:${STATUS_CONFIG[s].dot}"></span>${s}</span>
            <span style="font-weight:600;">${count}건</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${STATUS_CONFIG[s].color === 'gray' ? 'blue' : STATUS_CONFIG[s].color}" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Popular packages
    const popularContainer = document.getElementById('dashboard-popular');
    const topPackages = [...AUTOMATION_PACKAGES].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    popularContainer.innerHTML = topPackages.map((pkg, i) => `
      <div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0; ${i < 4 ? 'border-bottom:1px solid var(--gray-100);' : ''}">
        <span style="font-weight:700; color:var(--primary); width:20px;">${i + 1}</span>
        <div style="flex:1;">
          <div style="font-size:0.85rem; font-weight:600;">${pkg.name}</div>
          <div style="font-size:0.7rem; color:var(--gray-500);">${pkg.category} · 월 ${pkg.monthlySavingHours}시간 절감</div>
        </div>
        <span class="badge badge-blue">${pkg.popularity}%</span>
      </div>
    `).join('');

    // Recent projects
    const recentContainer = document.getElementById('dashboard-recent-projects');
    const recentProjects = [...state.projects].slice(0, 5);
    recentContainer.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="project-table">
          <thead>
            <tr><th>고객명</th><th>상태</th><th>진행률</th><th>담당자</th></tr>
          </thead>
          <tbody>
            ${recentProjects.map(p => `
              <tr>
                <td style="font-weight:600;">${p.clientName}</td>
                <td><span class="badge ${STATUS_CONFIG[p.status].badge}">${p.status}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div class="progress-bar" style="flex:1;max-width:100px;">
                      <div class="progress-fill ${STATUS_CONFIG[p.status].color === 'gray' ? 'blue' : STATUS_CONFIG[p.status].color}" style="width:${p.progress}%"></div>
                    </div>
                    <span style="font-size:0.8rem;font-weight:600;">${p.progress}%</span>
                  </div>
                </td>
                <td>${p.assignee}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Make responsive for mobile
    const gridEl = container.querySelector('div[style*="grid-template-columns: 1fr 1fr"]');
    if (gridEl && window.innerWidth < 768) {
      gridEl.style.gridTemplateColumns = '1fr';
    }
  }

  // ========== CATALOG ==========

  function renderCatalog() {
    const container = document.getElementById('catalog-content');
    const categories = ['전체', '제조', '유통', '서비스', 'IT', '기타'];
    const types = ['전체', '데이터처리', '커뮤니케이션', '리포팅', '결제정산'];

    let filteredPackages = AUTOMATION_PACKAGES;
    if (state.selectedFilter !== '전체') {
      filteredPackages = AUTOMATION_PACKAGES.filter(p =>
        p.category === state.selectedFilter || p.type === state.selectedFilter
      );
    }

    container.innerHTML = `
      <div style="margin-bottom:1rem;">
        <div style="font-size:0.8rem; font-weight:600; color:var(--gray-500); margin-bottom:0.5rem;">업종별</div>
        <div class="filter-chips">
          ${categories.map(c => `
            <button class="filter-chip ${state.selectedFilter === c ? 'active' : ''}" onclick="window.AutomatePro.setFilter('${c}')">${c}</button>
          `).join('')}
        </div>
        <div style="font-size:0.8rem; font-weight:600; color:var(--gray-500); margin-bottom:0.5rem;">유형별</div>
        <div class="filter-chips">
          ${types.map(t => `
            <button class="filter-chip ${state.selectedFilter === t ? 'active' : ''}" onclick="window.AutomatePro.setFilter('${t}')">${t}</button>
          `).join('')}
        </div>
      </div>

      <div class="card-grid">
        ${filteredPackages.map(pkg => `
          <div class="card" style="cursor:pointer;" onclick="window.AutomatePro.showPackageDetail('${pkg.id}')">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
              <span class="badge badge-blue">${pkg.category}</span>
              <span class="badge badge-purple">${pkg.type}</span>
            </div>
            <h3 style="font-weight:700; font-size:1.05rem; margin-bottom:0.5rem;">${pkg.name}</h3>
            <p style="font-size:0.8rem; color:var(--gray-500); margin-bottom:1rem; line-height:1.5;">${pkg.description}</p>
            <div class="package-tools">
              ${pkg.tools.map(t => `<span class="badge badge-gray">${t}</span>`).join('')}
            </div>
            <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:0.7rem; color:var(--gray-400);">월 절감</div>
                <div style="font-weight:700; color:var(--accent);">${pkg.monthlySavingHours}시간</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.7rem; color:var(--gray-400);">구축비</div>
                <div style="font-weight:700;">${formatKRW(pkg.price.setup)}</div>
              </div>
            </div>
            <div style="margin-top:0.5rem; display:flex; align-items:center; gap:0.5rem;">
              <div class="progress-bar" style="flex:1;">
                <div class="progress-fill blue" style="width:${pkg.popularity}%"></div>
              </div>
              <span style="font-size:0.7rem; color:var(--gray-400);">인기 ${pkg.popularity}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function showPackageDetail(pkgId) {
    const pkg = AUTOMATION_PACKAGES.find(p => p.id === pkgId);
    if (!pkg) return;

    showModal(`
      <h2 style="font-weight:700; font-size:1.25rem; margin-bottom:0.5rem;">${pkg.name}</h2>
      <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
        <span class="badge badge-blue">${pkg.category}</span>
        <span class="badge badge-purple">${pkg.type}</span>
      </div>
      <p style="color:var(--gray-600); line-height:1.6; margin-bottom:1.5rem;">${pkg.details}</p>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="background:var(--primary-light); padding:1rem; border-radius:0.5rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--primary);">예상 구축 기간</div>
          <div style="font-size:1.25rem; font-weight:700; color:var(--primary-dark);">${pkg.estimatedHours}시간</div>
        </div>
        <div style="background:var(--accent-light); padding:1rem; border-radius:0.5rem; text-align:center;">
          <div style="font-size:0.75rem; color:var(--accent);">월 절감 시간</div>
          <div style="font-size:1.25rem; font-weight:700; color:#047857;">${pkg.monthlySavingHours}시간</div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <div style="font-weight:600; margin-bottom:0.5rem;">사용 도구</div>
        <div class="package-tools">
          ${pkg.tools.map(t => `<span class="badge badge-gray" style="font-size:0.8rem; padding:0.3rem 0.8rem;">${t}</span>`).join('')}
        </div>
      </div>

      <div style="background:var(--gray-50); padding:1.25rem; border-radius:0.75rem; margin-bottom:1.5rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="color:var(--gray-600);">초기 구축 비용</span>
          <span style="font-weight:700;">${formatKRW(pkg.price.setup)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--gray-600);">월 유지보수 비용</span>
          <span style="font-weight:700; color:var(--primary);">${formatKRW(pkg.price.monthly)}/월</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" style="width:100%;" onclick="window.AutomatePro.addToQuote('${pkg.id}'); closeModal();">
        📝 견적에 추가하기
      </button>
    `);
  }

  // ========== ROI CALCULATOR ==========

  function renderROI() {
    const container = document.getElementById('roi-content');
    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
        <div class="card" style="grid-column: span 1;">
          <h3 style="font-weight:700; margin-bottom:1.5rem;">📊 업무 현황 입력</h3>

          <div class="roi-input-group">
            <label>주당 반복 업무 시간</label>
            <div class="roi-input-row">
              <input type="range" id="roiHoursWeek" min="5" max="80" value="30" oninput="window.AutomatePro.calcROI()">
              <input type="number" id="roiHoursWeekNum" min="5" max="80" value="30" oninput="document.getElementById('roiHoursWeek').value=this.value; window.AutomatePro.calcROI()">
              <span style="font-size:0.8rem;color:var(--gray-500);">시간/주</span>
            </div>
          </div>

          <div class="roi-input-group">
            <label>시간당 인건비</label>
            <div class="roi-input-row">
              <input type="range" id="roiHourlyRate" min="10000" max="100000" step="5000" value="25000" oninput="window.AutomatePro.calcROI()">
              <input type="number" id="roiHourlyRateNum" min="10000" max="100000" step="5000" value="25000" oninput="document.getElementById('roiHourlyRate').value=this.value; window.AutomatePro.calcROI()">
              <span style="font-size:0.8rem;color:var(--gray-500);">원/시간</span>
            </div>
          </div>

          <div class="roi-input-group">
            <label>자동화 가능 비율</label>
            <div class="roi-input-row">
              <input type="range" id="roiAutoRate" min="10" max="90" value="60" oninput="window.AutomatePro.calcROI()">
              <input type="number" id="roiAutoRateNum" min="10" max="90" value="60" oninput="document.getElementById('roiAutoRate').value=this.value; window.AutomatePro.calcROI()">
              <span style="font-size:0.8rem;color:var(--gray-500);">%</span>
            </div>
          </div>

          <div class="roi-input-group">
            <label>예상 자동화 투자 비용 (1회)</label>
            <div class="roi-input-row">
              <input type="range" id="roiInvestment" min="500000" max="10000000" step="500000" value="2000000" oninput="window.AutomatePro.calcROI()">
              <input type="number" id="roiInvestmentNum" min="500000" max="10000000" step="500000" value="2000000" oninput="document.getElementById('roiInvestment').value=this.value; window.AutomatePro.calcROI()">
              <span style="font-size:0.8rem;color:var(--gray-500);">원</span>
            </div>
          </div>
        </div>

        <div class="card" style="grid-column: span 1;">
          <h3 style="font-weight:700; margin-bottom:1.5rem;">💰 예상 절감 효과</h3>
          <div id="roi-results" class="roi-result-grid"></div>
          <div id="roi-chart" style="margin-top:1.5rem;"></div>
        </div>
      </div>
    `;

    // Sync number inputs
    ['roiHoursWeek', 'roiHourlyRate', 'roiAutoRate', 'roiInvestment'].forEach(id => {
      const range = document.getElementById(id);
      const num = document.getElementById(id + 'Num');
      range.addEventListener('input', () => { num.value = range.value; });
    });

    // Make responsive
    const grid = container.querySelector('div[style*="grid-template-columns: 1fr 1fr"]');
    if (grid && window.innerWidth < 768) {
      grid.style.gridTemplateColumns = '1fr';
    }

    calcROI();
  }

  function calcROI() {
    const hoursWeek = parseInt(document.getElementById('roiHoursWeek')?.value || 30);
    const hourlyRate = parseInt(document.getElementById('roiHourlyRate')?.value || 25000);
    const autoRate = parseInt(document.getElementById('roiAutoRate')?.value || 60) / 100;
    const investment = parseInt(document.getElementById('roiInvestment')?.value || 2000000);

    const monthlySavedHours = hoursWeek * 4 * autoRate;
    const monthlySavedCost = monthlySavedHours * hourlyRate;
    const yearlySavedHours = monthlySavedHours * 12;
    const yearlySavedCost = monthlySavedCost * 12;
    const roiPercent = ((yearlySavedCost - investment) / investment * 100);
    const paybackMonths = Math.ceil(investment / monthlySavedCost);

    const resultsEl = document.getElementById('roi-results');
    if (!resultsEl) return;

    resultsEl.innerHTML = `
      <div class="roi-result-card" style="background:var(--primary-light);">
        <div class="roi-result-value" style="color:var(--primary);">${monthlySavedHours.toFixed(0)}시간</div>
        <div class="roi-result-label" style="color:var(--primary);">월간 절감 시간</div>
      </div>
      <div class="roi-result-card" style="background:var(--accent-light);">
        <div class="roi-result-value" style="color:var(--accent);">${formatKRW(monthlySavedCost)}</div>
        <div class="roi-result-label" style="color:var(--accent);">월간 절감 비용</div>
      </div>
      <div class="roi-result-card" style="background:var(--secondary-light);">
        <div class="roi-result-value" style="color:var(--secondary);">${yearlySavedHours.toFixed(0)}시간</div>
        <div class="roi-result-label" style="color:var(--secondary);">연간 절감 시간</div>
      </div>
      <div class="roi-result-card" style="background:#fef3c7;">
        <div class="roi-result-value" style="color:#d97706;">${formatKRW(yearlySavedCost)}</div>
        <div class="roi-result-label" style="color:#d97706;">연간 절감 비용</div>
      </div>
      <div class="roi-result-card" style="background:${roiPercent > 0 ? 'var(--accent-light)' : '#fee2e2'};">
        <div class="roi-result-value" style="color:${roiPercent > 0 ? 'var(--accent)' : 'var(--danger)'};">${roiPercent.toFixed(0)}%</div>
        <div class="roi-result-label" style="color:${roiPercent > 0 ? 'var(--accent)' : 'var(--danger)'};">투자 수익률 (ROI)</div>
      </div>
      <div class="roi-result-card" style="background:var(--primary-light);">
        <div class="roi-result-value" style="color:var(--primary);">${paybackMonths}개월</div>
        <div class="roi-result-label" style="color:var(--primary);">투자 회수 기간</div>
      </div>
    `;

    // Simple bar chart
    const chartEl = document.getElementById('roi-chart');
    if (chartEl) {
      const months = [1, 3, 6, 12];
      const maxVal = yearlySavedCost;
      chartEl.innerHTML = `
        <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.75rem;">📈 누적 절감 효과</div>
        ${months.map(m => {
          const val = monthlySavedCost * m;
          const pct = maxVal > 0 ? (val / maxVal * 100) : 0;
          return `
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
              <span style="width:40px; font-size:0.75rem; color:var(--gray-500);">${m}개월</span>
              <div style="flex:1; height:24px; background:var(--gray-100); border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--primary), var(--secondary)); border-radius:4px; display:flex; align-items:center; justify-content:flex-end; padding-right:0.5rem;">
                  <span style="font-size:0.65rem; color:white; font-weight:600;">${formatKRW(val)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
        <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px dashed var(--gray-300);">
          <span style="font-size:0.75rem; color:var(--gray-500);">투자비</span>
          <div style="flex:1; height:24px; background:#fee2e2; border-radius:4px; display:flex; align-items:center; padding-left:0.5rem;">
            <span style="font-size:0.65rem; color:var(--danger); font-weight:600;">${formatKRW(investment)}</span>
          </div>
        </div>
      `;
    }
  }

  // ========== WORKFLOW BUILDER ==========

  let dragState = null;
  let nodeIdCounter = 100;

  function renderWorkflow() {
    const container = document.getElementById('workflow-content');
    container.innerHTML = `
      <div style="display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="window.AutomatePro.clearWorkflow()">🗑️ 캔버스 초기화</button>
      </div>

      <div class="workflow-canvas-container">
        <div class="workflow-toolbar">
          <span style="font-size:0.8rem; font-weight:600; color:var(--gray-500); margin-right:0.5rem;">노드 추가:</span>
          <button class="workflow-node-btn trigger" onclick="window.AutomatePro.addNode('trigger')">⚡ 트리거</button>
          <button class="workflow-node-btn action" onclick="window.AutomatePro.addNode('action')">⚙️ 액션</button>
          <button class="workflow-node-btn condition" onclick="window.AutomatePro.addNode('condition')">🔀 조건</button>
        </div>
        <div class="workflow-canvas" id="workflowCanvas">
          <svg class="workflow-svg" id="workflowSvg"></svg>
        </div>
      </div>

      <div style="margin-top:1.5rem;">
        <h3 style="font-weight:700; font-size:1rem; margin-bottom:0.5rem;">📋 템플릿 워크플로우</h3>
        <p style="font-size:0.8rem; color:var(--gray-500); margin-bottom:0.75rem;">클릭하면 캔버스에 자동 배치됩니다.</p>
        <div class="template-grid">
          ${WORKFLOW_TEMPLATES.map((t, i) => `
            <div class="template-card" onclick="window.AutomatePro.loadTemplate(${i})">
              <h4>${t.name}</h4>
              <p>${t.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    renderWorkflowNodes();
    setupCanvasDrag();
  }

  function renderWorkflowNodes() {
    const canvas = document.getElementById('workflowCanvas');
    const svg = document.getElementById('workflowSvg');
    if (!canvas || !svg) return;

    // Remove existing nodes (keep svg)
    canvas.querySelectorAll('.wf-node').forEach(n => n.remove());

    // Draw nodes
    state.workflowNodes.forEach(node => {
      const el = document.createElement('div');
      el.className = `wf-node ${node.type}`;
      el.id = `node-${node.id}`;
      el.style.left = node.x + 'px';
      el.style.top = node.y + 'px';
      el.innerHTML = `
        ${node.label}
        <button class="delete-node" onclick="event.stopPropagation(); window.AutomatePro.deleteNode('${node.id}')">✕</button>
      `;
      el.setAttribute('data-node-id', node.id);
      canvas.appendChild(el);
    });

    // Draw connections
    drawConnections();
  }

  function drawConnections() {
    const svg = document.getElementById('workflowSvg');
    if (!svg) return;
    svg.innerHTML = '';

    state.workflowNodes.forEach(node => {
      if (!node.connections) return;
      node.connections.forEach(targetId => {
        const target = state.workflowNodes.find(n => n.id === targetId);
        if (!target) return;

        const fromEl = document.getElementById(`node-${node.id}`);
        const toEl = document.getElementById(`node-${target.id}`);
        if (!fromEl || !toEl) return;

        const fromX = node.x + fromEl.offsetWidth;
        const fromY = node.y + fromEl.offsetHeight / 2;
        const toX = target.x;
        const toY = target.y + toEl.offsetHeight / 2;

        const midX = (fromX + toX) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`);
        path.setAttribute('stroke', '#9ca3af');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '6,3');

        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        arrow.setAttribute('cx', toX);
        arrow.setAttribute('cy', toY);
        arrow.setAttribute('r', '4');
        arrow.setAttribute('fill', '#9ca3af');

        svg.appendChild(path);
        svg.appendChild(arrow);
      });
    });
  }

  function setupCanvasDrag() {
    const canvas = document.getElementById('workflowCanvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      const nodeEl = e.target.closest('.wf-node');
      if (!nodeEl) return;
      const nodeId = nodeEl.getAttribute('data-node-id');
      const node = state.workflowNodes.find(n => n.id === nodeId);
      if (!node) return;

      dragState = {
        nodeId,
        offsetX: e.clientX - node.x,
        offsetY: e.clientY - node.y
      };
      nodeEl.style.zIndex = '20';
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragState) return;
      const node = state.workflowNodes.find(n => n.id === dragState.nodeId);
      if (!node) return;

      const canvas = document.getElementById('workflowCanvas');
      const rect = canvas.getBoundingClientRect();
      node.x = Math.max(0, Math.min(e.clientX - dragState.offsetX, rect.width - 140));
      node.y = Math.max(0, Math.min(e.clientY - dragState.offsetY, rect.height - 40));

      const el = document.getElementById(`node-${node.id}`);
      if (el) {
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
      }
      drawConnections();
    });

    document.addEventListener('mouseup', () => {
      if (dragState) {
        const el = document.getElementById(`node-${dragState.nodeId}`);
        if (el) el.style.zIndex = '10';
        dragState = null;
        saveState();
      }
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      const nodeEl = e.target.closest('.wf-node');
      if (!nodeEl) return;
      const nodeId = nodeEl.getAttribute('data-node-id');
      const node = state.workflowNodes.find(n => n.id === nodeId);
      if (!node) return;

      const touch = e.touches[0];
      dragState = {
        nodeId,
        offsetX: touch.clientX - node.x,
        offsetY: touch.clientY - node.y
      };
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!dragState) return;
      const node = state.workflowNodes.find(n => n.id === dragState.nodeId);
      if (!node) return;

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      node.x = Math.max(0, Math.min(touch.clientX - dragState.offsetX, rect.width - 140));
      node.y = Math.max(0, Math.min(touch.clientY - dragState.offsetY, rect.height - 40));

      const el = document.getElementById(`node-${node.id}`);
      if (el) {
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
      }
      drawConnections();
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      dragState = null;
      saveState();
    });
  }

  function addNode(type) {
    const labels = {
      trigger: ['⚡ 웹훅 트리거', '⏰ 스케줄 트리거', '📧 이메일 트리거', '📥 폼 제출'],
      action: ['⚙️ 데이터 변환', '📤 API 호출', '🔔 알림 전송', '📊 보고서 생성', '💾 DB 저장'],
      condition: ['🔀 조건 분기', '🔍 필터', '⚖️ A/B 분기']
    };

    const options = labels[type];
    const label = options[Math.floor(Math.random() * options.length)];
    const canvas = document.getElementById('workflowCanvas');
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 600, height: 400 };

    const node = {
      id: 'n' + (++nodeIdCounter),
      type,
      label,
      x: 50 + Math.random() * (rect.width - 200),
      y: 30 + Math.random() * 250,
      connections: []
    };

    state.workflowNodes.push(node);
    saveState();
    renderWorkflowNodes();
    setupCanvasDrag();
    showToast(`${label} 노드가 추가되었습니다`);
  }

  function deleteNode(nodeId) {
    state.workflowNodes = state.workflowNodes.filter(n => n.id !== nodeId);
    state.workflowNodes.forEach(n => {
      n.connections = (n.connections || []).filter(c => c !== nodeId);
    });
    saveState();
    renderWorkflowNodes();
    setupCanvasDrag();
  }

  function clearWorkflow() {
    state.workflowNodes = [];
    saveState();
    renderWorkflowNodes();
    showToast('캔버스가 초기화되었습니다');
  }

  function loadTemplate(index) {
    const template = WORKFLOW_TEMPLATES[index];
    if (!template) return;
    state.workflowNodes = JSON.parse(JSON.stringify(template.nodes));
    saveState();
    renderWorkflowNodes();
    setupCanvasDrag();
    showToast(`'${template.name}' 템플릿이 로드되었습니다`);
  }

  // ========== PROJECTS ==========

  function renderProjects() {
    const container = document.getElementById('projects-content');
    const statusFilter = state.projectStatusFilter || '전체';
    const statuses = ['전체', '대기', '분석', '개발', '테스트', '배포', '유지보수'];

    let filtered = state.projects;
    if (statusFilter !== '전체') {
      filtered = state.projects.filter(p => p.status === statusFilter);
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
        <div class="filter-chips">
          ${statuses.map(s => `
            <button class="filter-chip ${statusFilter === s ? 'active' : ''}" onclick="window.AutomatePro.filterProjects('${s}')">${s}${s !== '전체' ? ` (${state.projects.filter(p => p.status === s).length})` : ''}</button>
          `).join('')}
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.AutomatePro.showAddProject()">+ 새 프로젝트</button>
      </div>

      <div class="card" style="overflow-x:auto;">
        <table class="project-table">
          <thead>
            <tr>
              <th>고객명</th>
              <th>패키지</th>
              <th>상태</th>
              <th>진행률</th>
              <th>담당자</th>
              <th>기한</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => {
              const pkgNames = p.packageIds.map(pid => {
                const pkg = AUTOMATION_PACKAGES.find(pk => pk.id === pid);
                return pkg ? pkg.name : pid;
              });
              return `
                <tr>
                  <td style="font-weight:600;">${p.clientName}</td>
                  <td>${pkgNames.map(n => `<span class="badge badge-blue" style="margin:1px;">${n}</span>`).join('')}</td>
                  <td>
                    <span class="badge ${STATUS_CONFIG[p.status]?.badge || 'badge-gray'}">
                      <span class="status-dot" style="background:${STATUS_CONFIG[p.status]?.dot || '#9ca3af'}"></span>
                      ${p.status}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                      <div class="progress-bar" style="width:80px;">
                        <div class="progress-fill ${STATUS_CONFIG[p.status]?.color === 'gray' ? 'blue' : (STATUS_CONFIG[p.status]?.color || 'blue')}" style="width:${p.progress}%"></div>
                      </div>
                      <span style="font-size:0.8rem;font-weight:600;">${p.progress}%</span>
                    </div>
                  </td>
                  <td>${p.assignee}</td>
                  <td style="font-size:0.8rem;">${p.dueDate || '-'}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="window.AutomatePro.editProject('${p.id}')">수정</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📂</div>프로젝트가 없습니다</div>' : ''}
      </div>
    `;
  }

  function filterProjects(status) {
    state.projectStatusFilter = status;
    renderProjects();
  }

  function showAddProject() {
    showModal(`
      <h2 style="font-weight:700; font-size:1.2rem; margin-bottom:1.5rem;">새 프로젝트 추가</h2>
      <div class="form-group">
        <label>고객명</label>
        <input type="text" id="projClientName" placeholder="예: (주)한국기업">
      </div>
      <div class="form-group">
        <label>자동화 패키지</label>
        <select id="projPackage">
          ${AUTOMATION_PACKAGES.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>담당자</label>
        <input type="text" id="projAssignee" placeholder="예: 김자동" value="김자동">
      </div>
      <div class="form-group">
        <label>시작일</label>
        <input type="date" id="projStartDate">
      </div>
      <div class="form-group">
        <label>마감일</label>
        <input type="date" id="projDueDate">
      </div>
      <div class="form-group">
        <label>메모</label>
        <textarea id="projNotes" rows="2" placeholder="프로젝트 메모"></textarea>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="window.AutomatePro.saveNewProject()">프로젝트 생성</button>
    `);
  }

  function saveNewProject() {
    const clientName = document.getElementById('projClientName').value.trim();
    if (!clientName) { showToast('고객명을 입력해주세요'); return; }

    const project = {
      id: 'prj-' + Date.now(),
      clientName,
      packageIds: [document.getElementById('projPackage').value],
      status: '대기',
      progress: 0,
      assignee: document.getElementById('projAssignee').value.trim() || '미배정',
      startDate: document.getElementById('projStartDate').value,
      dueDate: document.getElementById('projDueDate').value,
      notes: document.getElementById('projNotes').value.trim()
    };

    state.projects.push(project);
    saveState();
    closeModal();
    renderProjects();
    showToast('프로젝트가 생성되었습니다');
  }

  function editProject(projId) {
    const proj = state.projects.find(p => p.id === projId);
    if (!proj) return;

    const statuses = ['대기', '분석', '개발', '테스트', '배포', '유지보수'];
    showModal(`
      <h2 style="font-weight:700; font-size:1.2rem; margin-bottom:1.5rem;">프로젝트 수정</h2>
      <div class="form-group">
        <label>고객명</label>
        <input type="text" id="editClientName" value="${proj.clientName}">
      </div>
      <div class="form-group">
        <label>상태</label>
        <select id="editStatus">
          ${statuses.map(s => `<option value="${s}" ${proj.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>진행률 (${proj.progress}%)</label>
        <input type="range" id="editProgress" min="0" max="100" value="${proj.progress}" oninput="this.previousElementSibling.textContent='진행률 ('+this.value+'%)'">
      </div>
      <div class="form-group">
        <label>담당자</label>
        <input type="text" id="editAssignee" value="${proj.assignee}">
      </div>
      <div class="form-group">
        <label>마감일</label>
        <input type="date" id="editDueDate" value="${proj.dueDate}">
      </div>
      <div class="form-group">
        <label>메모</label>
        <textarea id="editNotes" rows="2">${proj.notes}</textarea>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.AutomatePro.saveEditProject('${proj.id}')">저장</button>
        <button class="btn btn-secondary" onclick="window.AutomatePro.deleteProject('${proj.id}')" style="color:var(--danger);">삭제</button>
      </div>
    `);
  }

  function saveEditProject(projId) {
    const proj = state.projects.find(p => p.id === projId);
    if (!proj) return;

    proj.clientName = document.getElementById('editClientName').value.trim();
    proj.status = document.getElementById('editStatus').value;
    proj.progress = parseInt(document.getElementById('editProgress').value);
    proj.assignee = document.getElementById('editAssignee').value.trim();
    proj.dueDate = document.getElementById('editDueDate').value;
    proj.notes = document.getElementById('editNotes').value.trim();

    saveState();
    closeModal();
    renderProjects();
    showToast('프로젝트가 수정되었습니다');
  }

  function deleteProject(projId) {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    state.projects = state.projects.filter(p => p.id !== projId);
    saveState();
    closeModal();
    renderProjects();
    showToast('프로젝트가 삭제되었습니다');
  }

  // ========== QUOTE BUILDER ==========

  function renderQuote() {
    const container = document.getElementById('quote-content');

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
        <div style="grid-column: span 1;">
          <div class="card" style="margin-bottom:1rem;">
            <h3 style="font-weight:700; margin-bottom:1rem;">📝 견적 정보</h3>
            <div class="form-group">
              <label>고객명 / 회사명</label>
              <input type="text" id="quoteClientName" placeholder="예: (주)한국기업">
            </div>
            <div class="form-group">
              <label>유효기간 (일)</label>
              <input type="number" id="quoteValidDays" value="30" min="7" max="90">
            </div>
          </div>

          <div class="card">
            <h3 style="font-weight:700; margin-bottom:1rem;">📦 자동화 항목 선택</h3>
            <div id="quote-package-list">
              ${AUTOMATION_PACKAGES.map(pkg => `
                <div style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0; border-bottom:1px solid var(--gray-100);">
                  <input type="checkbox" id="qpkg-${pkg.id}" value="${pkg.id}" onchange="window.AutomatePro.updateQuoteTotal()" ${(state.quoteSelectedPkgs || []).includes(pkg.id) ? 'checked' : ''}>
                  <label for="qpkg-${pkg.id}" style="flex:1; font-size:0.85rem; cursor:pointer;">
                    <span style="font-weight:600;">${pkg.name}</span>
                    <span style="color:var(--gray-400); font-size:0.75rem;"> · ${pkg.category}</span>
                  </label>
                  <select id="qcplx-${pkg.id}" onchange="window.AutomatePro.updateQuoteTotal()" style="padding:0.25rem 0.5rem; border:1px solid var(--gray-300); border-radius:0.25rem; font-size:0.75rem;">
                    <option value="단순">단순</option>
                    <option value="보통" selected>보통</option>
                    <option value="복잡">복잡</option>
                  </select>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div style="grid-column: span 1;">
          <div class="card" style="position:sticky; top:80px;">
            <h3 style="font-weight:700; margin-bottom:1rem;">💰 견적서 미리보기</h3>
            <div id="quote-preview"></div>
            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
              <button class="btn btn-primary" style="flex:1;" onclick="window.AutomatePro.saveQuote()">💾 견적 저장</button>
              <button class="btn btn-accent" onclick="window.AutomatePro.downloadQuote()">📄 PDF</button>
            </div>
          </div>

          <div class="card" style="margin-top:1rem;">
            <h3 style="font-weight:700; margin-bottom:1rem;">📋 저장된 견적 (${state.quotes.length})</h3>
            <div id="saved-quotes-list">
              ${state.quotes.length === 0 ? '<div class="empty-state" style="padding:1rem;"><div class="empty-state-icon">📋</div>저장된 견적이 없습니다</div>' : ''}
              ${state.quotes.map(q => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid var(--gray-100);">
                  <div>
                    <div style="font-weight:600; font-size:0.85rem;">${q.clientName}</div>
                    <div style="font-size:0.7rem; color:var(--gray-400);">${q.createdAt} · ${q.items.length}개 항목</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:700; font-size:0.85rem; color:var(--primary);">${formatKRW(q.monthlyTotal)}/월</div>
                    <button class="btn btn-secondary btn-sm" style="font-size:0.65rem; padding:0.2rem 0.5rem;" onclick="window.AutomatePro.deleteQuote('${q.id}')">삭제</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Make responsive
    const grid = container.querySelector('div[style*="grid-template-columns: 1fr 1fr"]');
    if (grid && window.innerWidth < 768) {
      grid.style.gridTemplateColumns = '1fr';
    }

    updateQuoteTotal();
  }

  function updateQuoteTotal() {
    const complexityMultiplier = { '단순': 0.7, '보통': 1.0, '복잡': 1.5 };
    let setupTotal = 0;
    let monthlyTotal = 0;
    const items = [];

    AUTOMATION_PACKAGES.forEach(pkg => {
      const checkbox = document.getElementById(`qpkg-${pkg.id}`);
      if (checkbox && checkbox.checked) {
        const complexityEl = document.getElementById(`qcplx-${pkg.id}`);
        const complexity = complexityEl ? complexityEl.value : '보통';
        const mult = complexityMultiplier[complexity];
        const setup = Math.round(pkg.price.setup * mult);
        const monthly = Math.round(pkg.price.monthly * mult);

        setupTotal += setup;
        monthlyTotal += monthly;
        items.push({ packageId: pkg.id, packageName: pkg.name, complexity, setupCost: setup, monthlyCost: monthly });
      }
    });

    const preview = document.getElementById('quote-preview');
    if (!preview) return;

    if (items.length === 0) {
      preview.innerHTML = '<div class="empty-state" style="padding:1rem;">항목을 선택해주세요</div>';
      return;
    }

    preview.innerHTML = `
      <div class="quote-items">
        <div style="display:flex; justify-content:space-between; padding:0.5rem 1rem; background:var(--gray-50); font-size:0.75rem; font-weight:600; color:var(--gray-500);">
          <span>항목</span>
          <span>구축비 / 월비용</span>
        </div>
        ${items.map(item => `
          <div class="quote-item">
            <div class="quote-item-name">
              ${item.packageName}
              <span class="badge badge-gray">${item.complexity}</span>
            </div>
            <div style="text-align:right; font-size:0.85rem;">
              <div>${formatKRW(item.setupCost)}</div>
              <div style="color:var(--primary);">${formatKRW(item.monthlyCost)}/월</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="quote-summary">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
          <span style="color:var(--gray-600);">초기 구축 비용 합계</span>
          <span style="font-weight:700; font-size:1.1rem;">${formatKRW(setupTotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
          <span style="color:var(--gray-600);">월 유지보수 비용 합계</span>
          <span style="font-weight:700; font-size:1.1rem; color:var(--primary);">${formatKRW(monthlyTotal)}/월</span>
        </div>
        <div style="border-top:2px solid var(--gray-300); padding-top:0.75rem; display:flex; justify-content:space-between;">
          <span style="font-weight:700;">연간 총 비용</span>
          <span style="font-weight:800; font-size:1.2rem; color:var(--primary);">${formatKRW(setupTotal + monthlyTotal * 12)}</span>
        </div>
      </div>
    `;

    // Store selected packages in state
    state.quoteSelectedPkgs = items.map(i => i.packageId);
  }

  function addToQuote(pkgId) {
    if (!state.quoteSelectedPkgs) state.quoteSelectedPkgs = [];
    if (!state.quoteSelectedPkgs.includes(pkgId)) {
      state.quoteSelectedPkgs.push(pkgId);
    }
    navigateTo('quote');
    setTimeout(() => {
      const checkbox = document.getElementById(`qpkg-${pkgId}`);
      if (checkbox) {
        checkbox.checked = true;
        updateQuoteTotal();
      }
    }, 100);
    showToast('견적에 추가되었습니다');
  }

  function saveQuote() {
    const clientName = document.getElementById('quoteClientName')?.value.trim();
    if (!clientName) { showToast('고객명을 입력해주세요'); return; }

    const complexityMultiplier = { '단순': 0.7, '보통': 1.0, '복잡': 1.5 };
    const items = [];
    let setupTotal = 0, monthlyTotal = 0;

    AUTOMATION_PACKAGES.forEach(pkg => {
      const checkbox = document.getElementById(`qpkg-${pkg.id}`);
      if (checkbox && checkbox.checked) {
        const complexity = document.getElementById(`qcplx-${pkg.id}`)?.value || '보통';
        const mult = complexityMultiplier[complexity];
        const setup = Math.round(pkg.price.setup * mult);
        const monthly = Math.round(pkg.price.monthly * mult);
        setupTotal += setup;
        monthlyTotal += monthly;
        items.push({ packageId: pkg.id, packageName: pkg.name, complexity, setupCost: setup, monthlyCost: monthly });
      }
    });

    if (items.length === 0) { showToast('최소 1개 항목을 선택해주세요'); return; }

    const validDays = parseInt(document.getElementById('quoteValidDays')?.value || 30);
    const now = new Date();
    const validUntil = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

    const quote = {
      id: 'q-' + Date.now(),
      clientName,
      items,
      setupTotal,
      monthlyTotal,
      discount: 0,
      createdAt: now.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0]
    };

    state.quotes.push(quote);
    saveState();
    renderQuote();
    showToast('견적이 저장되었습니다');
  }

  function deleteQuote(quoteId) {
    state.quotes = state.quotes.filter(q => q.id !== quoteId);
    saveState();
    renderQuote();
    showToast('견적이 삭제되었습니다');
  }

  function downloadQuote() {
    const clientName = document.getElementById('quoteClientName')?.value.trim() || '고객';
    const items = [];
    const complexityMultiplier = { '단순': 0.7, '보통': 1.0, '복잡': 1.5 };
    let setupTotal = 0, monthlyTotal = 0;

    AUTOMATION_PACKAGES.forEach(pkg => {
      const checkbox = document.getElementById(`qpkg-${pkg.id}`);
      if (checkbox && checkbox.checked) {
        const complexity = document.getElementById(`qcplx-${pkg.id}`)?.value || '보통';
        const mult = complexityMultiplier[complexity];
        const setup = Math.round(pkg.price.setup * mult);
        const monthly = Math.round(pkg.price.monthly * mult);
        setupTotal += setup;
        monthlyTotal += monthly;
        items.push({ name: pkg.name, complexity, setup, monthly });
      }
    });

    if (items.length === 0) { showToast('항목을 선택해주세요'); return; }

    // Generate a text-based quote (simulating PDF)
    let text = `
══════════════════════════════════════════
         AutoMate Pro 견적서
══════════════════════════════════════════

고객명: ${clientName}
작성일: ${new Date().toLocaleDateString('ko-KR')}
유효기한: ${document.getElementById('quoteValidDays')?.value || 30}일

──────────────────────────────────────────
항목 목록
──────────────────────────────────────────
${items.map((item, i) => `
${i + 1}. ${item.name} [${item.complexity}]
   - 초기 구축: ${formatKRW(item.setup)}
   - 월 유지보수: ${formatKRW(item.monthly)}
`).join('')}
──────────────────────────────────────────

초기 구축 비용 합계: ${formatKRW(setupTotal)}
월 유지보수 합계: ${formatKRW(monthlyTotal)}/월
연간 총 비용: ${formatKRW(setupTotal + monthlyTotal * 12)}

══════════════════════════════════════════
AutoMate Pro | 업무 자동화 대행 서비스
══════════════════════════════════════════
    `;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `견적서_${clientName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('견적서가 다운로드되었습니다');
  }

  // ========== PRICING ==========

  function renderPricing() {
    const container = document.getElementById('pricing-content');
    const annual = state.annualPricing;
    const discount = annual ? 0.8 : 1;

    const plans = [
      {
        name: '기본',
        price: Math.round(490000 * discount),
        description: '소규모 자동화를 시작하는 기업',
        features: [
          '자동화 최대 3개',
          '기본 워크플로우 템플릿',
          '이메일 지원',
          '월 1회 리포트',
          '기본 모니터링',
          '업무 시간 내 대응'
        ],
        featured: false,
        cta: '시작하기'
      },
      {
        name: '프로',
        price: Math.round(990000 * discount),
        description: '본격적인 업무 자동화가 필요한 기업',
        features: [
          '자동화 최대 10개',
          '커스텀 워크플로우 설계',
          '전화 + 이메일 지원',
          '주간 리포트',
          '실시간 모니터링',
          '4시간 내 긴급 대응',
          '전담 매니저 배정',
          '분기별 최적화 컨설팅'
        ],
        featured: true,
        cta: '가장 인기'
      },
      {
        name: '엔터프라이즈',
        price: Math.round(1990000 * discount),
        description: '대규모 자동화와 전사적 도입이 필요한 기업',
        features: [
          '무제한 자동화',
          '완전 맞춤 설계 & 개발',
          '24/7 전담 지원',
          '실시간 대시보드',
          '고급 분석 리포트',
          '1시간 내 긴급 대응',
          '전담 팀 배정',
          '월간 전략 미팅',
          'API 연동 개발',
          'SLA 보장'
        ],
        featured: false,
        cta: '문의하기'
      }
    ];

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:2rem;">
        <h2 style="font-size:1.75rem; font-weight:800; margin-bottom:0.5rem;">합리적인 가격, 확실한 효과</h2>
        <p style="color:var(--gray-500);">비즈니스 규모에 맞는 플랜을 선택하세요</p>
      </div>

      <div class="toggle-container">
        <span class="toggle-label ${!annual ? 'active' : ''}">월간 결제</span>
        <div class="toggle-switch ${annual ? 'active' : ''}" id="pricingToggle" onclick="window.AutomatePro.togglePricing()"></div>
        <span class="toggle-label ${annual ? 'active' : ''}">연간 결제 <span class="badge badge-green">20% 할인</span></span>
      </div>

      <div class="pricing-grid">
        ${plans.map(plan => `
          <div class="pricing-card ${plan.featured ? 'featured' : ''}">
            <div class="pricing-name">${plan.name}</div>
            <p style="font-size:0.85rem; color:var(--gray-500); margin-bottom:0.5rem;">${plan.description}</p>
            <div class="pricing-price">
              ${formatKRW(plan.price)}
              <span>/월</span>
            </div>
            ${annual ? `<p style="font-size:0.8rem; color:var(--accent); margin-bottom:0.5rem;">연간 결제 시 ${formatKRW(plan.price * 12)}/년</p>` : ''}
            <ul class="pricing-features">
              ${plan.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-lg" style="width:100%;" onclick="showToast('${plan.name} 플랜 문의가 접수되었습니다!')">
              ${plan.cta}
            </button>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-top:2rem;">
        <h3 style="font-weight:700; text-align:center; margin-bottom:1.5rem;">📊 플랜 비교</h3>
        <div style="overflow-x:auto;">
          <table class="project-table" style="text-align:center;">
            <thead>
              <tr>
                <th style="text-align:left;">기능</th>
                <th>기본</th>
                <th style="background:var(--primary-light);">프로</th>
                <th>엔터프라이즈</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="text-align:left;">자동화 개수</td><td>3개</td><td style="background:var(--primary-light);">10개</td><td>무제한</td></tr>
              <tr><td style="text-align:left;">워크플로우 설계</td><td>템플릿</td><td style="background:var(--primary-light);">커스텀</td><td>완전 맞춤</td></tr>
              <tr><td style="text-align:left;">리포트</td><td>월 1회</td><td style="background:var(--primary-light);">주간</td><td>실시간</td></tr>
              <tr><td style="text-align:left;">지원</td><td>이메일</td><td style="background:var(--primary-light);">전화+이메일</td><td>24/7 전담</td></tr>
              <tr><td style="text-align:left;">대응 시간</td><td>업무 시간</td><td style="background:var(--primary-light);">4시간</td><td>1시간</td></tr>
              <tr><td style="text-align:left;">전담 매니저</td><td>❌</td><td style="background:var(--primary-light);">✅</td><td>✅ (팀)</td></tr>
              <tr><td style="text-align:left;">컨설팅</td><td>❌</td><td style="background:var(--primary-light);">분기별</td><td>월간</td></tr>
              <tr><td style="text-align:left;">API 개발</td><td>❌</td><td style="background:var(--primary-light);">❌</td><td>✅</td></tr>
              <tr><td style="text-align:left;">SLA 보장</td><td>❌</td><td style="background:var(--primary-light);">❌</td><td>✅</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function togglePricing() {
    state.annualPricing = !state.annualPricing;
    renderPricing();
  }

  // ========== HELPERS ==========

  function formatKRW(amount) {
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(1) + '억';
    }
    if (amount >= 10000) {
      return Math.round(amount / 10000) + '만원';
    }
    return amount.toLocaleString('ko-KR') + '원';
  }

  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  function showModal(content) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalOverlay';
    overlay.innerHTML = `
      <div class="modal-content fade-in">
        <button class="modal-close" onclick="closeModal()">×</button>
        ${content}
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
  }

  window.closeModal = function() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.remove();
  };

  window.showToast = showToast;

  // ========== PUBLIC API ==========

  window.AutomatePro = {
    setFilter(f) { state.selectedFilter = f; renderCatalog(); },
    showPackageDetail,
    calcROI,
    addNode,
    deleteNode,
    clearWorkflow,
    loadTemplate,
    filterProjects,
    showAddProject,
    saveNewProject,
    editProject,
    saveEditProject,
    deleteProject,
    updateQuoteTotal,
    addToQuote,
    saveQuote,
    deleteQuote,
    downloadQuote,
    togglePricing
  };

  // ========== BOOT ==========

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
