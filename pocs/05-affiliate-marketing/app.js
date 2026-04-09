// ===================================================
// 링크잇 - 제휴마케팅 & 콘텐츠 커머스 플랫폼
// app.js — Main Application Logic
// ===================================================

// ---- State ----
let affiliateLinks = [];
let dailyStats = [];
let currentFilter = 'all';
let currentTemplate = 'comparison';
let rankCount = 1;

// ---- Constants ----
const STORAGE_KEY = 'linkit_data';
const GOAL_AMOUNT = 20000000; // 월 2천만원 목표

const CATEGORIES = ['전자기기', '생활용품', '뷰티', '식품', '패션', '도서', '유아', '기타'];

const PROGRAM_INFO = {
  coupang: { name: '쿠팡 파트너스', emoji: '🔴', color: '#E4002B', avgRate: 5 },
  naver: { name: '네이버 애드포스트', emoji: '🟢', color: '#03C75A', avgRate: 3 },
  tenping: { name: '텐핑', emoji: '🟣', color: '#6366F1', avgRate: 10 },
  other: { name: '기타', emoji: '⚪', color: '#6B7280', avgRate: 5 }
};

// ---- Demo Data Generation ----
function generateDemoData() {
  const products = [
    { name: '삼성 갤럭시 S24 Ultra', program: 'coupang', category: '전자기기', rate: 3 },
    { name: 'LG 그램 2024 노트북', program: 'coupang', category: '전자기기', rate: 3 },
    { name: '에어팟 프로 2세대', program: 'coupang', category: '전자기기', rate: 5 },
    { name: '다이슨 에어랩', program: 'coupang', category: '뷰티', rate: 5 },
    { name: '설화수 자음생크림', program: 'tenping', category: '뷰티', rate: 12 },
    { name: '닥터자르트 시카페어', program: 'tenping', category: '뷰티', rate: 10 },
    { name: '곰표 밀가루 쿠키', program: 'naver', category: '식품', rate: 3 },
    { name: '뉴트리원 비타민D', program: 'tenping', category: '식품', rate: 8 },
    { name: '브리타 정수기 필터', program: 'coupang', category: '생활용품', rate: 7 },
    { name: '일리 커피머신 Y3', program: 'coupang', category: '생활용품', rate: 5 },
    { name: '나이키 에어맥스 97', program: 'naver', category: '패션', rate: 3 },
    { name: '무지 린넨 셔츠', program: 'naver', category: '패션', rate: 3 },
    { name: '역행자 (자기계발서)', program: 'naver', category: '도서', rate: 3 },
    { name: '보닉스 아기 물티슈', program: 'coupang', category: '유아', rate: 7 },
    { name: '레고 클래식 세트', program: 'coupang', category: '유아', rate: 5 }
  ];

  affiliateLinks = products.map((p, i) => {
    const clicks = Math.floor(Math.random() * 5000) + 500;
    const convRate = (Math.random() * 6 + 1) / 100;
    const conversions = Math.floor(clicks * convRate);
    const avgOrderValue = Math.floor(Math.random() * 150000) + 20000;
    const revenue = Math.floor(conversions * avgOrderValue * (p.rate / 100));

    return {
      id: 'link_' + Date.now() + '_' + i,
      productName: p.name,
      originalUrl: `https://link.${p.program === 'coupang' ? 'coupang' : p.program === 'naver' ? 'naver' : 'tenping'}.com/${Math.random().toString(36).substr(2,8)}`,
      shortUrl: `https://lnk.it/${Math.random().toString(36).substr(2,6)}`,
      program: p.program,
      category: p.category,
      status: Math.random() > 0.15 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'expired'),
      commissionRate: p.rate,
      clicks: clicks,
      conversions: conversions,
      revenue: revenue,
      createdAt: Date.now() - Math.floor(Math.random() * 30 * 86400000),
      updatedAt: Date.now()
    };
  });

  // Generate 30 days of daily stats
  dailyStats = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    affiliateLinks.forEach(link => {
      const dayClicks = Math.floor(Math.random() * (link.clicks / 15)) + 10;
      const dayConversions = Math.floor(dayClicks * (Math.random() * 0.06 + 0.01));
      const dayRevenue = Math.floor(link.revenue / 30 * (0.5 + Math.random()));

      dailyStats.push({
        date: dateStr,
        linkId: link.id,
        clicks: dayClicks,
        conversions: dayConversions,
        revenue: dayRevenue,
        program: link.program
      });
    });
  }

  saveData();
}

