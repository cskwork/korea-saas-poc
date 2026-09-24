// ============================================================
// 07-newsletter-community: 유료 뉴스레터 & 커뮤니티 POC
// Vanilla JS + localStorage
// ============================================================

// ---- Data Store ----
const STORAGE_KEY = 'newsletter-community-poc';

const defaultData = {
  newsletters: [
    {
      id: 'nl-1',
      title: '2024년 AI 트렌드 총정리: GPT-5부터 로컬 LLM까지',
      content: '<h2>AI 시대의 변곡점</h2><p>2024년은 AI 기술이 본격적으로 실생활에 스며든 해입니다. OpenAI의 GPT-5 발표를 필두로, 구글의 Gemini Ultra, 메타의 Llama 3 등 대형 언어 모델의 경쟁이 치열합니다.</p><p>특히 주목할 점은 <strong>로컬 LLM</strong>의 부상입니다. 개인 PC에서도 고성능 AI를 돌릴 수 있는 시대가 열리면서, 데이터 프라이버시와 비용 효율성 측면에서 큰 변화가 예상됩니다.</p><h3>핵심 트렌드 5가지</h3><ul><li>멀티모달 AI의 대중화</li><li>AI 에이전트의 실용화</li><li>로컬 LLM과 온디바이스 AI</li><li>AI 규제와 윤리 프레임워크</li><li>AI 기반 코딩 도구의 진화</li></ul>',
      category: 'tech',
      targetTier: 'all',
      status: 'sent',
      sentAt: '2024-03-15T09:00:00',
      openRate: 45.2,
      clickRate: 12.8
    },
    {
      id: 'nl-2',
      title: '스타트업 투자 시장 분석: 2024 1분기 리포트',
      content: '<h2>투자 시장 현황</h2><p>2024년 1분기 국내 스타트업 투자 시장은 전년 대비 23% 반등했습니다. 특히 AI/딥테크 분야에 투자가 집중되고 있으며, 시리즈 A 단계의 투자가 가장 활발합니다.</p><p>주요 투자 유치 기업들의 공통점은 명확한 <strong>PMF(Product-Market Fit)</strong>를 증명한 팀이라는 점입니다.</p>',
      category: 'business',
      targetTier: 'paid',
      status: 'sent',
      sentAt: '2024-03-08T09:00:00',
      openRate: 52.1,
      clickRate: 18.3
    },
    {
      id: 'nl-3',
      title: 'SEO 마스터 가이드: 2024년 구글 알고리즘 변화 대응',
      content: '<h2>구글 알고리즘 업데이트</h2><p>2024년 구글의 핵심 알고리즘 업데이트는 E-E-A-T(경험, 전문성, 권위성, 신뢰성)를 더욱 강화하는 방향입니다.</p><p>콘텐츠의 품질과 사용자 경험이 그 어느 때보다 중요해졌습니다.</p>',
      category: 'marketing',
      targetTier: 'all',
      status: 'sent',
      sentAt: '2024-03-01T09:00:00',
      openRate: 38.7,
      clickRate: 15.4
    },
    {
      id: 'nl-4',
      title: '[프리미엄] SaaS 성장 전략: ARR 10억 달성 로드맵',
      content: '<h2>ARR 10억의 여정</h2><p>한국 SaaS 시장에서 ARR 10억을 달성하기 위한 단계별 전략을 공유합니다. 초기 PMF 검증부터 스케일업까지의 실전 경험을 담았습니다.</p>',
      category: 'business',
      targetTier: 'pro',
      status: 'sent',
      sentAt: '2024-02-22T09:00:00',
      openRate: 61.5,
      clickRate: 24.1
    },
    {
      id: 'nl-5',
      title: '디자인 시스템 구축 완벽 가이드',
      content: '<h2>디자인 시스템이란?</h2><p>확장 가능한 디자인 시스템을 구축하는 방법을 A to Z로 알려드립니다.</p>',
      category: 'design',
      targetTier: 'all',
      status: 'draft',
      sentAt: null,
      openRate: 0,
      clickRate: 0
    },
    {
      id: 'nl-6',
      title: '마케팅 자동화 툴 비교: 2024년 최신판',
      content: '<h2>마케팅 자동화 시대</h2><p>HubSpot, Mailchimp, Brevo 등 주요 마케팅 자동화 도구를 비교 분석합니다.</p>',
      category: 'marketing',
      targetTier: 'paid',
      status: 'scheduled',
      sentAt: '2024-03-22T09:00:00',
      openRate: 0,
      clickRate: 0
    }
  ],

  subscribers: [
    { id: 's-1', name: '김민수', email: 'minsu@example.com', tier: 'pro', status: 'active', joinedAt: '2023-08-15', lastOpenAt: '2024-03-15' },
    { id: 's-2', name: '이지영', email: 'jiyoung@example.com', tier: 'basic', status: 'active', joinedAt: '2023-09-01', lastOpenAt: '2024-03-14' },
    { id: 's-3', name: '박서준', email: 'seojun@example.com', tier: 'pro', status: 'active', joinedAt: '2023-07-20', lastOpenAt: '2024-03-15' },
    { id: 's-4', name: '최유나', email: 'yuna@example.com', tier: 'free', status: 'active', joinedAt: '2023-10-05', lastOpenAt: '2024-03-10' },
    { id: 's-5', name: '정도현', email: 'dohyun@example.com', tier: 'basic', status: 'active', joinedAt: '2023-11-12', lastOpenAt: '2024-03-13' },
    { id: 's-6', name: '한소희', email: 'sohee@example.com', tier: 'free', status: 'active', joinedAt: '2023-12-01', lastOpenAt: '2024-03-08' },
    { id: 's-7', name: '윤재호', email: 'jaeho@example.com', tier: 'pro', status: 'active', joinedAt: '2023-06-15', lastOpenAt: '2024-03-15' },
    { id: 's-8', name: '송하영', email: 'hayoung@example.com', tier: 'basic', status: 'churned', joinedAt: '2023-09-20', lastOpenAt: '2024-01-15' },
    { id: 's-9', name: '임현우', email: 'hyunwoo@example.com', tier: 'free', status: 'active', joinedAt: '2024-01-10', lastOpenAt: '2024-03-12' },
    { id: 's-10', name: '오민정', email: 'minjeong@example.com', tier: 'basic', status: 'active', joinedAt: '2024-02-05', lastOpenAt: '2024-03-14' },
    { id: 's-11', name: '강태훈', email: 'taehun@example.com', tier: 'free', status: 'active', joinedAt: '2024-01-22', lastOpenAt: '2024-03-09' },
    { id: 's-12', name: '배수지', email: 'suji@example.com', tier: 'pro', status: 'active', joinedAt: '2023-08-01', lastOpenAt: '2024-03-15' },
    { id: 's-13', name: '조영민', email: 'youngmin@example.com', tier: 'free', status: 'churned', joinedAt: '2023-11-05', lastOpenAt: '2024-02-01' },
    { id: 's-14', name: '남지원', email: 'jiwon@example.com', tier: 'basic', status: 'active', joinedAt: '2024-02-15', lastOpenAt: '2024-03-13' },
    { id: 's-15', name: '유승호', email: 'seungho@example.com', tier: 'free', status: 'active', joinedAt: '2024-03-01', lastOpenAt: '2024-03-11' }
  ],

  communityPosts: [
    {
      id: 'cp-1',
      author: '김민수',
      title: 'AI 도입 후 업무 생산성이 확 올랐습니다',
      content: '저희 팀에서 ChatGPT와 Copilot을 도입한 지 3개월째인데, 코드 리뷰 시간이 40% 정도 줄었습니다. 다른 분들은 어떠신가요?',
      category: 'discussion',
      comments: [
        { author: '이지영', content: '저희도 비슷한 경험입니다. 특히 반복적인 코드 작성에서 효과가 크더라고요.', createdAt: '2024-03-15T10:30:00' },
        { author: '박서준', content: '보안 측면은 어떻게 관리하시나요? 저희는 사내 보안 정책 때문에 고민 중입니다.', createdAt: '2024-03-15T11:15:00' }
      ],
      createdAt: '2024-03-15T09:00:00'
    },
    {
      id: 'cp-2',
      author: '관리자',
      title: '[공지] 3월 오프라인 네트워킹 일정 안내',
      content: '3월 28일(목) 저녁 7시, 강남 코워킹스페이스에서 프로 구독자 대상 네트워킹 이벤트를 개최합니다. 이번 주제는 "AI 시대의 커리어 전략"입니다.',
      category: 'notice',
      comments: [
        { author: '윤재호', content: '꼭 참석하겠습니다! 지난번도 정말 유익했어요.', createdAt: '2024-03-13T14:00:00' }
      ],
      createdAt: '2024-03-13T10:00:00'
    },
    {
      id: 'cp-3',
      author: '최유나',
      title: 'SaaS 가격 정책 설정에 대해 조언 부탁드립니다',
      content: '현재 B2B SaaS를 준비 중인데, 초기 가격 정책을 어떻게 설정해야 할지 고민입니다. 프리미엄 모델 vs 무료 체험 중 어떤 것이 더 효과적일까요?',
      category: 'qna',
      comments: [
        { author: '김민수', content: '타겟 고객의 규모에 따라 다르지만, SMB 대상이라면 프리미엄이 유리합니다.', createdAt: '2024-03-12T15:30:00' },
        { author: '정도현', content: 'Jason Lemkin의 SaaStr 아티클 추천드립니다. 가격 정책에 대한 좋은 프레임워크가 있어요.', createdAt: '2024-03-12T16:45:00' },
        { author: '관리자', content: '다음 주 뉴스레터에서 SaaS 가격 전략 심층 분석을 다룰 예정입니다!', createdAt: '2024-03-12T17:00:00' }
      ],
      createdAt: '2024-03-12T14:00:00'
    },
    {
      id: 'cp-4',
      author: '박서준',
      title: '마케팅 자동화 도구 추천해주세요',
      content: '스타트업에서 사용하기 좋은 마케팅 자동화 도구를 찾고 있습니다. 예산이 제한적이라 가성비 좋은 도구가 있으면 추천 부탁드립니다.',
      category: 'discussion',
      comments: [],
      createdAt: '2024-03-11T16:00:00'
    }
  ],

  revenue: [
    { month: '2023-10', subscription: 1200000, sponsorship: 500000, membership: 300000 },
    { month: '2023-11', subscription: 1500000, sponsorship: 700000, membership: 400000 },
    { month: '2023-12', subscription: 1800000, sponsorship: 900000, membership: 500000 },
    { month: '2024-01', subscription: 2200000, sponsorship: 1200000, membership: 600000 },
    { month: '2024-02', subscription: 2800000, sponsorship: 1500000, membership: 800000 },
    { month: '2024-03', subscription: 3500000, sponsorship: 2000000, membership: 1000000 }
  ]
};

