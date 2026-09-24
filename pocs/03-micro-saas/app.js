// ============================================
// 예약잇다 - 소상공인 예약 관리 시스템 POC
// ============================================

// --- Data Layer ---
const STORAGE_KEY = 'yeyakitda_data';

const defaultServices = [
  { id: 's1', name: '커트', duration: 30, price: 15000 },
  { id: 's2', name: '펌', duration: 120, price: 50000 },
  { id: 's3', name: '염색', duration: 90, price: 40000 },
  { id: 's4', name: '클리닉', duration: 60, price: 30000 },
  { id: 's5', name: '드라이', duration: 20, price: 10000 },
];

const defaultBusiness = {
  name: '뷰티헤어살롱',
  category: '미용실',
  phone: '02-1234-5678',
  address: '서울시 강남구 역삼동 123-45',
  services: defaultServices,
  operatingHours: { open: '10:00', close: '20:00' },
};

const STATUS = {
  confirmed: { label: '확정' },
  pending: { label: '대기' },
  cancelled: { label: '취소' },
};

const PAGE_TITLES = {
  dashboard: '대시보드',
  calendar: '예약 관리',
  customers: '고객 관리',
  notifications: '알림톡 미리보기',
  booking: '고객 예약 페이지',
  pricing: '요금제',
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

function isValidData(data) {
  return data && Array.isArray(data.reservations) && Array.isArray(data.customers);
}

function createSampleData() {
  const data = { reservations: [], customers: [], business: defaultBusiness };
  generateSampleData(data);
  saveData(data);
  return data;
}

function loadData() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    raw = null;
  }
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidData(parsed)) return parsed;
    } catch (e) {
      // Corrupted storage: fall through and rebuild sample data.
    }
  }
  return createSampleData();
}

let storageWarned = false;
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (!storageWarned) {
      storageWarned = true;
      // Toast may not be ready during first load; defer.
      setTimeout(() => showToast('브라우저 저장소에 저장하지 못했습니다. 새로고침하면 변경 내용이 사라질 수 있습니다.'), 0);
    }
  }
}

function generateSampleData(data) {
  const names = ['김미영', '이수진', '박지현', '최윤아', '정다은', '한소희', '오세진', '윤서연', '강지윤', '임하늘', '조민지', '신예린'];
  const phones = ['010-1234-5678', '010-2345-6789', '010-3456-7890', '010-4567-8901', '010-5678-9012', '010-6789-0123', '010-7890-1234', '010-8901-2345', '010-9012-3456', '010-0123-4567', '010-1111-2222', '010-3333-4444'];
  const services = ['커트', '펌', '염색', '클리닉', '드라이'];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
  const today = new Date();

  names.forEach((name, i) => {
    data.customers.push({
      id: generateId(),
      name,
      phone: phones[i],
      visitCount: Math.floor(Math.random() * 10) + 1,
      lastVisit: formatDate(new Date(today.getTime() - Math.random() * 30 * 86400000)),
      memo: '',
      createdAt: new Date().toISOString(),
    });
  });

  for (let d = -7; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = formatDate(date);
    const count = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < count; j++) {
      const hour = 10 + Math.floor(Math.random() * 9);
      const minute = Math.random() > 0.5 ? '00' : '30';
      const custIdx = Math.floor(Math.random() * names.length);
      data.reservations.push({
        id: generateId(),
        customerName: names[custIdx],
        customerPhone: phones[custIdx],
        date: dateStr,
        time: `${String(hour).padStart(2, '0')}:${minute}`,
        service: services[Math.floor(Math.random() * services.length)],
        status: d < 0 ? 'confirmed' : statuses[Math.floor(Math.random() * statuses.length)],
        memo: '',
        createdAt: new Date().toISOString(),
      });
    }
  }
}

// --- Formatting helpers ---
function formatDate(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

// Parse YYYY-MM-DD as a local date (new Date('YYYY-MM-DD') is UTC and can shift the day).
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKR(dateStr) {
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
}

function formatDateLongKR(dateStr) {
  const d = parseDate(dateStr);
  return `${d.getFullYear()}년 ${formatDateKR(dateStr)}`;
}

function nowTimeStr() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// Normalise Korean phone numbers to 010-1234-5678 style.
function formatPhone(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 11 && digits.startsWith('0');
}

function hashAngle(id, range) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % (range * 2 + 1)) - range);
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// --- State ---
let appData = loadData();
let currentPage = 'dashboard';
let calendarYear, calendarMonth;
let selectedCalendarDate = null;
let bookingStep = 1;
let selectedService = null;
let selectedTime = null;
let freshStampId = null;
let currentNotifType = 'confirm';