// ---- Persistence ----
function saveData() {
  const data = { affiliateLinks, dailyStats, savedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      affiliateLinks = data.affiliateLinks || [];
      dailyStats = data.dailyStats || [];
      return true;
    }
  } catch (e) {
    console.warn('데이터 로드 실패:', e);
  }
  return false;
}

// ---- Utilities ----
function formatCurrency(n) {
  if (n >= 100000000) return '₩' + (n / 100000000).toFixed(1) + '억';
  if (n >= 10000) return '₩' + (n / 10000).toFixed(0) + '만';
  return '₩' + n.toLocaleString('ko-KR');
}

function formatNumber(n) {
  return n.toLocaleString('ko-KR');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function getProgramBadge(program) {
  const p = PROGRAM_INFO[program] || PROGRAM_INFO.other;
  return `<span class="badge badge-${program}">${p.emoji} ${p.name}</span>`;
}

function getStatusBadge(status) {
  const labels = { active: '✅ 활성', inactive: '⏸️ 비활성', expired: '❌ 만료' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

// ---- Navigation ----
function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.nav-tab[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById('section-' + tab);
  if (section) {
    section.classList.add('active');
    section.classList.add('animate-in');
  }
  // Close mobile menu
  document.getElementById('navTabs').classList.remove('open');
  // Refresh content
  if (tab === 'dashboard') renderDashboard();
  else if (tab === 'links') renderLinksTable();
  else if (tab === 'analytics') renderAnalytics();
  else if (tab === 'sns') updateSnsPreview();
}

function toggleMobileMenu() {
  document.getElementById('navTabs').classList.toggle('open');
}

// ---- Dashboard ----
function renderDashboard() {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);

  const thisMonthStats = dailyStats.filter(s => s.date.startsWith(thisMonth));
  const lastMonthStats = dailyStats.filter(s => s.date.startsWith(lastMonth));

  const totalRevenue = thisMonthStats.reduce((s, d) => s + d.revenue, 0);
  const totalClicks = thisMonthStats.reduce((s, d) => s + d.clicks, 0);
  const totalConversions = thisMonthStats.reduce((s, d) => s + d.conversions, 0);
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

  const lastRevenue = lastMonthStats.reduce((s, d) => s + d.revenue, 0);
  const lastClicks = lastMonthStats.reduce((s, d) => s + d.clicks, 0);
  const lastConversions = lastMonthStats.reduce((s, d) => s + d.conversions, 0);
  const lastConvRate = lastClicks > 0 ? (lastConversions / lastClicks * 100) : 0;

  document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('totalClicks').textContent = formatNumber(totalClicks);
  document.getElementById('totalConversions').textContent = formatNumber(totalConversions);
  document.getElementById('conversionRate').textContent = convRate.toFixed(1) + '%';

  const revChange = lastRevenue > 0 ? ((totalRevenue - lastRevenue) / lastRevenue * 100) : 0;
  const clickChange = lastClicks > 0 ? ((totalClicks - lastClicks) / lastClicks * 100) : 0;
  const convChange = lastConversions > 0 ? ((totalConversions - lastConversions) / lastConversions * 100) : 0;
  const rateChangeVal = convRate - lastConvRate;

  setChange('revenueChange', revChange, '%');
  setChange('clickChange', clickChange, '%');
  setChange('conversionChange', convChange, '%');
  setChange('rateChange', rateChangeVal, '%p');

  // Goal progress
  const goalPct = Math.min(100, (totalRevenue / GOAL_AMOUNT * 100));
  document.getElementById('goalPercent').textContent = goalPct.toFixed(1) + '%';
  document.getElementById('goalProgress').style.width = goalPct + '%';

  // Top links table
  const sorted = [...affiliateLinks].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  document.getElementById('topLinksTable').innerHTML = sorted.map((l, i) => `
    <tr>
      <td><strong>${i + 1}</strong></td>
      <td>${l.productName}</td>
      <td>${getProgramBadge(l.program)}</td>
      <td>${formatNumber(l.clicks)}</td>
      <td>${formatNumber(l.conversions)}</td>
      <td><strong>${formatCurrency(l.revenue)}</strong></td>
    </tr>
  `).join('');

  // Charts
  drawDailyRevenueChart();
  drawProgramPieChart();
}

function setChange(id, val, suffix) {
  const el = document.getElementById(id);
  if (val >= 0) {
    el.textContent = `▲ ${Math.abs(val).toFixed(1)}${suffix}`;
    el.className = 'stat-change up';
  } else {
    el.textContent = `▼ ${Math.abs(val).toFixed(1)}${suffix}`;
    el.className = 'stat-change down';
  }
}

// ---- Charts (Canvas API) ----
function drawDailyRevenueChart() {
  const canvas = document.getElementById('dailyRevenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);

  // Aggregate last 14 days
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const revenues = days.map(date =>
    dailyStats.filter(s => s.date === date).reduce((sum, s) => sum + s.revenue, 0)
  );

  const maxVal = Math.max(...revenues, 1);
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Grid lines
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
    // Y labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    const val = maxVal - (maxVal / 4) * i;
    ctx.fillText(formatCurrency(val), padding.left - 5, y + 4);
  }

  // Line
  ctx.strokeStyle = '#FF6B35';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  revenues.forEach((v, i) => {
    const x = padding.left + (chartW / (revenues.length - 1)) * i;
    const y = padding.top + chartH - (v / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill area
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  gradient.addColorStop(0, 'rgba(255,107,53,0.3)');
  gradient.addColorStop(1, 'rgba(255,107,53,0.02)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Dots
  revenues.forEach((v, i) => {
    const x = padding.left + (chartW / (revenues.length - 1)) * i;
    const y = padding.top + chartH - (v / maxVal) * chartH;
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // X labels
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  days.forEach((d, i) => {
    if (i % 2 === 0) {
      const x = padding.left + (chartW / (days.length - 1)) * i;
      ctx.fillText(d.slice(5), x, h - 10);
    }
  });
}

function drawProgramPieChart() {
  const canvas = document.getElementById('programPieChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const programRevenues = {};
  affiliateLinks.forEach(l => {
    programRevenues[l.program] = (programRevenues[l.program] || 0) + l.revenue;
  });

  const total = Object.values(programRevenues).reduce((s, v) => s + v, 0);
  if (total === 0) return;

  const colors = { coupang: '#E4002B', naver: '#03C75A', tenping: '#6366F1', other: '#6B7280' };
  const cx = w * 0.35, cy = h * 0.5, r = Math.min(w * 0.28, h * 0.4);

  let startAngle = -Math.PI / 2;
  const entries = Object.entries(programRevenues).sort((a, b) => b[1] - a[1]);

  entries.forEach(([prog, rev]) => {
    const sliceAngle = (rev / total) * Math.PI * 2;
    ctx.fillStyle = colors[prog] || '#999';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    // White border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle += sliceAngle;
  });

  // Center hole (donut)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Center text
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('총 수익', cx, cy - 8);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#FF6B35';
  ctx.fillText(formatCurrency(total), cx, cy + 14);

  // Legend
  const legendX = w * 0.68;
  let legendY = h * 0.2;
  entries.forEach(([prog, rev]) => {
    const info = PROGRAM_INFO[prog] || PROGRAM_INFO.other;
    ctx.fillStyle = colors[prog] || '#999';
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${info.name}`, legendX + 18, legendY + 10);
    ctx.fillStyle = '#6B7280';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${formatCurrency(rev)} (${(rev/total*100).toFixed(0)}%)`, legendX + 18, legendY + 26);
    legendY += 42;
  });
}

function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const maxVal = Math.max(...values, 1);
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const barW = (chartW / labels.length) * 0.6;
  const gap = (chartW / labels.length) * 0.4;

  // Grid
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formatCurrency(maxVal - (maxVal / 4) * i), padding.left - 5, y + 4);
  }

  // Bars
  values.forEach((v, i) => {
    const barH = (v / maxVal) * chartH;
    const x = padding.left + (chartW / labels.length) * i + gap / 2;
    const y = padding.top + chartH - barH;

    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '80');
    ctx.fillStyle = grad;

    // Rounded top
    const radius = Math.min(4, barW / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();

    // Label
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, h - 10);
  });
}

function drawHourlyChart() {
  const labels = Array.from({ length: 24 }, (_, i) => `${i}시`);
  const values = Array.from({ length: 24 }, () => Math.floor(Math.random() * 500) + 50);
  // Simulate peak hours (lunch, evening)
  [11, 12, 13, 19, 20, 21, 22].forEach(h => { values[h] = Math.floor(Math.random() * 300) + 400; });
  [2, 3, 4, 5].forEach(h => { values[h] = Math.floor(Math.random() * 50) + 10; });

  drawBarChart('hourlyChart', labels.filter((_, i) => i % 3 === 0), values.filter((_, i) => i % 3 === 0), '#00B4D8');
}

// ---- Links Management ----
function renderLinksTable(filter) {
  filter = filter || currentFilter;
  const filtered = filter === 'all' ? affiliateLinks : affiliateLinks.filter(l => l.program === filter);

  document.getElementById('linksTableBody').innerHTML = filtered.map(l => `
    <tr>
      <td>
        <div style="font-weight:600;">${l.productName}</div>
        <div style="font-size:0.75rem;color:var(--gray-400);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.shortUrl}</div>
      </td>
      <td>${getProgramBadge(l.program)}</td>
      <td>${l.category}</td>
      <td>${getStatusBadge(l.status)}</td>
      <td>${formatNumber(l.clicks)}</td>
      <td>${formatNumber(l.conversions)}</td>
      <td><strong>${formatCurrency(l.revenue)}</strong></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-secondary" onclick="editLink('${l.id}')" title="수정">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteLink('${l.id}')" title="삭제">🗑️</button>
          <button class="btn btn-sm btn-outline" onclick="copyUrl('${l.shortUrl}')" title="링크 복사">📋</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterLinks(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('#section-links .filter-chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  renderLinksTable(filter);
}

function openAddLinkModal() {
  document.getElementById('addLinkModal').classList.add('active');
  document.getElementById('linkProductName').value = '';
  document.getElementById('linkUrl').value = '';
  document.getElementById('linkProgram').value = 'coupang';
  document.getElementById('linkCategory').value = '전자기기';
  document.getElementById('linkCommission').value = '5';
}

function closeAddLinkModal() {
  document.getElementById('addLinkModal').classList.remove('active');
}

function saveLink() {
  const name = document.getElementById('linkProductName').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  const program = document.getElementById('linkProgram').value;
  const category = document.getElementById('linkCategory').value;
  const commission = parseFloat(document.getElementById('linkCommission').value) || 5;

  if (!name) { showToast('❌ 제품명을 입력해주세요'); return; }
  if (!url) { showToast('❌ 제휴 링크 URL을 입력해주세요'); return; }

  const link = {
    id: 'link_' + Date.now(),
    productName: name,
    originalUrl: url,
    shortUrl: `https://lnk.it/${Math.random().toString(36).substr(2,6)}`,
    program,
    category,
    status: 'active',
    commissionRate: commission,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  affiliateLinks.push(link);
  saveData();
  closeAddLinkModal();
  renderLinksTable();
  showToast('✅ 제휴 링크가 등록되었습니다!');
}

function editLink(id) {
  const link = affiliateLinks.find(l => l.id === id);
  if (!link) return;
  document.getElementById('editLinkId').value = id;
  document.getElementById('editProductName').value = link.productName;
  document.getElementById('editLinkUrl').value = link.originalUrl;
  document.getElementById('editLinkProgram').value = link.program;
  document.getElementById('editLinkCategory').value = link.category;
  document.getElementById('editLinkStatus').value = link.status;
  document.getElementById('editLinkCommission').value = link.commissionRate;
  document.getElementById('editLinkModal').classList.add('active');
}

function closeEditLinkModal() {
  document.getElementById('editLinkModal').classList.remove('active');
}

function updateLink() {
  const id = document.getElementById('editLinkId').value;
  const link = affiliateLinks.find(l => l.id === id);
  if (!link) return;

  link.productName = document.getElementById('editProductName').value.trim();
  link.originalUrl = document.getElementById('editLinkUrl').value.trim();
  link.program = document.getElementById('editLinkProgram').value;
  link.category = document.getElementById('editLinkCategory').value;
  link.status = document.getElementById('editLinkStatus').value;
  link.commissionRate = parseFloat(document.getElementById('editLinkCommission').value) || 5;
  link.updatedAt = Date.now();

  saveData();
  closeEditLinkModal();
  renderLinksTable();
  showToast('✅ 링크가 수정되었습니다!');
}

function deleteLink(id) {
  if (!confirm('이 링크를 삭제하시겠습니까?')) return;
  affiliateLinks = affiliateLinks.filter(l => l.id !== id);
  dailyStats = dailyStats.filter(s => s.linkId !== id);
  saveData();
  renderLinksTable();
  showToast('🗑️ 링크가 삭제되었습니다');
}

function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => showToast('📋 링크가 복사되었습니다!'));
}

// ---- Analytics ----
function renderAnalytics() {
  const today = new Date().toISOString().split('T')[0];
  const todayData = dailyStats.filter(s => s.date === today);

  const tClicks = todayData.reduce((s, d) => s + d.clicks, 0);
  const tConversions = todayData.reduce((s, d) => s + d.conversions, 0);
  const tRevenue = todayData.reduce((s, d) => s + d.revenue, 0);
  const tRate = tClicks > 0 ? (tConversions / tClicks * 100) : 0;

  document.getElementById('todayClicks').textContent = formatNumber(tClicks);
  document.getElementById('todayRevenue').textContent = formatCurrency(tRevenue);
  document.getElementById('todayConversions').textContent = formatNumber(tConversions);
  document.getElementById('todayRate').textContent = tRate.toFixed(1) + '%';

  // Monthly bar chart
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthLabels = months.map(m => m.slice(5) + '월');
  const monthValues = months.map(m =>
    dailyStats.filter(s => s.date.startsWith(m)).reduce((sum, s) => sum + s.revenue, 0)
  );
  drawBarChart('monthlyBarChart', monthLabels, monthValues, '#FF6B35');

  // Hourly chart
  drawHourlyChart();

  // Category stats
  const catStats = {};
  affiliateLinks.forEach(l => {
    if (!catStats[l.category]) catStats[l.category] = { links: 0, clicks: 0, conversions: 0, revenue: 0 };
    catStats[l.category].links++;
    catStats[l.category].clicks += l.clicks;
    catStats[l.category].conversions += l.conversions;
    catStats[l.category].revenue += l.revenue;
  });

  document.getElementById('categoryStatsTable').innerHTML = Object.entries(catStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([cat, s]) => `
      <tr>
        <td><strong>${cat}</strong></td>
        <td>${s.links}</td>
        <td>${formatNumber(s.clicks)}</td>
        <td>${formatNumber(s.conversions)}</td>
        <td>${s.clicks > 0 ? (s.conversions / s.clicks * 100).toFixed(1) : 0}%</td>
        <td><strong>${formatCurrency(s.revenue)}</strong></td>
      </tr>
    `).join('');
}

// ---- Content Templates ----
function selectTemplate(type) {
  currentTemplate = type;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.template-card[data-template="${type}"]`).classList.add('selected');

  document.getElementById('tpl-comparison').style.display = type === 'comparison' ? 'block' : 'none';
  document.getElementById('tpl-ranking').style.display = type === 'ranking' ? 'block' : 'none';
  document.getElementById('tpl-review').style.display = type === 'review' ? 'block' : 'none';
  document.getElementById('templatePreviewCard').style.display = 'none';
}

function addCompProduct() {
  const container = document.getElementById('compProductFields');
  const count = container.children.length + 1;
  if (count > 4) { showToast('❌ 최대 4개 제품까지 비교 가능합니다'); return; }
  const div = document.createElement('div');
  div.className = 'card';
  div.style.cssText = 'background:var(--gray-50);border:1px dashed var(--gray-300);';
  div.innerHTML = `
    <strong>제품 ${count}</strong>
    <div class="form-group" style="margin-top:0.5rem;"><input type="text" class="form-input" placeholder="제품명" data-comp="name"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="가격 (원)" data-comp="price"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="평점 (1~5)" data-comp="rating"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="장점 (쉼표 구분)" data-comp="pros"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="단점 (쉼표 구분)" data-comp="cons"></div>
  `;
  container.appendChild(div);
}

function generateComparison() {
  const title = document.getElementById('compTitle').value || '제품 비교 리뷰';
  const cards = document.querySelectorAll('#compProductFields > .card');
  const products = [];

  cards.forEach(card => {
    const inputs = card.querySelectorAll('input');
    const name = inputs[0].value || '제품명 미입력';
    const price = inputs[1].value || '가격 미입력';
    const rating = inputs[2].value || '4';
    const pros = inputs[3].value || '장점';
    const cons = inputs[4].value || '단점';
    products.push({ name, price, rating, pros: pros.split(','), cons: cons.split(',') });
  });

  const stars = (r) => '⭐'.repeat(Math.round(parseFloat(r)));

  let html = `<h2>⚖️ ${title}</h2>`;
  html += `<table class="comparison-table"><thead><tr><th>항목</th>`;
  products.forEach(p => { html += `<th>${p.name}</th>`; });
  html += `</tr></thead><tbody>`;
  html += `<tr><td><strong>가격</strong></td>${products.map(p => `<td>₩${p.price}</td>`).join('')}</tr>`;
  html += `<tr><td><strong>평점</strong></td>${products.map(p => `<td>${stars(p.rating)} (${p.rating})</td>`).join('')}</tr>`;
  html += `<tr><td><strong>장점</strong></td>${products.map(p => `<td>${p.pros.map(x => '✅ ' + x.trim()).join('<br>')}</td>`).join('')}</tr>`;
  html += `<tr><td><strong>단점</strong></td>${products.map(p => `<td>${p.cons.map(x => '❌ ' + x.trim()).join('<br>')}</td>`).join('')}</tr>`;
  html += `</tbody></table>`;
  html += `<p style="margin-top:1rem;color:var(--gray-600);font-size:0.85rem;">※ 이 포스팅은 제휴마케팅 링크를 포함하고 있습니다. 구매 시 소정의 수수료를 받을 수 있습니다.</p>`;

  document.getElementById('templatePreview').innerHTML = html;
  document.getElementById('templatePreviewCard').style.display = 'block';
  showToast('✨ 비교 리뷰가 생성되었습니다!');
}

function addRankProduct() {
  rankCount++;
  if (rankCount > 10) { showToast('❌ 최대 10개까지 추가 가능합니다'); return; }
  const container = document.getElementById('rankProductFields');
  const div = document.createElement('div');
  div.className = 'card';
  div.style.cssText = 'background:var(--gray-50);border:1px dashed var(--gray-300);';
  div.setAttribute('data-rank', rankCount);
  div.innerHTML = `
    <strong>${rankCount}위</strong>
    <div class="form-group" style="margin-top:0.5rem;"><input type="text" class="form-input" placeholder="제품명" data-rank-field="name"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="가격 (원)" data-rank-field="price"></div>
    <div class="form-group"><input type="text" class="form-input" placeholder="추천 이유" data-rank-field="reason"></div>
  `;
  container.appendChild(div);
}

function generateRanking() {
  const title = document.getElementById('rankTitle').value || '추천 제품 리스트';
  const cards = document.querySelectorAll('#rankProductFields > .card');
  const items = [];

  cards.forEach((card, i) => {
    const inputs = card.querySelectorAll('input');
    items.push({
      rank: i + 1,
      name: inputs[0].value || `제품 ${i + 1}`,
      price: inputs[1].value || '가격 미입력',
      reason: inputs[2].value || '추천'
    });
  });

  let html = `<h2>🏆 ${title}</h2>`;
  items.forEach(item => {
    html += `
      <div class="rank-item">
        <div class="rank-number">${item.rank}</div>
        <div>
          <div style="font-weight:700;font-size:1rem;">${item.name}</div>
          <div style="color:var(--primary);font-weight:600;margin:0.25rem 0;">₩${item.price}</div>
          <div style="font-size:0.85rem;color:var(--gray-600);">💡 ${item.reason}</div>
        </div>
      </div>
    `;
  });
  html += `<p style="margin-top:1rem;color:var(--gray-600);font-size:0.85rem;">※ 이 포스팅은 제휴마케팅 링크를 포함하고 있습니다.</p>`;

  document.getElementById('templatePreview').innerHTML = html;
  document.getElementById('templatePreviewCard').style.display = 'block';
  showToast('✨ 추천 리스트가 생성되었습니다!');
}

function generateReview() {
  const name = document.getElementById('reviewName').value || '제품명';
  const price = document.getElementById('reviewPrice').value || '가격 미입력';
  const rating = document.getElementById('reviewRating').value || '4';
  const pros = document.getElementById('reviewPros').value.split(',').filter(x => x.trim());
  const cons = document.getElementById('reviewCons').value.split(',').filter(x => x.trim());
  const desc = document.getElementById('reviewDesc').value || '상세 설명이 없습니다.';

  const stars = '⭐'.repeat(Math.round(parseFloat(rating)));

  let html = `
    <h2>⭐ ${name} 상세 리뷰</h2>
    <div style="background:var(--primary-light);padding:1rem;border-radius:8px;margin:1rem 0;">
      <div style="font-size:1.5rem;margin-bottom:0.5rem;">${stars}</div>
      <div style="font-weight:700;font-size:1.2rem;">총평: ${rating}점 / 5점</div>
      <div style="font-weight:700;color:var(--primary);font-size:1.1rem;margin-top:0.25rem;">₩${price}</div>
    </div>
    <div style="margin:1rem 0;">
      <h3 style="color:var(--success);margin-bottom:0.5rem;">✅ 장점</h3>
      <ul style="padding-left:1.25rem;">
        ${pros.map(p => `<li style="margin-bottom:0.25rem;">${p.trim()}</li>`).join('')}
      </ul>
    </div>
    <div style="margin:1rem 0;">
      <h3 style="color:var(--danger);margin-bottom:0.5rem;">❌ 단점</h3>
      <ul style="padding-left:1.25rem;">
        ${cons.map(c => `<li style="margin-bottom:0.25rem;">${c.trim()}</li>`).join('')}
      </ul>
    </div>
    <div style="margin:1rem 0;">
      <h3 style="margin-bottom:0.5rem;">📝 상세 리뷰</h3>
      <p style="line-height:1.8;color:var(--gray-700);">${desc}</p>
    </div>
    <p style="margin-top:1.5rem;color:var(--gray-600);font-size:0.85rem;">※ 이 포스팅은 제휴마케팅 링크를 포함하고 있습니다.</p>
  `;

  document.getElementById('templatePreview').innerHTML = html;
  document.getElementById('templatePreviewCard').style.display = 'block';
  showToast('✨ 상세 리뷰가 생성되었습니다!');
}

function copyTemplateHtml() {
  const html = document.getElementById('templatePreview').innerHTML;
  navigator.clipboard.writeText(html).then(() => showToast('📋 HTML이 클립보드에 복사되었습니다!'));
}

// ---- SNS Card Generator ----
function updateSnsPreview() {
  const style = document.getElementById('snsStyle').value;
  const name = document.getElementById('snsProductName').value || '제품명';
  const price = document.getElementById('snsPrice').value || '0';
  const salePrice = document.getElementById('snsSalePrice').value || '0';
  const rating = document.getElementById('snsRating').value || '4.5';
  const emoji = document.getElementById('snsEmoji').value || '📦';
  const affUrl = document.getElementById('snsAffUrl').value || '#';

  const stars = '⭐'.repeat(Math.round(parseFloat(rating)));
  const discount = price && salePrice ? Math.round((1 - parseInt(salePrice.replace(/,/g,'')) / parseInt(price.replace(/,/g,''))) * 100) : 0;

  let cardHtml = '';
  let textContent = '';

  if (style === 'coupang') {
    cardHtml = `
      <div class="product-card-preview" style="border-top:4px solid #E4002B;">
        <div class="card-image" style="background:linear-gradient(135deg,#FFF5F5,#FEE2E2);">${emoji}</div>
        <div class="card-body">
          <div style="font-size:0.75rem;color:#E4002B;font-weight:700;margin-bottom:0.35rem;">🚀 로켓배송</div>
          <div class="card-name">${name}</div>
          <div class="card-rating">${stars} (${rating})</div>
          <div style="text-decoration:line-through;color:var(--gray-400);font-size:0.85rem;">₩${price}</div>
          <div class="card-price">
            <span style="color:#E4002B;margin-right:0.35rem;font-size:1rem;">${discount}%</span>
            ₩${salePrice}
          </div>
          <div class="card-cta" style="background:#E4002B;">쿠팡에서 구매하기 →</div>
        </div>
      </div>
    `;
    textContent = `🔥 ${name} 특가!\n\n` +
      `💰 정가: ₩${price}\n` +
      `🏷️ 할인가: ₩${salePrice} (${discount}% OFF)\n` +
      `⭐ 평점: ${rating}/5.0\n` +
      `🚀 로켓배송\n\n` +
      `👉 구매 링크: ${affUrl}\n\n` +
      `#쿠팡 #쿠팡파트너스 #${name.replace(/\s/g,'')} #특가 #할인 #로켓배송 #추천`;
  } else if (style === 'naver') {
    cardHtml = `
      <div class="product-card-preview" style="border-top:4px solid #03C75A;">
        <div class="card-image" style="background:linear-gradient(135deg,#F0FFF4,#D1FAE5);">${emoji}</div>
        <div class="card-body">
          <div style="font-size:0.75rem;color:#03C75A;font-weight:700;margin-bottom:0.35rem;">🛒 네이버 쇼핑</div>
          <div class="card-name">${name}</div>
          <div class="card-rating">${stars} (${rating})</div>
          <div style="display:flex;align-items:baseline;gap:0.5rem;">
            <div class="card-price" style="color:#03C75A;">₩${salePrice}</div>
          </div>
          <div class="card-cta" style="background:#03C75A;">네이버에서 확인하기 →</div>
        </div>
      </div>
    `;
    textContent = `✨ ${name}\n\n` +
      `💵 가격: ₩${salePrice}\n` +
      `⭐ 평점: ${rating}/5.0\n` +
      `📦 무료배송\n\n` +
      `🔗 상세 보기: ${affUrl}\n\n` +
      `#네이버쇼핑 #${name.replace(/\s/g,'')} #추천제품 #리뷰 #쇼핑`;
  } else { // instagram
    cardHtml = `
      <div class="product-card-preview" style="border:none;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);padding:3px;border-radius:14px;">
        <div style="background:white;border-radius:12px;overflow:hidden;">
          <div class="card-image" style="background:linear-gradient(135deg,#FAFAFA,#F0F0F0);height:250px;">${emoji}</div>
          <div class="card-body">
            <div class="card-name" style="font-size:1.05rem;">${name}</div>
            <div class="card-rating">${stars}</div>
            <div class="card-price" style="background:linear-gradient(90deg,#833AB4,#FD1D1D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">₩${salePrice}</div>
            <div style="margin-top:0.5rem;font-size:0.8rem;color:var(--gray-500);">프로필 링크에서 확인하세요 ↗</div>
          </div>
        </div>
      </div>
    `;
    textContent = `${emoji} ${name}\n\n` +
      `가격이 미쳤어요! 💸\n` +
      `₩${price} → ₩${salePrice} (${discount}% 할인)\n\n` +
      `솔직후기 ⬇️\n` +
      `✅ 가성비 최고\n` +
      `✅ 품질 대만족\n` +
      `✅ 빠른 배송\n\n` +
      `🔗 구매 링크는 프로필에!\n\n` +
      `#${name.replace(/\s/g,'')} #추천템 #인생템 #꿀딜 #할인정보 #쇼핑추천 #리뷰 #솔직후기`;
  }

  document.getElementById('snsPreviewArea').innerHTML = cardHtml;
  document.getElementById('snsText').value = textContent;
}

function copySnsText() {
  const text = document.getElementById('snsText').value;
  navigator.clipboard.writeText(text).then(() => showToast('📋 SNS 텍스트가 복사되었습니다!'));
}

function copySnsCard() {
  const html = document.getElementById('snsPreviewArea').innerHTML;
  navigator.clipboard.writeText(html).then(() => showToast('🖼️ 카드 HTML이 복사되었습니다!'));
}

// ---- Initialization ----
function init() {
  const loaded = loadData();
  if (!loaded || affiliateLinks.length === 0) {
    generateDemoData();
  }
  renderDashboard();
  renderLinksTable();
  updateSnsPreview();
}

// Handle window resize for charts
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeSection = document.querySelector('.page-section.active');
    if (activeSection) {
      const id = activeSection.id.replace('section-', '');
      if (id === 'dashboard') {
        drawDailyRevenueChart();
        drawProgramPieChart();
      } else if (id === 'analytics') {
        renderAnalytics();
      }
    }
  }, 250);
});

// Start
document.addEventListener('DOMContentLoaded', init);