// ---- State Management ----
let appData;

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      appData = JSON.parse(stored);
      // Ensure all keys exist
      if (!appData.newsletters) appData.newsletters = defaultData.newsletters;
      if (!appData.subscribers) appData.subscribers = defaultData.subscribers;
      if (!appData.communityPosts) appData.communityPosts = defaultData.communityPosts;
      if (!appData.revenue) appData.revenue = defaultData.revenue;
    } else {
      appData = JSON.parse(JSON.stringify(defaultData));
    }
  } catch (e) {
    appData = JSON.parse(JSON.stringify(defaultData));
  }
  saveData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function resetData() {
  appData = JSON.parse(JSON.stringify(defaultData));
  saveData();
  renderCurrentPage();
  showToast('데이터가 초기화되었습니다.');
}

// ---- Navigation ----
let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.style.display = 'block';
    target.classList.remove('fade-in');
    void target.offsetWidth; // trigger reflow
    target.classList.add('fade-in');
  }
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  // Close mobile sidebar
  closeSidebar();
  // Render
  renderCurrentPage();
}

function renderCurrentPage() {
  switch (currentPage) {
    case 'dashboard': renderDashboard(); break;
    case 'compose': renderCompose(); break;
    case 'subscribers': renderSubscribers(); break;
    case 'community': renderCommunity(); break;
    case 'revenue': renderRevenue(); break;
    case 'archive': renderArchive(); break;
    case 'pricing': break; // static
  }
}