// --- Stamps (결재란) ---
function stampSVG(r) {
  const tilt = hashAngle(r.id, 9);
  const fresh = r.id === freshStampId ? ' is-fresh' : '';
  if (r.status === 'confirmed') {
    return `<span class="stamp stamp-confirmed${fresh}" style="--tilt:${tilt}deg" role="img" aria-label="확정">
      <svg viewBox="0 0 60 60" aria-hidden="true"><g filter="url(#ink)"><circle cx="30" cy="30" r="26" class="st-ring"/><circle cx="30" cy="30" r="21.5" class="st-ring thin"/><text x="30" y="36.5" text-anchor="middle" class="st-text">확정</text></g></svg></span>`;
  }
  if (r.status === 'cancelled') {
    return `<span class="stamp stamp-cancelled${fresh}" style="--tilt:${tilt - 4}deg" role="img" aria-label="취소">
      <svg viewBox="0 0 72 40" aria-hidden="true"><g filter="url(#ink)"><rect x="3" y="3" width="66" height="34" class="st-ring"/><rect x="7" y="7" width="58" height="26" class="st-ring thin"/><text x="36" y="27.5" text-anchor="middle" class="st-text">취소</text></g></svg></span>`;
  }
  return `<span class="stamp stamp-pending" role="img" aria-label="대기"><span>대기</span></span>`;
}

function renderReservationItem(r, opts = {}) {
  const today = formatDate(new Date());
  const isPast = r.date < today || (r.date === today && r.time < nowTimeStr());
  const classes = ['row', `is-${r.status}`];
  if (isPast && opts.dimPast) classes.push('is-past');
  const actions = r.status === 'pending'
    ? `<div class="row-actions">
        <button type="button" class="btn btn-confirm btn-small" data-action="status" data-id="${escapeHTML(r.id)}" data-status="confirmed">확정</button>
        <button type="button" class="btn btn-cancel btn-small" data-action="status" data-id="${escapeHTML(r.id)}" data-status="cancelled">취소</button>
      </div>`
    : r.status === 'confirmed' && !isPast
      ? `<div class="row-actions quiet"><button type="button" class="btn btn-text btn-small" data-action="status" data-id="${escapeHTML(r.id)}" data-status="cancelled" aria-label="${escapeHTML(r.customerName)} ${escapeHTML(r.time)} 예약 취소">취소</button></div>`
      : '';
  const memo = r.memo ? `<p class="row-memo">${escapeHTML(r.memo)}</p>` : '';
  return `
    <li class="${classes.join(' ')}">
      <span class="row-time">${escapeHTML(r.time)}</span>
      <div class="row-main">
        <p class="row-name">${escapeHTML(r.customerName)}</p>
        <p class="row-meta">${escapeHTML(r.service)} · ${escapeHTML(r.customerPhone)}</p>
        ${memo}
      </div>
      ${actions}
      <div class="row-seal">${stampSVG(r)}</div>
    </li>`;
}

function slotTimes() {
  const { open, close } = defaultBusiness.operatingHours;
  const openHour = parseInt(open.split(':')[0], 10);
  const closeHour = parseInt(close.split(':')[0], 10);
  const times = [];
  for (let h = openHour; h < closeHour; h++) {
    for (const m of ['00', '30']) times.push(`${String(h).padStart(2, '0')}:${m}`);
  }
  return times;
}

// Day-book: every 30-minute slot is a ruled line; free slots stay visible as ghost lines.
function renderDaybook(dayRes, opts = {}) {
  const sorted = [...dayRes].sort((a, b) => a.time.localeCompare(b.time));
  const slots = slotTimes();
  const byTime = new Map();
  sorted.forEach(r => {
    if (!byTime.has(r.time)) byTime.set(r.time, []);
    byTime.get(r.time).push(r);
  });
  const allTimes = [...new Set([...slots, ...sorted.map(r => r.time)])].sort();
  let html = '';
  let run = [];
  // Consecutive free slots collapse into one ruled line so the book stays short.
  const flush = () => {
    if (!run.length) return;
    if (run.length < 3) {
      html += run.map(t => `<li class="row ghost" aria-hidden="true"><span class="row-time">${t}</span><span class="ghost-line"></span></li>`).join('');
    } else {
      const last = run[run.length - 1];
      html += `<li class="row ghost is-run"><span class="row-time">${run[0]}</span><span class="ghost-span">~ ${last} · 빈 시간 ${run.length}칸</span></li>`;
    }
    run = [];
  };
  allTimes.forEach(t => {
    const list = byTime.get(t);
    if (list) {
      flush();
      html += list.map(r => renderReservationItem(r, opts)).join('');
    } else if (opts.ghosts) {
      run.push(t);
    }
  });
  flush();
  return html;
}

