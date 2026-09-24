// ============================================================
// DevFlow — 프리랜서 개발 비즈니스 관리 플랫폼
// ============================================================

// === UTILITY ===
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split('T')[0];
const formatKRW = (n) => new Intl.NumberFormat('ko-KR').format(n) + '원';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';

// === STORAGE ===
function loadData(key, fallback) {
  try {
    const d = localStorage.getItem('devflow_' + key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}
function saveData(key, data) {
  localStorage.setItem('devflow_' + key, JSON.stringify(data));
}

// === STATE ===
let portfolios = loadData('portfolios', []);
let projects = loadData('projects', []);
let estimates = loadData('estimates', []);
let clients = loadData('clients', []);
let timeEntries = loadData('timeEntries', []);
let servicePlans = loadData('servicePlans', []);

// === SEED DEMO DATA ===
function seedDemoData() {
  if (loadData('seeded', false)) return;

  clients = [
    { id: uuid(), name: '김태현', company: '(주)디지털크리에이티브', email: 'kim@digicre.kr', phone: '010-1234-5678', grade: 'vip', notes: '장기 파트너, 웹사이트 리뉴얼 3회', createdAt: '2025-01-15' },
    { id: uuid(), name: '이수진', company: '스타트업허브', email: 'lee@starthub.io', phone: '010-2345-6789', grade: 'regular', notes: 'MVP 개발 의뢰, 추가 프로젝트 가능', createdAt: '2025-03-20' },
    { id: uuid(), name: '박민수', company: '로컬푸드마켓', email: 'park@localfood.kr', phone: '010-3456-7890', grade: 'new', notes: '배달 앱 견적 문의', createdAt: '2025-06-10' },
    { id: uuid(), name: '정하나', company: '에듀테크솔루션', email: 'jung@edutech.kr', phone: '010-4567-8901', grade: 'regular', notes: 'LMS 플랫폼 유지보수', createdAt: '2025-04-01' },
    { id: uuid(), name: '최영호', company: '피트니스365', email: 'choi@fitness365.kr', phone: '010-5678-9012', grade: 'new', notes: '운동 앱 개발 상담', createdAt: '2025-07-05' },
  ];

  const c = clients;
  projects = [
    { id: uuid(), title: '디지크리 홈페이지 리뉴얼', clientId: c[0].id, status: 'done', budget: 5000000, deadline: '2025-05-30', priority: 'high', hours: 120, createdAt: '2025-03-01', completedAt: '2025-05-25' },
    { id: uuid(), title: '스타트업허브 MVP 개발', clientId: c[1].id, status: 'progress', budget: 8000000, deadline: '2025-09-15', priority: 'high', hours: 80, createdAt: '2025-06-01', completedAt: null },
    { id: uuid(), title: '로컬푸드 배달 앱', clientId: c[2].id, status: 'inquiry', budget: 12000000, deadline: '2025-12-31', priority: 'medium', hours: 0, createdAt: '2025-07-10', completedAt: null },
    { id: uuid(), title: 'LMS 플랫폼 기능 추가', clientId: c[3].id, status: 'review', budget: 3000000, deadline: '2025-08-20', priority: 'medium', hours: 40, createdAt: '2025-07-01', completedAt: null },
    { id: uuid(), title: '피트니스 앱 프로토타입', clientId: c[4].id, status: 'progress', budget: 4000000, deadline: '2025-10-30', priority: 'low', hours: 20, createdAt: '2025-07-15', completedAt: null },
    { id: uuid(), title: '디지크리 관리자 대시보드', clientId: c[0].id, status: 'done', budget: 3500000, deadline: '2025-02-28', priority: 'medium', hours: 60, createdAt: '2025-01-15', completedAt: '2025-02-26' },
    { id: uuid(), title: '에듀테크 랜딩페이지', clientId: c[3].id, status: 'done', budget: 1500000, deadline: '2025-04-30', priority: 'low', hours: 25, createdAt: '2025-04-01', completedAt: '2025-04-25' },
  ];

  portfolios = [
    { id: uuid(), title: '디지털크리에이티브 웹사이트', description: '반응형 기업 웹사이트 풀스택 리뉴얼. Next.js 기반 SSR, Headless CMS 연동.', techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Strapi'], imageUrl: '', projectUrl: 'https://example.com', duration: '3개월', createdAt: '2025-05-25' },
    { id: uuid(), title: '스타트업허브 SaaS MVP', description: 'B2B SaaS 플랫폼 MVP. 사용자 관리, 구독 결제, 대시보드 기능 포함.', techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'], imageUrl: '', projectUrl: '', duration: '4개월 (진행중)', createdAt: '2025-06-01' },
    { id: uuid(), title: '로컬푸드 모바일 앱 UI', description: '식품 배달 앱 UI/UX 디자인 및 React Native 프로토타입.', techStack: ['React Native', 'Figma', 'Expo'], imageUrl: '', projectUrl: '', duration: '1개월', createdAt: '2025-07-10' },
    { id: uuid(), title: 'LMS 교육 플랫폼', description: '온라인 교육 플랫폼. 강의 관리, 퀴즈, 수강생 진도 추적 기능.', techStack: ['Vue.js', 'Django', 'MySQL', 'AWS'], imageUrl: '', projectUrl: 'https://example.com', duration: '2개월', createdAt: '2025-04-25' },
  ];

  const p = projects;
  estimates = [
    {
      id: 'EST-20250710-001', clientId: c[2].id, projectTitle: '로컬푸드 배달 앱',
      items: [
        { name: 'UI/UX 디자인', qty: 1, price: 2000000 },
        { name: '프론트엔드 개발 (React Native)', qty: 1, price: 5000000 },
        { name: '백엔드 API 개발', qty: 1, price: 3000000 },
        { name: '서버 구축 및 배포', qty: 1, price: 1000000 },
        { name: '테스트 및 QA', qty: 1, price: 1000000 },
      ],
      subtotal: 12000000, tax: 1200000, total: 13200000,
      status: 'sent', createdAt: '2025-07-10'
    },
    {
      id: 'EST-20250701-001', clientId: c[3].id, projectTitle: 'LMS 기능 추가',
      items: [
        { name: '퀴즈 모듈 개발', qty: 1, price: 1500000 },
        { name: '실시간 채팅 기능', qty: 1, price: 1000000 },
        { name: '관리자 리포트', qty: 1, price: 500000 },
      ],
      subtotal: 3000000, tax: 300000, total: 3300000,
      status: 'accepted', createdAt: '2025-07-01'
    },
    {
      id: 'EST-20250715-001', clientId: c[4].id, projectTitle: '피트니스 앱 프로토타입',
      items: [
        { name: '앱 디자인', qty: 1, price: 1000000 },
        { name: '프론트엔드 개발', qty: 1, price: 2000000 },
        { name: '백엔드 API', qty: 1, price: 1000000 },
      ],
      subtotal: 4000000, tax: 400000, total: 4400000,
      status: 'draft', createdAt: '2025-07-15'
    },
  ];

  timeEntries = [
    { id: uuid(), projectId: p[1].id, date: '2025-07-20', hours: 6, description: 'API 엔드포인트 구현' },
    { id: uuid(), projectId: p[1].id, date: '2025-07-21', hours: 8, description: '프론트엔드 페이지 개발' },
    { id: uuid(), projectId: p[1].id, date: '2025-07-22', hours: 5, description: '결제 모듈 연동' },
    { id: uuid(), projectId: p[4].id, date: '2025-07-20', hours: 4, description: 'UI 컴포넌트 제작' },
    { id: uuid(), projectId: p[4].id, date: '2025-07-21', hours: 3, description: '운동 기록 화면 개발' },
    { id: uuid(), projectId: p[3].id, date: '2025-07-19', hours: 7, description: '퀴즈 모듈 테스트' },
    { id: uuid(), projectId: p[3].id, date: '2025-07-20', hours: 5, description: '채팅 기능 QA' },
    { id: uuid(), projectId: p[0].id, date: '2025-05-20', hours: 8, description: '최종 디버깅 및 배포' },
    { id: uuid(), projectId: p[5].id, date: '2025-02-20', hours: 7, description: '대시보드 차트 구현' },
    { id: uuid(), projectId: p[6].id, date: '2025-04-20', hours: 6, description: '랜딩페이지 퍼블리싱' },
  ];

  servicePlans = [
    // 웹사이트
    { id: uuid(), category: 'website', tier: 'basic', name: '베이직 웹사이트', price: 1500000, features: ['반응형 디자인 (5페이지)', '기본 SEO 설정', '문의 폼', '1개월 유지보수'] },
    { id: uuid(), category: 'website', tier: 'standard', name: '스탠다드 웹사이트', price: 3500000, features: ['반응형 디자인 (10페이지)', 'CMS 연동', '고급 SEO', '다국어 지원', 'GA4 연동', '3개월 유지보수'] },
    { id: uuid(), category: 'website', tier: 'premium', name: '프리미엄 웹사이트', price: 7000000, features: ['맞춤 디자인 (무제한)', 'Headless CMS', '결제/예약 시스템', 'API 연동', '성능 최적화', '6개월 유지보수', '24시간 긴급 대응'] },
    // 앱
    { id: uuid(), category: 'app', tier: 'basic', name: '베이직 앱', price: 5000000, features: ['단일 플랫폼 (iOS 또는 Android)', '기본 UI (5화면)', '푸시 알림', '1개월 유지보수'] },
    { id: uuid(), category: 'app', tier: 'standard', name: '스탠다드 앱', price: 10000000, features: ['크로스 플랫폼 (React Native)', 'UI/UX 맞춤 디자인 (15화면)', '결제 연동', '소셜 로그인', '관리자 웹', '3개월 유지보수'] },
    { id: uuid(), category: 'app', tier: 'premium', name: '프리미엄 앱', price: 20000000, features: ['네이티브 앱 (iOS + Android)', '무제한 화면', '실시간 기능 (채팅/알림)', '고급 분석', 'CI/CD 파이프라인', '6개월 유지보수', '앱스토어 등록 대행'] },
    // 노코드/로코드
    { id: uuid(), category: 'nocode', tier: 'basic', name: '노코드 랜딩페이지', price: 500000, features: ['Framer/Webflow 기반', '1페이지 랜딩', '기본 폼', '2주 납기'] },
    { id: uuid(), category: 'nocode', tier: 'standard', name: '로코드 비즈니스 앱', price: 2000000, features: ['Bubble/Softr 기반', '사용자 인증', 'DB 연동', '기본 대시보드', '1개월 납기', '2개월 유지보수'] },
    { id: uuid(), category: 'nocode', tier: 'premium', name: '로코드 SaaS MVP', price: 5000000, features: ['Bubble + 커스텀 코드', '결제 구독 시스템', '관리자 패널', 'API 연동', '2개월 납기', '3개월 유지보수', '확장 컨설팅'] },
  ];

  saveAll();
  saveData('seeded', true);
}

function saveAll() {
  saveData('portfolios', portfolios);
  saveData('projects', projects);
  saveData('estimates', estimates);
  saveData('clients', clients);
  saveData('timeEntries', timeEntries);
  saveData('servicePlans', servicePlans);
}

// === NAVIGATION ===
function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const section = document.getElementById('page-' + pageId);
  if (section) section.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  // Close mobile menu
  document.getElementById('navSidebar').classList.remove('show');
  document.getElementById('mobileOverlay').classList.remove('show');

  // Render page
  renderPage(pageId);
}

function toggleMobileMenu() {
  document.getElementById('navSidebar').classList.toggle('show');
  document.getElementById('mobileOverlay').classList.toggle('show');
}

// === MODAL ===
function openModal(id) {
  document.getElementById(id).classList.add('active');
  // Populate client selects
  populateClientSelects();
  populateProjectSelects();
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function populateClientSelects() {
  ['proj-client', 'est-client'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    sel.innerHTML = '<option value="">-- 고객 선택 --</option>' +
      clients.map(c => `<option value="${c.id}">${c.name} (${c.company})</option>`).join('');
  });
}

function populateProjectSelects() {
  const sel = document.getElementById('te-project');
  if (!sel) return;
  const active = projects.filter(p => p.status !== 'done');
  sel.innerHTML = '<option value="">-- 프로젝트 선택 --</option>' +
    active.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
}

// === RENDER ROUTER ===
function renderPage(pageId) {
  switch(pageId) {
    case 'dashboard': renderDashboard(); break;
    case 'portfolio': renderPortfolio(); break;
    case 'projects': renderKanban(); break;
    case 'estimates': renderEstimates(); break;
    case 'clients': renderClients(); break;
    case 'tracking': renderTracking(); break;
    case 'pricing': renderPricing(); break;
  }
}

// === HELPERS ===
function getClientName(id) {
  const c = clients.find(c => c.id === id);
  return c ? c.name : '-';
}
function getClientCompany(id) {
  const c = clients.find(c => c.id === id);
  return c ? c.company : '';
}

const STATUS_LABELS = { inquiry: '문의', progress: '진행 중', review: '검수 중', done: '완료' };
const PRIORITY_LABELS = { low: '낮음', medium: '보통', high: '높음' };
const EST_STATUS_LABELS = { draft: '작성 중', sent: '발송됨', accepted: '수락됨', invoiced: '인보이스' };
const GRADE_LABELS = { new: '신규', regular: '일반', vip: 'VIP' };
const ICONS = ['🌐', '📱', '🖥️', '⚡', '🎨', '🔧'];

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const totalRevenue = projects.filter(p => p.status === 'done').reduce((s, p) => s + (p.budget || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'progress' || p.status === 'review').length;
  const totalClients = clients.length;
  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
  const avgHourlyRate = totalHours > 0 ? Math.round(totalRevenue / totalHours) : 0;

  document.getElementById('dashboardStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(99,102,241,0.1);color:var(--primary);">💰</div>
      <div class="stat-value">${formatKRW(totalRevenue)}</div>
      <div class="stat-label">총 수익 (완료 기준)</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(6,182,212,0.1);color:var(--secondary);">📋</div>
      <div class="stat-value">${activeProjects}건</div>
      <div class="stat-label">진행 중 프로젝트</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(16,185,129,0.1);color:var(--success);">👥</div>
      <div class="stat-value">${totalClients}명</div>
      <div class="stat-label">등록 고객</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(245,158,11,0.1);color:var(--accent);">⏱️</div>
      <div class="stat-value">${formatKRW(avgHourlyRate)}/h</div>
      <div class="stat-label">평균 시급</div>
    </div>
  `;

  // Monthly goals
  const monthlyTarget = 5000000;
  const monthRevenue = projects.filter(p => {
    if (p.status !== 'done' || !p.completedAt) return false;
    const d = new Date(p.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, p) => s + (p.budget || 0), 0);
  const progress = Math.min(100, Math.round((monthRevenue / monthlyTarget) * 100));

  document.getElementById('monthlyGoals').innerHTML = `
    <div style="margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span style="font-size:0.85rem;font-weight:500;">월 수익 목표</span>
        <span style="font-size:0.85rem;color:var(--primary);font-weight:600;">${formatKRW(monthRevenue)} / ${formatKRW(monthlyTarget)}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%;background:linear-gradient(90deg,var(--primary),var(--secondary));"></div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--gray-400);margin-top:0.25rem;">${progress}% 달성</div>
    </div>
    <div style="margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span style="font-size:0.85rem;font-weight:500;">활성 프로젝트</span>
        <span style="font-size:0.85rem;font-weight:600;">${activeProjects} / 5건</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${Math.min(100, activeProjects * 20)}%;background:var(--success);"></div>
      </div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span style="font-size:0.85rem;font-weight:500;">포트폴리오 항목</span>
        <span style="font-size:0.85rem;font-weight:600;">${portfolios.length}건</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${Math.min(100, portfolios.length * 10)}%;background:var(--accent);"></div>
      </div>
    </div>
  `;

  // Recent projects
  const recent = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  document.getElementById('recentProjects').innerHTML = recent.length ? `
    <table class="data-table">
      <thead><tr><th>프로젝트</th><th>고객</th><th>상태</th><th>예산</th><th>마감일</th></tr></thead>
      <tbody>${recent.map(p => `
        <tr>
          <td style="font-weight:500;">${p.title}</td>
          <td>${getClientName(p.clientId)}</td>
          <td><span class="badge badge-${p.status}">${STATUS_LABELS[p.status]}</span></td>
          <td>${formatKRW(p.budget || 0)}</td>
          <td>${formatDate(p.deadline)}</td>
        </tr>
      `).join('')}</tbody>
    </table>
  ` : '<div class="empty-state"><div class="empty-state-icon">📋</div><p>프로젝트가 없습니다.</p></div>';

  // Revenue chart
  drawRevenueChart();
}

function drawRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Group completed projects by month
  const monthData = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthData[key] = 0;
  }

  projects.filter(p => p.status === 'done' && p.completedAt).forEach(p => {
    const d = new Date(p.completedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthData[key] !== undefined) monthData[key] += p.budget || 0;
  });

  const labels = Object.keys(monthData).map(k => {
    const [y, m] = k.split('-');
    return `${parseInt(m)}월`;
  });
  const values = Object.values(monthData);
  const maxVal = Math.max(...values, 1000000);

  const padL = 70, padR = 20, padT = 20, padB = 40;
  const w = canvas.width - padL - padR;
  const h = canvas.height - padT - padB;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Y axis
  ctx.fillStyle = '#9ca3af';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padT + h - (h * i / 4);
    const val = Math.round(maxVal * i / 4);
    ctx.fillText(formatKRW(val), padL - 8, y + 4);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + w, y);
    ctx.stroke();
  }

  // Bars
  const barW = Math.min(40, w / labels.length * 0.6);
  const gap = w / labels.length;
  ctx.textAlign = 'center';

  values.forEach((val, i) => {
    const x = padL + gap * i + gap / 2;
    const barH = (val / maxVal) * h;
    const y = padT + h - barH;

    // Gradient bar
    const grad = ctx.createLinearGradient(x - barW/2, y, x - barW/2, padT + h);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#a5b4fc');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - barW/2, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText(labels[i], x, padT + h + 20);

    // Value on top
    if (val > 0) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText((val / 10000).toFixed(0) + '만', x, y - 6);
    }
  });
}

// ============================================================
// PORTFOLIO
// ============================================================
function renderPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!portfolios.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎨</div><p class="empty-state-text">포트폴리오가 비어있습니다.</p><button class="btn btn-primary" onclick="openModal(\'portfolioModal\')">첫 프로젝트 추가하기</button></div>';
    return;
  }

  grid.innerHTML = portfolios.map((p, idx) => `
    <div class="portfolio-card">
      <div class="portfolio-image">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" onerror="this.parentElement.innerHTML='${ICONS[idx % ICONS.length]}'">` : ICONS[idx % ICONS.length]}
      </div>
      <div class="portfolio-info">
        <div class="portfolio-title">${p.title}</div>
        <div class="portfolio-desc">${p.description}</div>
        <div class="portfolio-tags">
          ${p.techStack.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="portfolio-footer">
          <span>🕐 ${p.duration}</span>
          <div style="display:flex;gap:0.35rem;">
            ${p.projectUrl ? `<a href="${p.projectUrl}" target="_blank" class="btn btn-sm btn-secondary" style="text-decoration:none;">🔗 보기</a>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deletePortfolio('${p.id}')">삭제</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function savePortfolio() {
  const title = document.getElementById('pf-title').value.trim();
  if (!title) { alert('프로젝트명을 입력하세요.'); return; }

  portfolios.push({
    id: uuid(),
    title,
    description: document.getElementById('pf-desc').value.trim(),
    techStack: document.getElementById('pf-tech').value.split(',').map(s => s.trim()).filter(Boolean),
    imageUrl: document.getElementById('pf-image').value.trim(),
    projectUrl: document.getElementById('pf-url').value.trim(),
    duration: document.getElementById('pf-duration').value.trim() || '-',
    createdAt: today(),
  });

  saveData('portfolios', portfolios);
  closeModal('portfolioModal');
  // Reset form
  ['pf-title', 'pf-desc', 'pf-tech', 'pf-image', 'pf-url', 'pf-duration'].forEach(id => document.getElementById(id).value = '');
  renderPortfolio();
}

function deletePortfolio(id) {
  if (!confirm('이 포트폴리오 항목을 삭제하시겠습니까?')) return;
  portfolios = portfolios.filter(p => p.id !== id);
  saveData('portfolios', portfolios);
  renderPortfolio();
}

// ============================================================
// KANBAN (Projects)
// ============================================================
function renderKanban() {
  const board = document.getElementById('kanbanBoard');
  const columns = [
    { key: 'inquiry', label: '💬 문의', color: '#f59e0b' },
    { key: 'progress', label: '🔨 진행 중', color: '#3b82f6' },
    { key: 'review', label: '🔍 검수 중', color: '#8b5cf6' },
    { key: 'done', label: '✅ 완료', color: '#10b981' },
  ];

  board.innerHTML = columns.map(col => {
    const cards = projects.filter(p => p.status === col.key);
    const statuses = columns.map(c => c.key);
    const colIdx = statuses.indexOf(col.key);

    return `
      <div class="kanban-column">
        <div class="kanban-col-header" style="border-bottom-color:${col.color};">
          <span class="kanban-col-title">${col.label}</span>
          <span class="kanban-count">${cards.length}</span>
        </div>
        ${cards.map(p => `
          <div class="kanban-card">
            <div style="display:flex;align-items:center;gap:0.35rem;margin-bottom:0.25rem;">
              <span class="priority-dot priority-${p.priority}"></span>
              <span class="kanban-card-title">${p.title}</span>
            </div>
            <div class="kanban-card-client">${getClientName(p.clientId)} · ${getClientCompany(p.clientId)}</div>
            <div class="kanban-card-meta">
              <span class="kanban-card-budget">${formatKRW(p.budget || 0)}</span>
              <span>${p.deadline ? formatDate(p.deadline) : '-'}</span>
            </div>
            <div class="kanban-card-actions">
              ${colIdx > 0 ? `<button class="kanban-move-btn" onclick="moveProject('${p.id}','${statuses[colIdx-1]}')">← ${columns[colIdx-1].label.split(' ')[1] || columns[colIdx-1].label}</button>` : ''}
              ${colIdx < statuses.length - 1 ? `<button class="kanban-move-btn" onclick="moveProject('${p.id}','${statuses[colIdx+1]}')">→ ${columns[colIdx+1].label.split(' ')[1] || columns[colIdx+1].label}</button>` : ''}
              <button class="kanban-move-btn" style="margin-left:auto;color:var(--danger);" onclick="deleteProject('${p.id}')">삭제</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function moveProject(id, newStatus) {
  const p = projects.find(p => p.id === id);
  if (!p) return;
  p.status = newStatus;
  if (newStatus === 'done' && !p.completedAt) {
    p.completedAt = today();
  }
  saveData('projects', projects);
  renderKanban();
}

function saveProject() {
  const title = document.getElementById('proj-title').value.trim();
  if (!title) { alert('프로젝트명을 입력하세요.'); return; }

  projects.push({
    id: uuid(),
    title,
    clientId: document.getElementById('proj-client').value,
    status: document.getElementById('proj-status').value,
    budget: parseInt(document.getElementById('proj-budget').value) || 0,
    deadline: document.getElementById('proj-deadline').value,
    priority: document.getElementById('proj-priority').value,
    hours: 0,
    createdAt: today(),
    completedAt: null,
  });

  saveData('projects', projects);
  closeModal('projectModal');
  ['proj-title', 'proj-budget', 'proj-deadline'].forEach(id => document.getElementById(id).value = '');
  renderKanban();
}

function deleteProject(id) {
  if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return;
  projects = projects.filter(p => p.id !== id);
  saveData('projects', projects);
  renderKanban();
}

// ============================================================
// ESTIMATES
// ============================================================
let currentEstimateFilter = 'all';

function renderEstimates() {
  filterEstimates(currentEstimateFilter);
}

function filterEstimates(status, tabEl) {
  currentEstimateFilter = status;
  // Update tabs
  document.querySelectorAll('#estimateTabs .section-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  else document.querySelector(`#estimateTabs .section-tab`)?.classList.add('active');

  const filtered = status === 'all' ? estimates : estimates.filter(e => e.status === status);
  const list = document.getElementById('estimatesList');

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📄</div><p class="empty-state-text">견적서가 없습니다.</p></div>';
    return;
  }

  list.innerHTML = `
    <div class="card">
      <table class="data-table">
        <thead><tr><th>견적번호</th><th>고객</th><th>프로젝트</th><th>합계</th><th>상태</th><th>날짜</th><th>액션</th></tr></thead>
        <tbody>${filtered.map(e => `
          <tr>
            <td style="font-family:monospace;font-size:0.8rem;">${e.id}</td>
            <td>${getClientName(e.clientId)}</td>
            <td>${e.projectTitle}</td>
            <td style="font-weight:600;">${formatKRW(e.total)}</td>
            <td><span class="badge badge-${e.status}">${EST_STATUS_LABELS[e.status]}</span></td>
            <td>${formatDate(e.createdAt)}</td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="previewEstimate('${e.id}')">미리보기</button>
              ${e.status === 'draft' ? `<button class="btn btn-sm btn-primary" onclick="updateEstimateStatus('${e.id}','sent')">발송</button>` : ''}
              ${e.status === 'sent' ? `<button class="btn btn-sm btn-success" onclick="updateEstimateStatus('${e.id}','accepted')">수락</button>` : ''}
              ${e.status === 'accepted' ? `<button class="btn btn-sm btn-primary" onclick="updateEstimateStatus('${e.id}','invoiced')">인보이스</button>` : ''}
            </td>
          </tr>
        `).join('')}</tbody>
      </table>
    </div>
  `;
}

function updateEstimateStatus(id, status) {
  const e = estimates.find(e => e.id === id);
  if (e) {
    e.status = status;
    saveData('estimates', estimates);
    renderEstimates();
  }
}

function previewEstimate(id) {
  const e = estimates.find(e => e.id === id);
  if (!e) return;

  const section = document.getElementById('estimatePreviewSection');
  section.classList.remove('hidden');

  const isInvoice = e.status === 'invoiced';
  const docTitle = isInvoice ? '인보이스' : '견적서';
  const docId = isInvoice ? e.id.replace('EST', 'INV') : e.id;

  section.innerHTML = `
    <div class="estimate-preview" id="printableEstimate">
      <div class="estimate-header">
        <div>
          <div class="estimate-title">${docTitle}</div>
          <div class="estimate-number">${docId}</div>
          <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.5rem;">발행일: ${formatDate(e.createdAt)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;font-size:1.1rem;">DevFlow</div>
          <div style="font-size:0.8rem;color:var(--gray-500);">프리랜서 개발자</div>
          <div style="font-size:0.8rem;color:var(--gray-500);">사업자등록번호: 123-45-67890</div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:0.25rem;">수신</div>
        <div style="font-size:0.9rem;">${getClientName(e.clientId)} · ${getClientCompany(e.clientId)}</div>
        <div style="font-size:0.85rem;color:var(--gray-500);">프로젝트: ${e.projectTitle}</div>
      </div>

      <table class="estimate-table">
        <thead><tr><th>항목</th><th class="text-right">수량</th><th class="text-right">단가</th><th class="text-right">금액</th></tr></thead>
        <tbody>
          ${e.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="text-right">${item.qty}</td>
              <td class="text-right">${formatKRW(item.price)}</td>
              <td class="text-right">${formatKRW(item.qty * item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="estimate-totals">
        <div class="total-row"><span>소계</span><span>${formatKRW(e.subtotal)}</span></div>
        <div class="total-row"><span>부가세 (10%)</span><span>${formatKRW(e.tax)}</span></div>
        <div class="total-row grand-total"><span>합계</span><span>${formatKRW(e.total)}</span></div>
      </div>

      <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--gray-200);font-size:0.8rem;color:var(--gray-400);text-align:center;">
        본 ${docTitle}는 발행일로부터 30일간 유효합니다.
      </div>
    </div>
    <div style="text-align:center;margin-top:1rem;">
      <button class="btn btn-primary" onclick="window.print()">🖨️ 인쇄하기</button>
      <button class="btn btn-secondary" onclick="document.getElementById('estimatePreviewSection').classList.add('hidden')">닫기</button>
    </div>
  `;

  section.scrollIntoView({ behavior: 'smooth' });
}

function addEstimateItemRow() {
  const container = document.getElementById('estimateItems');
  const row = document.createElement('div');
  row.className = 'estimate-item-row';
  row.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:end;';
  row.innerHTML = `
    <div style="flex:2"><input type="text" class="form-input" placeholder="항목명" data-field="name"></div>
    <div style="flex:0.5"><input type="number" class="form-input" placeholder="수량" data-field="qty" value="1"></div>
    <div style="flex:1"><input type="number" class="form-input" placeholder="금액" data-field="price"></div>
    <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="flex-shrink:0;">✕</button>
  `;
  container.appendChild(row);
}

function saveEstimate() {
  const clientId = document.getElementById('est-client').value;
  const projectTitle = document.getElementById('est-project').value.trim();
  if (!projectTitle) { alert('프로젝트명을 입력하세요.'); return; }

  const rows = document.querySelectorAll('#estimateItems .estimate-item-row');
  const items = [];
  rows.forEach(row => {
    const name = row.querySelector('[data-field="name"]').value.trim();
    const qty = parseInt(row.querySelector('[data-field="qty"]').value) || 1;
    const price = parseInt(row.querySelector('[data-field="price"]').value) || 0;
    if (name && price) items.push({ name, qty, price });
  });

  if (!items.length) { alert('최소 1개의 항목을 입력하세요.'); return; }

  const subtotal = items.reduce((s, it) => s + (it.qty * it.price), 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const count = estimates.filter(e => e.id.includes(dateStr)).length + 1;
  const id = `EST-${dateStr}-${String(count).padStart(3,'0')}`;

  estimates.push({ id, clientId, projectTitle, items, subtotal, tax, total, status: 'draft', createdAt: today() });
  saveData('estimates', estimates);
  closeModal('estimateModal');
  // Reset
  document.getElementById('est-project').value = '';
  document.getElementById('estimateItems').innerHTML = `
    <div class="estimate-item-row" style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:end;">
      <div style="flex:2"><input type="text" class="form-input" placeholder="항목명" data-field="name"></div>
      <div style="flex:0.5"><input type="number" class="form-input" placeholder="수량" data-field="qty" value="1"></div>
      <div style="flex:1"><input type="number" class="form-input" placeholder="금액" data-field="price"></div>
    </div>
  `;
  renderEstimates();
}

// ============================================================
// CLIENTS
// ============================================================
function renderClients() {
  const totalClients = clients.length;
  const vipCount = clients.filter(c => c.grade === 'vip').length;
  const newCount = clients.filter(c => c.grade === 'new').length;

  document.getElementById('clientStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(99,102,241,0.1);color:var(--primary);">👥</div>
      <div class="stat-value">${totalClients}명</div>
      <div class="stat-label">전체 고객</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(245,158,11,0.1);color:var(--accent);">⭐</div>
      <div class="stat-value">${vipCount}명</div>
      <div class="stat-label">VIP 고객</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(59,130,246,0.1);color:#3b82f6;">🆕</div>
      <div class="stat-value">${newCount}명</div>
      <div class="stat-label">신규 고객</div>
    </div>
  `;

  const list = document.getElementById('clientList');
  if (!clients.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p class="empty-state-text">등록된 고객이 없습니다.</p></div>';
    return;
  }

  list.innerHTML = clients.map(c => {
    const projCount = projects.filter(p => p.clientId === c.id).length;
    const totalSpent = projects.filter(p => p.clientId === c.id && p.status === 'done').reduce((s, p) => s + (p.budget || 0), 0);
    const initials = c.name.slice(0, 1);

    return `
      <div class="client-row">
        <div class="client-avatar">${initials}</div>
        <div class="client-info">
          <div class="client-name">${c.name}</div>
          <div class="client-company">${c.company} · ${c.email || '-'} · ${c.phone || '-'}</div>
        </div>
        <div style="text-align:right;min-width:100px;">
          <div style="font-size:0.8rem;font-weight:600;">${projCount}건</div>
          <div style="font-size:0.7rem;color:var(--gray-400);">${formatKRW(totalSpent)}</div>
        </div>
        <span class="client-grade grade-${c.grade}">${GRADE_LABELS[c.grade]}</span>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${c.id}')">삭제</button>
      </div>
    `;
  }).join('');
}

function saveClient() {
  const name = document.getElementById('cl-name').value.trim();
  if (!name) { alert('이름을 입력하세요.'); return; }

  clients.push({
    id: uuid(),
    name,
    company: document.getElementById('cl-company').value.trim(),
    email: document.getElementById('cl-email').value.trim(),
    phone: document.getElementById('cl-phone').value.trim(),
    grade: document.getElementById('cl-grade').value,
    notes: document.getElementById('cl-notes').value.trim(),
    createdAt: today(),
  });

  saveData('clients', clients);
  closeModal('clientModal');
  ['cl-name', 'cl-company', 'cl-email', 'cl-phone', 'cl-notes'].forEach(id => document.getElementById(id).value = '');
  renderClients();
}

function deleteClient(id) {
  if (!confirm('이 고객을 삭제하시겠습니까?')) return;
  clients = clients.filter(c => c.id !== id);
  saveData('clients', clients);
  renderClients();
}

// ============================================================
// TRACKING
// ============================================================
function renderTracking() {
  const totalRevenue = projects.filter(p => p.status === 'done').reduce((s, p) => s + (p.budget || 0), 0);
  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
  const avgHourly = totalHours > 0 ? Math.round(totalRevenue / totalHours) : 0;
  const completedCount = projects.filter(p => p.status === 'done').length;

  document.getElementById('trackingStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(99,102,241,0.1);color:var(--primary);">💰</div>
      <div class="stat-value">${formatKRW(totalRevenue)}</div>
      <div class="stat-label">총 수익</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(6,182,212,0.1);color:var(--secondary);">⏱️</div>
      <div class="stat-value">${totalHours}시간</div>
      <div class="stat-label">총 작업 시간</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(16,185,129,0.1);color:var(--success);">📈</div>
      <div class="stat-value">${formatKRW(avgHourly)}/h</div>
      <div class="stat-label">평균 시급</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(245,158,11,0.1);color:var(--accent);">✅</div>
      <div class="stat-value">${completedCount}건</div>
      <div class="stat-label">완료 프로젝트</div>
    </div>
  `;

  // Time entries list
  const sorted = [...timeEntries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  const teList = document.getElementById('timeEntryList');
  teList.innerHTML = sorted.length ? `
    <table class="data-table">
      <thead><tr><th>날짜</th><th>프로젝트</th><th>시간</th><th>내용</th></tr></thead>
      <tbody>${sorted.map(e => {
        const proj = projects.find(p => p.id === e.projectId);
        return `<tr>
          <td>${formatDate(e.date)}</td>
          <td>${proj ? proj.title : '-'}</td>
          <td style="font-weight:600;">${e.hours}h</td>
          <td>${e.description}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  ` : '<div class="empty-state"><div class="empty-state-icon">⏱️</div><p>시간 기록이 없습니다.</p></div>';

  // Project revenue chart
  drawProjectRevenueChart();
}

function drawProjectRevenueChart() {
  const canvas = document.getElementById('projectRevenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const doneProjects = projects.filter(p => p.status === 'done' && p.budget > 0);
  if (!doneProjects.length) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('완료된 프로젝트가 없습니다.', canvas.width / 2, canvas.height / 2);
    return;
  }

  const total = doneProjects.reduce((s, p) => s + p.budget, 0);
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const cx = canvas.width * 0.35;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 20;

  let startAngle = -Math.PI / 2;
  doneProjects.forEach((p, i) => {
    const sliceAngle = (p.budget / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += sliceAngle;
  });

  // Inner circle (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('총 수익', cx, cy - 8);
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#6366f1';
  ctx.fillText(formatKRW(total), cx, cy + 12);

  // Legend
  const legendX = canvas.width * 0.65;
  let legendY = 20;
  ctx.textAlign = 'left';
  doneProjects.forEach((p, i) => {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.font = '11px sans-serif';
    const label = p.title.length > 12 ? p.title.slice(0, 12) + '…' : p.title;
    ctx.fillText(`${label} (${(p.budget / total * 100).toFixed(0)}%)`, legendX + 18, legendY + 10);
    legendY += 22;
  });
}

function saveTimeEntry() {
  const projectId = document.getElementById('te-project').value;
  const date = document.getElementById('te-date').value;
  const hours = parseFloat(document.getElementById('te-hours').value) || 0;
  const desc = document.getElementById('te-desc').value.trim();

  if (!projectId) { alert('프로젝트를 선택하세요.'); return; }
  if (!hours) { alert('작업 시간을 입력하세요.'); return; }

  timeEntries.push({ id: uuid(), projectId, date: date || today(), hours, description: desc });
  
  // Update project hours
  const proj = projects.find(p => p.id === projectId);
  if (proj) proj.hours = (proj.hours || 0) + hours;

  saveData('timeEntries', timeEntries);
  saveData('projects', projects);
  closeModal('timeEntryModal');
  ['te-hours', 'te-desc'].forEach(id => document.getElementById(id).value = '');
  renderTracking();
}

// ============================================================
// PRICING
// ============================================================
function renderPricing() {
  const categories = [
    { key: 'website', label: '🌐 웹사이트 개발', color: 'linear-gradient(135deg, #6366f1, #818cf8)' },
    { key: 'app', label: '📱 앱 개발', color: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
    { key: 'nocode', label: '⚡ 노코드 · 로코드', color: 'linear-gradient(135deg, #10b981, #34d399)' },
  ];

  const grid = document.getElementById('pricingGrid');
  grid.innerHTML = categories.map(cat => {
    const plans = servicePlans.filter(p => p.category === cat.key);
    return `
      <div class="pricing-category">
        <div class="pricing-category-header" style="background:${cat.color};">${cat.label}</div>
        <div class="pricing-tiers">
          ${plans.map(plan => `
            <div class="pricing-tier ${plan.tier === 'standard' ? 'recommended' : ''}">
              ${plan.tier === 'standard' ? '<span class="pricing-tier-badge">추천</span>' : ''}
              <div class="pricing-tier-name">${plan.name}</div>
              <div class="pricing-tier-price">${formatKRW(plan.price)}~</div>
              <ul class="pricing-features">
                ${plan.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// INIT
// ============================================================
function init() {
  seedDemoData();
  renderDashboard();

  // Set today's date as default for time entry
  const teDate = document.getElementById('te-date');
  if (teDate) teDate.value = today();

  // Handle window resize for charts
  window.addEventListener('resize', () => {
    const activePage = document.querySelector('.page-section.active');
    if (activePage) {
      const pageId = activePage.id.replace('page-', '');
      if (pageId === 'dashboard') drawRevenueChart();
      if (pageId === 'tracking') drawProjectRevenueChart();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