// ---- Mobile Sidebar ----
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  sidebar.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
}

// ---- Helpers ----
function generateId(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

function formatNumber(n) {
  return n.toLocaleString('ko-KR');
}

function formatCurrency(n) {
  return '₩' + formatNumber(n);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function tierLabel(tier) {
  const labels = { free: '무료', basic: '베이직', pro: '프로' };
  return labels[tier] || tier;
}

function tierBadge(tier) {
  return `<span class="badge badge-${tier}">${tierLabel(tier)}</span>`;
}

function statusBadge(status) {
  const labels = { active: '활성', churned: '이탈', draft: '임시저장', sent: '발송완료', scheduled: '예약' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

function categoryLabel(cat) {
  const labels = {
    tech: '테크/IT', business: '비즈니스', marketing: '마케팅',
    design: '디자인', lifestyle: '라이프스타일',
    discussion: '💬 토론', qna: '❓ Q&A', notice: '📢 공지'
  };
  return labels[cat] || cat;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const borderColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)';
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeftColor = borderColor;
  toast.innerHTML = `<span class="text-sm">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Dashboard ----
function renderDashboard() {
  const subs = appData.subscribers;
  const total = subs.length;
  const paid = subs.filter(s => s.tier !== 'free' && s.status === 'active').length;
  const latestRevenue = appData.revenue[appData.revenue.length - 1];
  const totalRevenue = latestRevenue.subscription + latestRevenue.sponsorship + latestRevenue.membership;
  const sentNewsletters = appData.newsletters.filter(n => n.status === 'sent');
  const avgOpen = sentNewsletters.length > 0
    ? (sentNewsletters.reduce((sum, n) => sum + n.openRate, 0) / sentNewsletters.length).toFixed(1)
    : 0;

  document.getElementById('kpi-totalSubs').textContent = formatNumber(total);
  document.getElementById('kpi-paidSubs').textContent = formatNumber(paid);
  document.getElementById('kpi-monthRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('kpi-openRate').textContent = avgOpen + '%';

  // Recent newsletters
  const tbody = document.getElementById('dashboard-newsletters');
  tbody.innerHTML = appData.newsletters
    .filter(n => n.status === 'sent')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, 5)
    .map(n => `
      <tr>
        <td class="font-medium">${n.title.length > 30 ? n.title.slice(0, 30) + '...' : n.title}</td>
        <td class="text-slate-400">${formatDate(n.sentAt)}</td>
        <td>${statusBadge(n.status)}</td>
        <td class="text-indigo-400">${n.openRate}%</td>
      </tr>
    `).join('');

  // Subscriber composition
  const free = subs.filter(s => s.tier === 'free').length;
  const basic = subs.filter(s => s.tier === 'basic').length;
  const pro = subs.filter(s => s.tier === 'pro').length;
  const compDiv = document.getElementById('subscriber-composition');
  compDiv.innerHTML = [
    { label: '무료', count: free, color: 'bg-slate-500', pct: ((free / total) * 100).toFixed(0) },
    { label: '베이직', count: basic, color: 'bg-indigo-500', pct: ((basic / total) * 100).toFixed(0) },
    { label: '프로', count: pro, color: 'bg-amber-500', pct: ((pro / total) * 100).toFixed(0) }
  ].map(item => `
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span class="text-slate-400">${item.label}</span>
        <span>${item.count}명 (${item.pct}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${item.color}" style="width:${item.pct}%"></div>
      </div>
    </div>
  `).join('');

  // Conversion rate
  const conversionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : 0;
  document.getElementById('conversion-bar').style.width = conversionRate + '%';
  document.getElementById('conversion-rate').textContent = conversionRate + '%';
}

// ---- Compose ----
function renderCompose() {
  updateTargetCount();
  renderDraftList();
}

function updateTargetCount() {
  const target = document.getElementById('nl-target')?.value || 'all';
  let count;
  const activeSubs = appData.subscribers.filter(s => s.status === 'active');
  switch (target) {
    case 'all': count = activeSubs.length; break;
    case 'free': count = activeSubs.filter(s => s.tier === 'free').length; break;
    case 'paid': count = activeSubs.filter(s => s.tier !== 'free').length; break;
    case 'basic': count = activeSubs.filter(s => s.tier === 'basic').length; break;
    case 'pro': count = activeSubs.filter(s => s.tier === 'pro').length; break;
    default: count = activeSubs.length;
  }
  const el = document.getElementById('target-count');
  if (el) el.textContent = count + '명';
}

function renderDraftList() {
  const drafts = appData.newsletters.filter(n => n.status === 'draft');
  const el = document.getElementById('draft-list');
  if (!el) return;
  if (drafts.length === 0) {
    el.innerHTML = '<p class="text-slate-500 text-xs">임시저장된 글이 없습니다.</p>';
    return;
  }
  el.innerHTML = drafts.map(d => `
    <div class="flex justify-between items-center p-2 rounded bg-slate-800/50 hover:bg-slate-800 cursor-pointer" onclick="loadDraft('${d.id}')">
      <span class="text-xs truncate" style="max-width:140px">${d.title || '제목 없음'}</span>
      <button class="text-xs text-red-400 hover:text-red-300" onclick="event.stopPropagation();deleteDraft('${d.id}')">삭제</button>
    </div>
  `).join('');
}

function loadDraft(id) {
  const draft = appData.newsletters.find(n => n.id === id);
  if (!draft) return;
  document.getElementById('nl-title').value = draft.title;
  document.getElementById('nl-content').value = draft.content.replace(/<[^>]+>/g, '');
  document.getElementById('nl-category').value = draft.category || 'tech';
  document.getElementById('nl-target').value = draft.targetTier || 'all';
  showToast('임시저장 글을 불러왔습니다.', 'info');
}

function deleteDraft(id) {
  appData.newsletters = appData.newsletters.filter(n => n.id !== id);
  saveData();
  renderDraftList();
  showToast('삭제되었습니다.');
}

function saveNewsletter(status) {
  const title = document.getElementById('nl-title').value.trim();
  const content = document.getElementById('nl-content').value.trim();
  const category = document.getElementById('nl-category').value;
  const targetTier = document.getElementById('nl-target').value;

  if (!title) { showToast('제목을 입력해주세요.', 'error'); return; }
  if (!content) { showToast('본문을 입력해주세요.', 'error'); return; }

  const newsletter = {
    id: generateId('nl'),
    title,
    content: '<p>' + content.replace(/\n/g, '</p><p>') + '</p>',
    category,
    targetTier,
    status,
    sentAt: status === 'scheduled' ? new Date(Date.now() + 86400000).toISOString() : null,
    openRate: 0,
    clickRate: 0
  };

  appData.newsletters.push(newsletter);
  saveData();
  document.getElementById('nl-title').value = '';
  document.getElementById('nl-content').value = '';
  const msgs = { draft: '임시 저장되었습니다.', scheduled: '예약 발송이 설정되었습니다.' };
  showToast(msgs[status] || '저장되었습니다.');
  renderDraftList();
}

function sendNewsletter() {
  const title = document.getElementById('nl-title').value.trim();
  const content = document.getElementById('nl-content').value.trim();
  const category = document.getElementById('nl-category').value;
  const targetTier = document.getElementById('nl-target').value;
  const sponsor = document.getElementById('nl-sponsor').value;

  if (!title) { showToast('제목을 입력해주세요.', 'error'); return; }
  if (!content) { showToast('본문을 입력해주세요.', 'error'); return; }

  const newsletter = {
    id: generateId('nl'),
    title,
    content: '<p>' + content.replace(/\n/g, '</p><p>') + '</p>' +
      (sponsor ? '<hr><p style="color:#888;font-size:0.85em">📢 스폰서: ' + getSponsorName(sponsor) + '</p>' : ''),
    category,
    targetTier,
    status: 'sent',
    sentAt: new Date().toISOString(),
    openRate: Math.round(35 + Math.random() * 25),
    clickRate: Math.round(8 + Math.random() * 15)
  };

  appData.newsletters.push(newsletter);
  saveData();
  document.getElementById('nl-title').value = '';
  document.getElementById('nl-content').value = '';
  showToast('🚀 뉴스레터가 발송되었습니다!');
  renderDraftList();
}

function getSponsorName(id) {
  const sponsors = { sponsor1: '토스 - 금융 혁신', sponsor2: '당근마켓 - 채용', sponsor3: '클래스101 - 교육' };
  return sponsors[id] || '';
}

// ---- Subscribers ----
function renderSubscribers() {
  const subs = getFilteredSubscribers();
  const allSubs = appData.subscribers;

  // Stats
  document.getElementById('sub-total').textContent = allSubs.length;
  document.getElementById('sub-free').textContent = allSubs.filter(s => s.tier === 'free').length;
  document.getElementById('sub-basic').textContent = allSubs.filter(s => s.tier === 'basic').length;
  document.getElementById('sub-pro').textContent = allSubs.filter(s => s.tier === 'pro').length;

  // Table
  const tbody = document.getElementById('subscribers-table');
  if (subs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-slate-500 py-8">조건에 맞는 구독자가 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = subs.map(s => `
    <tr>
      <td class="font-medium">${s.name}</td>
      <td class="text-slate-400">${s.email}</td>
      <td>${tierBadge(s.tier)}</td>
      <td>${statusBadge(s.status)}</td>
      <td class="text-slate-400 text-xs">${formatDate(s.joinedAt)}</td>
      <td class="text-slate-400 text-xs">${formatDate(s.lastOpenAt)}</td>
      <td>
        <div class="flex gap-1">
          ${s.tier === 'free' ? `<button class="btn-sm btn-primary" onclick="upgradeSub('${s.id}','basic')">업그레이드</button>` : ''}
          ${s.tier === 'basic' ? `<button class="btn-sm btn-primary" style="background:linear-gradient(135deg,#f59e0b,#d97706)" onclick="upgradeSub('${s.id}','pro')">프로 전환</button>` : ''}
          <button class="btn-sm btn-secondary" onclick="deleteSub('${s.id}')">삭제</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getFilteredSubscribers() {
  let subs = [...appData.subscribers];
  const tierFilter = document.getElementById('filter-tier')?.value || 'all';
  const statusFilter = document.getElementById('filter-status')?.value || 'all';
  const search = (document.getElementById('filter-search')?.value || '').toLowerCase();

  if (tierFilter !== 'all') subs = subs.filter(s => s.tier === tierFilter);
  if (statusFilter !== 'all') subs = subs.filter(s => s.status === statusFilter);
  if (search) subs = subs.filter(s => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search));

  return subs;
}

function showAddSubscriberModal() {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">구독자 추가</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="form-label">이름</label>
            <input type="text" class="form-input" id="modal-sub-name" placeholder="홍길동">
          </div>
          <div>
            <label class="form-label">이메일</label>
            <input type="email" class="form-input" id="modal-sub-email" placeholder="example@email.com">
          </div>
          <div>
            <label class="form-label">구독 티어</label>
            <select class="form-input" id="modal-sub-tier">
              <option value="free">무료</option>
              <option value="basic">베이직</option>
              <option value="pro">프로</option>
            </select>
          </div>
          <div class="pt-3 flex gap-2">
            <button class="btn-primary flex-1" onclick="addSubscriber()">추가</button>
            <button class="btn-secondary flex-1" onclick="closeModal()">취소</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function addSubscriber() {
  const name = document.getElementById('modal-sub-name').value.trim();
  const email = document.getElementById('modal-sub-email').value.trim();
  const tier = document.getElementById('modal-sub-tier').value;

  if (!name || !email) { showToast('이름과 이메일을 입력해주세요.', 'error'); return; }

  appData.subscribers.push({
    id: generateId('s'),
    name,
    email,
    tier,
    status: 'active',
    joinedAt: new Date().toISOString().split('T')[0],
    lastOpenAt: new Date().toISOString().split('T')[0]
  });
  saveData();
  closeModal();
  renderSubscribers();
  showToast(`${name}님이 구독자로 추가되었습니다.`);
}

function upgradeSub(id, newTier) {
  const sub = appData.subscribers.find(s => s.id === id);
  if (sub) {
    sub.tier = newTier;
    saveData();
    renderSubscribers();
    showToast(`${sub.name}님이 ${tierLabel(newTier)} 플랜으로 업그레이드되었습니다.`);
  }
}

function deleteSub(id) {
  const sub = appData.subscribers.find(s => s.id === id);
  if (!sub) return;
  if (confirm(`${sub.name}님을 구독자 목록에서 삭제하시겠습니까?`)) {
    appData.subscribers = appData.subscribers.filter(s => s.id !== id);
    saveData();
    renderSubscribers();
    showToast('구독자가 삭제되었습니다.');
  }
}

// ---- Community ----
let communityFilter = 'all';

function renderCommunity() {
  const posts = communityFilter === 'all'
    ? appData.communityPosts
    : appData.communityPosts.filter(p => p.category === communityFilter);

  const container = document.getElementById('community-posts');
  if (posts.length === 0) {
    container.innerHTML = '<div class="text-center text-slate-500 py-12">게시글이 없습니다.</div>';
    return;
  }

  container.innerHTML = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(post => `
      <div class="community-post">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-xs text-slate-500 mr-2">${categoryLabel(post.category)}</span>
            <span class="text-xs text-slate-600">${formatDateTime(post.createdAt)}</span>
          </div>
          <span class="text-xs text-slate-500">${post.author}</span>
        </div>
        <h4 class="font-semibold mb-2">${post.title}</h4>
        <p class="text-sm text-slate-400 mb-3">${post.content}</p>
        
        ${post.comments.length > 0 ? `
          <div class="border-t border-slate-700 pt-3 mt-3">
            <div class="text-xs text-slate-500 mb-2">💬 댓글 ${post.comments.length}개</div>
            ${post.comments.map(c => `
              <div class="comment-item mb-2">
                <div class="flex justify-between">
                  <span class="text-xs font-semibold text-indigo-400">${c.author}</span>
                  <span class="text-xs text-slate-600">${formatDateTime(c.createdAt)}</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">${c.content}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="mt-3 flex gap-2">
          <input type="text" class="form-input text-xs" id="comment-${post.id}" placeholder="댓글을 입력하세요..." style="flex:1">
          <button class="btn-sm btn-primary" onclick="addComment('${post.id}')">등록</button>
        </div>
      </div>
    `).join('');
}

function filterCommunity(category, btn) {
  communityFilter = category;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCommunity();
}

function showNewPostModal() {
  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">새 글 작성</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="form-label">카테고리</label>
            <select class="form-input" id="modal-post-cat">
              <option value="discussion">💬 토론</option>
              <option value="qna">❓ Q&A</option>
              <option value="notice">📢 공지</option>
            </select>
          </div>
          <div>
            <label class="form-label">제목</label>
            <input type="text" class="form-input" id="modal-post-title" placeholder="제목을 입력하세요">
          </div>
          <div>
            <label class="form-label">내용</label>
            <textarea class="form-input" id="modal-post-content" rows="5" placeholder="내용을 입력하세요..."></textarea>
          </div>
          <div class="pt-3 flex gap-2">
            <button class="btn-primary flex-1" onclick="addPost()">등록</button>
            <button class="btn-secondary flex-1" onclick="closeModal()">취소</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function addPost() {
  const category = document.getElementById('modal-post-cat').value;
  const title = document.getElementById('modal-post-title').value.trim();
  const content = document.getElementById('modal-post-content').value.trim();

  if (!title || !content) { showToast('제목과 내용을 입력해주세요.', 'error'); return; }

  appData.communityPosts.push({
    id: generateId('cp'),
    author: '관리자',
    title,
    content,
    category,
    comments: [],
    createdAt: new Date().toISOString()
  });
  saveData();
  closeModal();
  renderCommunity();
  showToast('게시글이 등록되었습니다.');
}

function addComment(postId) {
  const input = document.getElementById('comment-' + postId);
  const text = input.value.trim();
  if (!text) return;

  const post = appData.communityPosts.find(p => p.id === postId);
  if (!post) return;

  post.comments.push({
    author: '관리자',
    content: text,
    createdAt: new Date().toISOString()
  });
  saveData();
  renderCommunity();
  showToast('댓글이 등록되었습니다.');
}

// ---- Revenue ----
function renderRevenue() {
  const revenue = appData.revenue;
  const latest = revenue[revenue.length - 1];
  const totalRev = latest.subscription + latest.sponsorship + latest.membership;
  const paidSubs = appData.subscribers.filter(s => s.tier !== 'free' && s.status === 'active');
  const arpu = paidSubs.length > 0 ? Math.round(totalRev / paidSubs.length) : 0;
  const goalPct = Math.min(100, ((totalRev / 20000000) * 100)).toFixed(1);
  const churnedCount = appData.subscribers.filter(s => s.status === 'churned').length;
  const churnRate = ((churnedCount / appData.subscribers.length) * 100).toFixed(1);

  document.getElementById('rev-mrr').textContent = formatCurrency(totalRev);
  document.getElementById('rev-arpu').textContent = formatCurrency(arpu);
  document.getElementById('rev-goal').textContent = goalPct + '%';
  document.getElementById('rev-churn').textContent = churnRate + '%';

  // Chart
  renderRevenueChart();

  // Breakdown
  renderRevenueBreakdown(latest);

  // Goals
  document.getElementById('goal-revenue-text').textContent = `${formatCurrency(totalRev)} / ₩20,000,000`;
  document.getElementById('goal-revenue-bar').style.width = goalPct + '%';

  const paidCount = paidSubs.length;
  const subsPct = Math.min(100, (paidCount / 1000) * 100).toFixed(1);
  document.getElementById('goal-subs-text').textContent = `${paidCount} / 1,000명`;
  document.getElementById('goal-subs-bar').style.width = subsPct + '%';

  const sentNl = appData.newsletters.filter(n => n.status === 'sent');
  const avgOpen = sentNl.length > 0 ? (sentNl.reduce((s, n) => s + n.openRate, 0) / sentNl.length) : 0;
  const openPct = Math.min(100, (avgOpen / 40) * 100).toFixed(1);
  document.getElementById('goal-open-text').textContent = `${avgOpen.toFixed(1)}% / 40%`;
  document.getElementById('goal-open-bar').style.width = openPct + '%';
}

function renderRevenueChart() {
  const container = document.getElementById('revenue-chart');
  const revenue = appData.revenue;
  const maxVal = Math.max(...revenue.map(r => r.subscription + r.sponsorship + r.membership));

  const chartHTML = `
    <div style="display:flex;align-items:flex-end;justify-content:space-around;height:240px;padding:0 10px;border-bottom:1px solid var(--border-color);">
      ${revenue.map(r => {
        const total = r.subscription + r.sponsorship + r.membership;
        const subH = (r.subscription / maxVal) * 200;
        const spoH = (r.sponsorship / maxVal) * 200;
        const memH = (r.membership / maxVal) * 200;
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex:1;max-width:80px;">
            <div class="text-xs text-slate-400 mb-1">${formatCurrency(total)}</div>
            <div style="display:flex;flex-direction:column;width:100%;max-width:48px;">
              <div class="chart-bar membership" style="height:${memH}px;border-radius:4px 4px 0 0;"></div>
              <div class="chart-bar sponsor" style="height:${spoH}px;border-radius:0;"></div>
              <div class="chart-bar" style="height:${subH}px;border-radius:0 0 0 0;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-around;padding:8px 10px;">
      ${revenue.map(r => `<div class="text-xs text-slate-500" style="flex:1;max-width:80px;text-align:center;">${r.month.slice(5)}월</div>`).join('')}
    </div>
  `;
  container.innerHTML = chartHTML;
}

function renderRevenueBreakdown(latest) {
  const total = latest.subscription + latest.sponsorship + latest.membership;
  const items = [
    { label: '구독료', value: latest.subscription, color: 'bg-indigo-500' },
    { label: '스폰서', value: latest.sponsorship, color: 'bg-amber-500' },
    { label: '멤버십', value: latest.membership, color: 'bg-emerald-500' }
  ];

  document.getElementById('revenue-breakdown').innerHTML = items.map(item => {
    const pct = ((item.value / total) * 100).toFixed(1);
    return `
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span class="text-slate-400">${item.label}</span>
          <span>${formatCurrency(item.value)} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${item.color}" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ---- Archive ----
function renderArchive() {
  const sent = appData.newsletters
    .filter(n => n.status === 'sent')
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  const grid = document.getElementById('archive-grid');
  if (sent.length === 0) {
    grid.innerHTML = '<div class="col-span-3 text-center text-slate-500 py-12">발송된 뉴스레터가 없습니다.</div>';
    return;
  }

  grid.innerHTML = sent.map(n => {
    const isPremium = n.targetTier === 'paid' || n.targetTier === 'pro';
    return `
      <div class="card cursor-pointer" onclick="showNewsletterPreview('${n.id}')">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-slate-500">${categoryLabel(n.category)}</span>
          ${isPremium ? '<span class="badge badge-pro">프리미엄</span>' : ''}
        </div>
        <h4 class="font-semibold mb-2 text-sm leading-snug">${n.title}</h4>
        <p class="text-xs text-slate-500 mb-3">${formatDate(n.sentAt)}</p>
        <div class="flex gap-4 text-xs text-slate-400">
          <span>📬 오픈율 ${n.openRate}%</span>
          <span>🔗 클릭율 ${n.clickRate}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function showNewsletterPreview(id) {
  const nl = appData.newsletters.find(n => n.id === id);
  if (!nl) return;

  const modal = document.getElementById('modal-container');
  modal.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal-content" style="max-width:700px;">
        <div class="flex justify-between items-center mb-4">
          <div>
            <span class="text-xs text-slate-500">${categoryLabel(nl.category)} · ${formatDate(nl.sentAt)}</span>
            <h3 class="text-lg font-bold mt-1">${nl.title}</h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        <div class="flex gap-4 text-xs text-slate-400 mb-4">
          <span>대상: ${nl.targetTier === 'all' ? '전체' : tierLabel(nl.targetTier)}</span>
          <span>오픈율: ${nl.openRate}%</span>
          <span>클릭율: ${nl.clickRate}%</span>
        </div>
        <div class="newsletter-preview">
          ${nl.content}
        </div>
      </div>
    </div>
  `;
}

// ---- Pricing ----
function subscribePlan(plan) {
  const planNames = { free: '무료', basic: '베이직', pro: '프로' };
  showToast(`${planNames[plan]} 플랜 구독이 시작되었습니다! (데모)`, 'info');
}

// ---- Modal ----
function closeModal() {
  document.getElementById('modal-container').innerHTML = '';
}

// ---- Event Listeners ----
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  navigateTo('dashboard');

  // Target count update
  const targetSelect = document.getElementById('nl-target');
  if (targetSelect) {
    targetSelect.addEventListener('change', updateTargetCount);
  }
});

// Keyboard shortcut: Escape to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