// --- Navigation (hash routing: #/dashboard, #/booking, ...) ---
function pageFromHash() {
  const page = (location.hash || '').replace(/^#\/?/, '');
  return PAGE_TITLES[page] ? page : 'dashboard';
}

function showPage(page, { focus = false } = {}) {
  if (!PAGE_TITLES[page]) page = 'dashboard';
  currentPage = page;
  document.querySelectorAll('.page').forEach(el => { el.hidden = el.id !== 'page-' + page; });
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.dataset.page === page) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page];
  document.title = `${PAGE_TITLES[page]} · 예약잇다`;
  document.body.dataset.page = page;

  if (page === 'dashboard') renderDashboard();
  if (page === 'calendar') { renderCalendar(); if (selectedCalendarDate) showDateReservations(selectedCalendarDate); }
  if (page === 'customers') renderCustomers();
  if (page === 'notifications') showNotificationType(currentNotifType);
  if (page === 'booking') initBookingPage();

  if (focus) {
    window.scrollTo(0, 0);
    document.getElementById('main').focus({ preventScroll: true });
  }
}

function navigate(page) {
  const target = '#/' + page;
  if (location.hash === target) showPage(page, { focus: true });
  else location.hash = target;
}

function rerenderCurrent() {
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'calendar') {
    renderCalendar();
    if (selectedCalendarDate) showDateReservations(selectedCalendarDate);
  }
  if (currentPage === 'customers') renderCustomers();
  if (currentPage === 'notifications') showNotificationType(currentNotifType);
}

// --- Dashboard ---
function renderDashboard() {
  const todayDate = new Date();
  const today = formatDate(todayDate);
  const todayRes = appData.reservations.filter(r => r.date === today);

  document.getElementById('statTotal').textContent = todayRes.length;
  document.getElementById('statConfirmed').textContent = todayRes.filter(r => r.status === 'confirmed').length;
  document.getElementById('statPending').textContent = todayRes.filter(r => r.status === 'pending').length;
  document.getElementById('statCancelled').textContent = todayRes.filter(r => r.status === 'cancelled').length;
  document.getElementById('todayYear').textContent = `${todayDate.getFullYear()}년`;
  document.getElementById('todayDate').textContent = formatDateKR(today);

  const now = nowTimeStr();
  const next = todayRes
    .filter(r => r.status !== 'cancelled' && r.time >= now)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  const pendingCount = todayRes.filter(r => r.status === 'pending').length;
  const nextEl = document.getElementById('nextCustomer');
  const parts = [];
  if (next) parts.push(`다음 손님 <strong>${escapeHTML(next.time)} ${escapeHTML(next.customerName)}</strong> · ${escapeHTML(next.service)}`);
  else parts.push('남은 예약이 없습니다');
  if (pendingCount) parts.push(`확정 대기 <strong>${pendingCount}건</strong>`);
  nextEl.innerHTML = parts.join('<span class="sep" aria-hidden="true">/</span>');

  const container = document.getElementById('todayReservations');
  if (todayRes.length === 0) {
    container.innerHTML = emptyState('오늘 예약이 없습니다', '새 예약을 추가하거나 고객 예약 페이지 링크를 공유해 보세요.');
  } else {
    container.innerHTML = renderDaybook(todayRes, { ghosts: true, dimPast: true });
  }

  renderWeeklyChart();
}

function emptyState(title, body) {
  return `<li class="empty">
    <img src="assets/empty-book-480.webp" width="240" height="240" alt="" loading="lazy" decoding="async">
    <p class="empty-title">${escapeHTML(title)}</p>
    <p class="empty-body">${escapeHTML(body)}</p>
  </li>`;
}

function renderWeeklyChart() {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  const counts = days.map(d => appData.reservations.filter(r => r.date === d && r.status !== 'cancelled').length);
  const max = Math.max(...counts, 1);
  const todayStr = formatDate(today);

  document.getElementById('weeklyChart').innerHTML = `<ol class="bars" aria-label="최근 7일 예약 건수">${counts.map((c, i) => {
    const height = Math.max((c / max) * 100, 3);
    const isToday = days[i] === todayStr;
    const date = parseDate(days[i]);
    return `<li class="bar${isToday ? ' is-today' : ''}">
      <span class="bar-count">${c}</span>
      <span class="bar-col"><span class="bar-fill" style="height:${height}%"></span></span>
      <span class="bar-label">${DAY_NAMES[date.getDay()]}<span class="visually-hidden"> ${date.getMonth() + 1}월 ${date.getDate()}일 ${c}건${isToday ? ' (오늘)' : ''}</span></span>
    </li>`;
  }).join('')}</ol>`;
}

// --- Status changes with undo ---
function changeReservationStatus(id, status) {
  const res = appData.reservations.find(r => r.id === id);
  if (!res || res.status === status) return;
  const previous = res.status;
  res.status = status;
  saveData(appData);
  freshStampId = prefersReducedMotion() ? null : id;
  rerenderCurrent();
  freshStampId = null;
  const verb = status === 'confirmed' ? '확정했습니다' : status === 'cancelled' ? '취소했습니다' : '대기로 돌렸습니다';
  showToast(`${res.time} ${res.customerName}님 예약을 ${verb}`, {
    actionLabel: '되돌리기',
    onAction: () => {
      res.status = previous;
      saveData(appData);
      rerenderCurrent();
      showToast('되돌렸습니다');
    },
  });
}

// --- Calendar ---
function renderCalendar() {
  const now = new Date();
  if (calendarYear === undefined) {
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth();
  }

  document.getElementById('calendarTitle').textContent = `${calendarYear}년 ${calendarMonth + 1}월`;

  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = formatDate(now);
  let html = '';

  const prevLast = new Date(calendarYear, calendarMonth, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    html += `<span class="day other" aria-hidden="true">${prevLast - i}</span>`;
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRes = appData.reservations.filter(r => r.date === dateStr && r.status !== 'cancelled');
    const pending = dayRes.filter(r => r.status === 'pending').length;
    const dow = (startDow + d - 1) % 7;
    const classes = ['day'];
    if (dateStr === today) classes.push('is-today');
    if (dateStr === selectedCalendarDate) classes.push('is-selected');
    if (dow === 0) classes.push('sun');
    if (dow === 6) classes.push('sat');
    const label = `${calendarMonth + 1}월 ${d}일 ${DAY_NAMES[dow]}요일, 예약 ${dayRes.length}건${pending ? `, 대기 ${pending}건` : ''}${dateStr === today ? ', 오늘' : ''}`;
    html += `<button type="button" class="${classes.join(' ')}" data-date="${dateStr}" aria-label="${label}" aria-pressed="${dateStr === selectedCalendarDate}">
      <span class="day-no">${d}</span>
      ${dayRes.length ? `<span class="day-count">${dayRes.length}건</span>` : ''}
      ${pending ? `<span class="day-pending" aria-hidden="true"></span>` : ''}
    </button>`;
  }

  const endDow = lastDay.getDay();
  for (let i = 1; i <= 6 - endDow; i++) {
    html += `<span class="day other" aria-hidden="true">${i}</span>`;
  }

  document.getElementById('calendarGrid').innerHTML = html;
}

function changeMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  selectedCalendarDate = dateStr;
  renderCalendar();
  showDateReservations(dateStr);
  const btn = document.querySelector(`.day[data-date="${dateStr}"]`);
  if (btn) btn.focus();
}

function showDateReservations(dateStr) {
  document.getElementById('selectedDateTitle').textContent = formatDateKR(dateStr) + ' 예약';
  const dayRes = appData.reservations.filter(r => r.date === dateStr);
  const container = document.getElementById('selectedDateReservations');
  container.innerHTML = dayRes.length === 0
    ? '<li class="empty-line">예약이 없습니다</li>'
    : renderDaybook(dayRes, { ghosts: false, dimPast: true });
}

// --- Reservation dialog ---
function setFieldError(id, message) {
  const el = document.getElementById(id + 'Error');
  const input = document.getElementById(id);
  if (el) { el.textContent = message || ''; el.hidden = !message; }
  if (input) {
    if (message) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id + 'Error'); }
    else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  }
}

function showNewReservationModal() {
  const dialog = document.getElementById('reservationModal');
  document.getElementById('resDate').value = selectedCalendarDate || formatDate(new Date());
  ['resTime', 'resCustomerName', 'resCustomerPhone', 'resService', 'resMemo'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('resStatus').value = 'confirmed';
  ['resCustomerName', 'resCustomerPhone', 'resDateTime', 'resService'].forEach(id => setFieldError(id, ''));
  document.getElementById('resConflict').hidden = true;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  document.getElementById('resCustomerName').focus();
}

function closeReservationModal() {
  const dialog = document.getElementById('reservationModal');
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function checkReservationConflict() {
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const el = document.getElementById('resConflict');
  if (!date || !time) { el.hidden = true; return; }
  const same = appData.reservations.filter(r => r.date === date && r.time === time && r.status !== 'cancelled');
  if (same.length) {
    el.textContent = `같은 시간에 이미 예약 ${same.length}건이 있습니다 (${same.map(r => r.customerName).join(', ')}). 그래도 저장할 수 있습니다.`;
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function saveReservation() {
  const name = document.getElementById('resCustomerName').value.trim();
  const phone = formatPhone(document.getElementById('resCustomerPhone').value.trim());
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const service = document.getElementById('resService').value;
  const status = document.getElementById('resStatus').value;
  const memo = document.getElementById('resMemo').value.trim();

  setFieldError('resCustomerName', name ? '' : '고객명을 입력해주세요.');
  setFieldError('resCustomerPhone', !phone ? '연락처를 입력해주세요.' : isValidPhone(phone) ? '' : '연락처 형식을 확인해주세요. 예: 010-1234-5678');
  setFieldError('resDateTime', date && time ? '' : '날짜와 시간을 모두 선택해주세요.');
  ['resDate', 'resTime'].forEach(id => {
    const el = document.getElementById(id);
    if (el.value) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
  });
  setFieldError('resService', service ? '' : '서비스를 선택해주세요.');
  const firstInvalid = document.querySelector('#reservationForm [aria-invalid="true"]');
  if (!name || !phone || !isValidPhone(phone) || !date || !time || !service) {
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const reservation = {
    id: generateId(),
    customerName: name,
    customerPhone: phone,
    date, time, service, status, memo,
    createdAt: new Date().toISOString(),
  };
  appData.reservations.push(reservation);
  upsertCustomer(name, phone, date, true);
  saveData(appData);
  closeReservationModal();
  freshStampId = prefersReducedMotion() ? null : reservation.id;
  rerenderCurrent();
  freshStampId = null;
  showToast(`${formatDateKR(date)} ${time} ${name}님 예약을 저장했습니다`, {
    actionLabel: '되돌리기',
    onAction: () => {
      appData.reservations = appData.reservations.filter(r => r.id !== reservation.id);
      saveData(appData);
      rerenderCurrent();
      showToast('예약 추가를 되돌렸습니다');
    },
  });
}

function upsertCustomer(name, phone, date, updateName) {
  const customer = appData.customers.find(c => c.phone === phone);
  if (customer) {
    customer.visitCount++;
    if (!customer.lastVisit || date > customer.lastVisit) customer.lastVisit = date;
    if (updateName) customer.name = name;
  } else {
    appData.customers.push({
      id: generateId(),
      name, phone,
      visitCount: 1,
      lastVisit: date,
      memo: '',
      createdAt: new Date().toISOString(),
    });
  }
}

// --- Customer Management ---
function renderCustomers() {
  const query = document.getElementById('customerSearch').value.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, '');
  let filtered = [...appData.customers];
  if (query) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(query)
      || c.phone.includes(query)
      || (queryDigits && c.phone.replace(/\D/g, '').includes(queryDigits)));
  }
  filtered.sort((a, b) => b.visitCount - a.visitCount);

  document.getElementById('customerCount').textContent = query ? `${filtered.length}명` : `전체 ${filtered.length}명`;
  const container = document.getElementById('customerList');
  if (filtered.length === 0) {
    container.innerHTML = query
      ? `<li class="empty-line">"${escapeHTML(query)}"에 맞는 고객이 없습니다</li>`
      : emptyState('고객이 없습니다', '예약을 추가하면 고객이 자동으로 등록됩니다.');
    return;
  }

  container.innerHTML = filtered.map(c => `
    <li>
      <button type="button" class="cust" data-customer="${escapeHTML(c.id)}">
        <span class="cust-mark" aria-hidden="true">${escapeHTML(c.name.charAt(0))}</span>
        <span class="cust-main">
          <span class="cust-name">${escapeHTML(c.name)}</span>
          <span class="cust-phone">${escapeHTML(c.phone)}</span>
        </span>
        <span class="cust-side">
          <span class="cust-visits">${c.visitCount}회 방문</span>
          <span class="cust-last">${c.lastVisit ? formatDateKR(c.lastVisit) : '-'}</span>
        </span>
      </button>
    </li>
  `).join('');
}

function filterCustomers() {
  renderCustomers();
}

function showCustomerDetail(customerId) {
  const customer = appData.customers.find(c => c.id === customerId);
  if (!customer) return;

  const panel = document.getElementById('customerDetailPanel');
  panel.hidden = false;
  document.querySelectorAll('.cust').forEach(b => b.classList.toggle('is-active', b.dataset.customer === customerId));

  document.getElementById('customerDetailName').textContent = customer.name;
  document.getElementById('customerDetailPhone').textContent = customer.phone;
  document.getElementById('customerDetailVisits').textContent = customer.visitCount + '회';
  document.getElementById('customerDetailLastVisit').textContent = customer.lastVisit ? formatDateKR(customer.lastVisit) : '-';

  const visits = appData.reservations
    .filter(r => r.customerPhone === customer.phone && r.status !== 'cancelled')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 10);

  document.getElementById('customerVisitHistory').innerHTML = visits.length === 0
    ? '<li class="empty-line">방문 이력이 없습니다</li>'
    : visits.map(v => `
      <li>
        <span class="h-service">${escapeHTML(v.service)}</span>
        <span class="h-time">${escapeHTML(v.time)}</span>
        <span class="h-date">${formatDateKR(v.date)}</span>
        <span class="h-status is-${v.status}">${STATUS[v.status].label}</span>
      </li>`).join('');

  if (window.matchMedia('(max-width: 1023px)').matches) {
    panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
  panel.focus({ preventScroll: true });
}

// --- Kakao Notification Preview ---
// Fills the templates from the next real upcoming booking; falls back to a sample.
function notificationSample(type) {
  const today = formatDate(new Date());
  const now = nowTimeStr();
  const upcoming = appData.reservations
    .filter(r => (r.date > today || (r.date === today && r.time >= now)))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const wanted = type === 'cancel' ? 'cancelled' : 'confirmed';
  const pick = upcoming.find(r => r.status === wanted) || upcoming.find(r => r.status !== 'cancelled');
  if (pick) return { r: pick, sample: false };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { r: { customerName: '김미영', date: formatDate(tomorrow), time: '14:00', service: '커트' }, sample: true };
}

function showNotificationType(type) {
  if (!['confirm', 'reminder', 'cancel'].includes(type)) type = 'confirm';
  currentNotifType = type;
  document.querySelectorAll('.notif-tab').forEach(t => {
    t.setAttribute('aria-selected', String(t.dataset.type === type));
    t.tabIndex = t.dataset.type === type ? 0 : -1;
  });

  document.getElementById('kakaoTime').textContent = nowTimeStr();

  const { r, sample } = notificationSample(type);
  const name = escapeHTML(r.customerName);
  const date = escapeHTML(formatDateLongKR(r.date));
  const time = escapeHTML(r.time);
  const service = escapeHTML(r.service);
  const shop = escapeHTML(defaultBusiness.name);

  document.getElementById('notifSource').innerHTML = sample
    ? '예정된 예약이 없어 샘플 내용으로 보여줍니다.'
    : `<strong>${escapeHTML(formatDateKR(r.date))} ${time} ${name}</strong>님 예약으로 채운 미리보기`;

  const templates = {
    confirm: `
      <p class="k-title">📅 예약 확인 안내</p>
      <div class="k-body">
        <p>안녕하세요, <strong>${name}</strong>님!</p>
        <p><strong>${shop}</strong> 예약이 확정되었습니다.</p>
        <div class="k-box">
          <p>📆 날짜: <strong>${date}</strong></p>
          <p>🕐 시간: <strong>${time}</strong></p>
          <p>💇 서비스: <strong>${service}</strong></p>
        </div>
        <p class="k-note">변경/취소는 1시간 전까지 가능합니다.</p>
      </div>
      <div class="k-actions">
        <span class="k-btn k-btn-main">예약 확인</span>
        <span class="k-btn">변경/취소</span>
      </div>`,
    reminder: `
      <p class="k-title">⏰ 예약 리마인더</p>
      <div class="k-body">
        <p>안녕하세요, <strong>${name}</strong>님!</p>
        <p>내일 예약이 있습니다. 잊지 마세요! 😊</p>
        <div class="k-box">
          <p>📆 날짜: <strong>${date}</strong></p>
          <p>🕐 시간: <strong>${time}</strong></p>
          <p>💇 서비스: <strong>${service}</strong></p>
          <p>📍 위치: <strong>${shop}</strong></p>
        </div>
        <p class="k-note">방문이 어려우시면 미리 연락 부탁드립니다.</p>
      </div>
      <div class="k-actions"><span class="k-btn k-btn-main">길찾기</span></div>`,
    cancel: `
      <p class="k-title">❌ 예약 취소 안내</p>
      <div class="k-body">
        <p>안녕하세요, <strong>${name}</strong>님.</p>
        <p>아래 예약이 취소되었습니다.</p>
        <div class="k-box k-box-void">
          <p>📆 날짜: <strong><s>${date}</s></strong></p>
          <p>🕐 시간: <strong><s>${time}</s></strong></p>
          <p>💇 서비스: <strong><s>${service}</s></strong></p>
        </div>
        <p class="k-note">다시 예약을 원하시면 아래 버튼을 눌러주세요.</p>
      </div>
      <div class="k-actions"><span class="k-btn k-btn-main">다시 예약하기</span></div>`,
  };

  document.getElementById('kakaoMessage').innerHTML = templates[type];
}

// --- Public Booking Page ---
function initBookingPage() {
  bookingStep = 1;
  selectedService = null;
  selectedTime = null;
  renderServiceList();

  const dateInput = document.getElementById('bookingDate');
  dateInput.value = '';
  dateInput.min = formatDate(new Date());
  document.getElementById('timeSlots').innerHTML = '';
  document.getElementById('timeHint').textContent = '날짜를 고르면 예약 가능한 시간이 표시됩니다.';

  document.getElementById('bookingName').value = '';
  document.getElementById('bookingPhone').value = '';
  document.getElementById('bookingMemo').value = '';
  setFieldError('bookingName', '');
  setFieldError('bookingPhone', '');
  document.getElementById('bookingComplete').hidden = true;
  updateBookingSteps();
}

function renderServiceList() {
  document.getElementById('serviceList').innerHTML = defaultServices.map(s => {
    const checked = selectedService?.id === s.id;
    return `<button type="button" role="radio" aria-checked="${checked}" class="service${checked ? ' is-selected' : ''}" data-service="${s.id}">
      <span class="service-name">${escapeHTML(s.name)}</span>
      <span class="service-dur">${s.duration}분 소요</span>
      <span class="service-price">₩${s.price.toLocaleString()}</span>
    </button>`;
  }).join('');
}

function selectService(serviceId) {
  selectedService = defaultServices.find(s => s.id === serviceId);
  renderServiceList();
  document.getElementById('step2Summary').textContent = `${selectedService.name} · ${selectedService.duration}분 · ₩${selectedService.price.toLocaleString()}`;
  setTimeout(() => {
    goBookingStep(2);
    document.getElementById('bookingDate').focus();
  }, prefersReducedMotion() ? 0 : 180);
}

function goBookingStep(step) {
  bookingStep = step;
  updateBookingSteps();
  const panel = document.getElementById('bookingStep' + step);
  const title = panel && panel.querySelector('.step-title');
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}

function updateBookingSteps() {
  [1, 2, 3].forEach(n => {
    document.getElementById('bookingStep' + n).hidden = bookingStep !== n;
    const dot = document.getElementById(`step${n}dot`);
    dot.classList.toggle('is-done', n < bookingStep);
    dot.classList.toggle('is-current', n === bookingStep);
    if (n === bookingStep) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
  });
}

function loadAvailableTimes() {
  const dateStr = document.getElementById('bookingDate').value;
  const container = document.getElementById('timeSlots');
  const hint = document.getElementById('timeHint');
  if (!dateStr) { container.innerHTML = ''; return; }
  const today = formatDate(new Date());
  if (dateStr < today) {
    container.innerHTML = '';
    hint.textContent = '지난 날짜는 예약할 수 없습니다. 오늘 이후 날짜를 골라주세요.';
    return;
  }

  const bookedTimes = appData.reservations.filter(r => r.date === dateStr && r.status !== 'cancelled').map(r => r.time);
  const now = nowTimeStr();
  let open = 0;
  const html = slotTimes().map(t => {
    const booked = bookedTimes.includes(t);
    const past = dateStr === today && t <= now;
    if (booked || past) {
      return `<button type="button" class="slot is-off" disabled aria-label="${t} ${booked ? '예약 마감' : '지난 시간'}">${t}</button>`;
    }
    open++;
    const sel = selectedTime === t;
    return `<button type="button" class="slot${sel ? ' is-selected' : ''}" data-time="${t}" aria-pressed="${sel}">${t}</button>`;
  }).join('');
  container.innerHTML = html;
  hint.textContent = open
    ? `${formatDateKR(dateStr)} · 예약 가능 ${open}개 시간`
    : `${formatDateKR(dateStr)}은 예약 가능한 시간이 없습니다. 다른 날짜를 골라주세요.`;
}

function selectTimeSlot(time) {
  selectedTime = time;
  loadAvailableTimes();
  setTimeout(() => {
    document.getElementById('bookingSummaryService').textContent = `서비스: ${selectedService.name} (₩${selectedService.price.toLocaleString()})`;
    document.getElementById('bookingSummaryDateTime').textContent = `일시: ${formatDateKR(document.getElementById('bookingDate').value)} ${selectedTime}`;
    goBookingStep(3);
  }, prefersReducedMotion() ? 0 : 180);
}

function submitBooking() {
  const name = document.getElementById('bookingName').value.trim();
  const phoneInput = document.getElementById('bookingPhone');
  const phone = formatPhone(phoneInput.value.trim());
  const memo = document.getElementById('bookingMemo').value.trim();
  const date = document.getElementById('bookingDate').value;

  setFieldError('bookingName', name ? '' : '이름을 입력해주세요.');
  setFieldError('bookingPhone', !phone ? '연락처를 입력해주세요.' : isValidPhone(phone) ? '' : '연락처 형식을 확인해주세요. 예: 010-1234-5678');
  if (!name || !isValidPhone(phone)) {
    document.getElementById(!name ? 'bookingName' : 'bookingPhone').focus();
    return;
  }

  // Guard against a slot that was taken since it was shown.
  const taken = appData.reservations.some(r => r.date === date && r.time === selectedTime && r.status !== 'cancelled');
  if (taken) {
    selectedTime = null;
    goBookingStep(2);
    loadAvailableTimes();
    document.getElementById('timeHint').textContent = '방금 그 시간이 마감되었습니다. 다른 시간을 골라주세요.';
    return;
  }

  appData.reservations.push({
    id: generateId(),
    customerName: name,
    customerPhone: phone,
    date,
    time: selectedTime,
    service: selectedService.name,
    status: 'pending',
    memo,
    createdAt: new Date().toISOString(),
  });
  upsertCustomer(name, phone, date, false);
  saveData(appData);

  document.getElementById('bookingStep3').hidden = true;
  const done = document.getElementById('bookingComplete');
  done.hidden = false;
  done.classList.toggle('animate', !prefersReducedMotion());
  document.getElementById('completeService').textContent = selectedService.name;
  document.getElementById('completeDateTime').textContent = `${formatDateKR(date)} ${selectedTime}`;
  document.getElementById('completeName').textContent = name;
  [1, 2, 3].forEach(n => { const d = document.getElementById(`step${n}dot`); d.classList.add('is-done'); d.classList.remove('is-current'); d.removeAttribute('aria-current'); });
  done.focus();
}

function resetBooking() {
  initBookingPage();
}

async function copyBookingLink() {
  const url = `${location.origin}${location.pathname}#/booking`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('예약 링크를 복사했습니다');
  } catch (e) {
    showToast(`복사하지 못했습니다. 주소: ${url}`);
  }
}

// --- Toast ---
let toastTimer = null;
function showToast(message, { actionLabel, onAction } = {}) {
  const toast = document.getElementById('toast');
  const action = document.getElementById('toastAction');
  document.getElementById('toastText').textContent = message;
  if (actionLabel && onAction) {
    action.textContent = actionLabel;
    action.hidden = false;
    action.onclick = () => { hideToast(); onAction(); };
  } else {
    action.hidden = true;
    action.onclick = null;
  }
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('is-on'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, actionLabel ? 6000 : 3200);
}

function hideToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 200);
}

function resetSampleData() {
  if (!window.confirm('샘플 데이터를 새로 만들까요? 지금까지 추가한 예약과 고객 정보가 지워집니다.')) return;
  appData = createSampleData();
  selectedCalendarDate = null;
  document.getElementById('customerDetailPanel').hidden = true;
  rerenderCurrent();
  if (currentPage === 'booking') initBookingPage();
  showToast('샘플 데이터를 새로 만들었습니다');
}

// --- Event wiring ---
function wireEvents() {
  window.addEventListener('hashchange', () => showPage(pageFromHash(), { focus: true }));

  document.getElementById('newReservationBtn').addEventListener('click', showNewReservationModal);
  document.getElementById('closeReservationModal').addEventListener('click', closeReservationModal);
  document.getElementById('reservationForm').addEventListener('submit', e => { e.preventDefault(); saveReservation(); });
  document.getElementById('reservationModal').addEventListener('click', e => {
    if (e.target.id === 'reservationModal') closeReservationModal();
  });
  ['resDate', 'resTime'].forEach(id => document.getElementById(id).addEventListener('change', checkReservationConflict));
  ['resCustomerPhone', 'bookingPhone'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => { if (el.value) el.value = formatPhone(el.value); });
  });

  document.getElementById('resetDataBtn').addEventListener('click', resetSampleData);

  // Reservation status buttons (dashboard + calendar lists)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="status"]');
    if (btn) changeReservationStatus(btn.dataset.id, btn.dataset.status);
  });

  document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
  document.getElementById('calendarGrid').addEventListener('click', e => {
    const day = e.target.closest('.day[data-date]');
    if (day) selectCalendarDate(day.dataset.date);
  });

  document.getElementById('customerSearch').addEventListener('input', filterCustomers);
  document.getElementById('customerList').addEventListener('click', e => {
    const b = e.target.closest('[data-customer]');
    if (b) showCustomerDetail(b.dataset.customer);
  });
  document.getElementById('closeCustomerDetail').addEventListener('click', () => {
    document.getElementById('customerDetailPanel').hidden = true;
    const active = document.querySelector('.cust.is-active');
    if (active) { active.classList.remove('is-active'); active.focus(); }
  });

  const tabs = [...document.querySelectorAll('.notif-tab')];
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showNotificationType(t.dataset.type));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      showNotificationType(next.dataset.type);
    });
  });

  document.getElementById('serviceList').addEventListener('click', e => {
    const b = e.target.closest('[data-service]');
    if (b) selectService(b.dataset.service);
  });
  document.getElementById('bookingDate').addEventListener('change', () => { selectedTime = null; loadAvailableTimes(); });
  document.getElementById('timeSlots').addEventListener('click', e => {
    const b = e.target.closest('[data-time]');
    if (b) selectTimeSlot(b.dataset.time);
  });
  document.querySelectorAll('[data-goto-step]').forEach(b => b.addEventListener('click', () => goBookingStep(Number(b.dataset.gotoStep))));
  document.getElementById('bookingStep3').addEventListener('submit', e => { e.preventDefault(); submitBooking(); });
  document.getElementById('resetBookingBtn').addEventListener('click', resetBooking);
  document.getElementById('copyBookingLink').addEventListener('click', copyBookingLink);

  document.querySelectorAll('.plan-cta').forEach(b => b.addEventListener('click', () => {
    showToast('데모 버전이라 요금제 가입은 아직 제공되지 않습니다');
  }));
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  showPage(pageFromHash());
});
