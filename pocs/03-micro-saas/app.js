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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  // Initialize with sample data
  const data = { reservations: [], customers: [], business: defaultBusiness };
  generateSampleData(data);
  saveData(data);
  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateSampleData(data) {
  const names = ['김미영', '이수진', '박지현', '최윤아', '정다은', '한소희', '오세진', '윤서연', '강지윤', '임하늘', '조민지', '신예린'];
  const phones = ['010-1234-5678', '010-2345-6789', '010-3456-7890', '010-4567-8901', '010-5678-9012', '010-6789-0123', '010-7890-1234', '010-8901-2345', '010-9012-3456', '010-0123-4567', '010-1111-2222', '010-3333-4444'];
  const services = ['커트', '펌', '염색', '클리닉', '드라이'];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
  const today = new Date();

  // Create customers
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

  // Create reservations for the past week and next week
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

function formatDate(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function formatDateKR(dateStr) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

// --- State ---
let appData = loadData();
let currentPage = 'dashboard';
let calendarYear, calendarMonth;
let selectedCalendarDate = null;
let bookingStep = 1;
let selectedService = null;
let selectedTime = null;

// --- Navigation ---
function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const titles = {
    dashboard: '대시보드',
    calendar: '예약 관리',
    customers: '고객 관리',
    notifications: '알림톡 미리보기',
    booking: '고객 예약 페이지',
    pricing: '요금제',
  };
  document.getElementById('pageTitle').textContent = titles[page] || '';
  toggleMobileNav(true);

  // Initialize page-specific content
  if (page === 'dashboard') renderDashboard();
  if (page === 'calendar') renderCalendar();
  if (page === 'customers') renderCustomers();
  if (page === 'notifications') showNotificationType('confirm');
  if (page === 'booking') initBookingPage();
}

function toggleMobileNav(forceClose) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileNavOverlay');
  if (forceClose === true || !sidebar.classList.contains('-translate-x-full')) {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  } else {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  }
}

// --- Dashboard ---
function renderDashboard() {
  const today = formatDate(new Date());
  const todayRes = appData.reservations.filter(r => r.date === today);

  document.getElementById('statTotal').textContent = todayRes.length;
  document.getElementById('statConfirmed').textContent = todayRes.filter(r => r.status === 'confirmed').length;
  document.getElementById('statPending').textContent = todayRes.filter(r => r.status === 'pending').length;
  document.getElementById('statCancelled').textContent = todayRes.filter(r => r.status === 'cancelled').length;
  document.getElementById('todayDate').textContent = formatDateKR(today);

  // Today's reservations list
  const sorted = [...todayRes].sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById('todayReservations');
  if (sorted.length === 0) {
    container.innerHTML = '<p class="p-6 text-sm text-gray-400 text-center">오늘 예약이 없습니다</p>';
  } else {
    container.innerHTML = sorted.map(r => renderReservationItem(r)).join('');
  }

  // Weekly chart
  renderWeeklyChart();
}

function renderReservationItem(r) {
  const statusMap = {
    confirmed: { label: '확정', class: 'status-confirmed' },
    pending: { label: '대기', class: 'status-pending' },
    cancelled: { label: '취소', class: 'status-cancelled' },
  };
  const s = statusMap[r.status];
  return `
    <div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
      <div class="text-sm font-mono font-bold text-gray-700 w-12">${r.time}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${r.customerName}</p>
        <p class="text-xs text-gray-500">${r.service} · ${r.customerPhone}</p>
      </div>
      <span class="text-xs px-2 py-1 rounded-full font-medium ${s.class}">${s.label}</span>
      ${r.status === 'pending' ? `
        <div class="flex gap-1">
          <button onclick="changeReservationStatus('${r.id}', 'confirmed')" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">확정</button>
          <button onclick="changeReservationStatus('${r.id}', 'cancelled')" class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">취소</button>
        </div>
      ` : ''}
    </div>`;
}

function changeReservationStatus(id, status) {
  const res = appData.reservations.find(r => r.id === id);
  if (res) {
    res.status = status;
    saveData(appData);
    if (currentPage === 'dashboard') renderDashboard();
    if (currentPage === 'calendar') {
      renderCalendar();
      if (selectedCalendarDate) showDateReservations(selectedCalendarDate);
    }
  }
}

function renderWeeklyChart() {
  const today = new Date();
  const days = [];
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  const counts = days.map(d => appData.reservations.filter(r => r.date === d && r.status !== 'cancelled').length);
  const max = Math.max(...counts, 1);

  const chartContainer = document.getElementById('weeklyChart');
  const labelsContainer = document.getElementById('weeklyLabels');

  chartContainer.innerHTML = counts.map((c, i) => {
    const height = Math.max((c / max) * 100, 4);
    const isToday = days[i] === formatDate(today);
    return `<div class="flex-1 flex flex-col items-center justify-end h-full">
      <span class="text-xs font-bold mb-1 ${isToday ? 'text-primary' : 'text-gray-500'}">${c}</span>
      <div class="chart-bar w-full ${isToday ? 'bg-primary' : 'bg-indigo-200'}" style="height:${height}%"></div>
    </div>`;
  }).join('');

  labelsContainer.innerHTML = days.map((d, i) => {
    const date = new Date(d);
    const isToday = d === formatDate(today);
    return `<div class="flex-1 text-center text-xs ${isToday ? 'text-primary font-bold' : 'text-gray-400'}">${dayLabels[date.getDay()]}</div>`;
  }).join('');
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
  const grid = document.getElementById('calendarGrid');
  let html = '';

  // Prev month padding
  const prevLast = new Date(calendarYear, calendarMonth, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month">${prevLast - i}</div>`;
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedCalendarDate;
    const dayReservations = appData.reservations.filter(r => r.date === dateStr && r.status !== 'cancelled');
    const dotHtml = dayReservations.length > 0 ? `<div class="calendar-dot"></div>` : '';
    const classes = ['calendar-day'];
    if (isToday) classes.push('today');
    if (isSelected) classes.push('selected');

    html += `<div class="${classes.join(' ')}" onclick="selectCalendarDate('${dateStr}')">${d}${dotHtml}</div>`;
  }

  // Next month padding
  const endDow = lastDay.getDay();
  for (let i = 1; i <= 6 - endDow; i++) {
    html += `<div class="calendar-day other-month">${i}</div>`;
  }

  grid.innerHTML = html;
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
}

function showDateReservations(dateStr) {
  document.getElementById('selectedDateTitle').textContent = formatDateKR(dateStr) + ' 예약';
  const dayRes = appData.reservations.filter(r => r.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  const container = document.getElementById('selectedDateReservations');

  if (dayRes.length === 0) {
    container.innerHTML = '<p class="p-4 text-sm text-gray-400 text-center">예약이 없습니다</p>';
  } else {
    container.innerHTML = dayRes.map(r => renderReservationItem(r)).join('');
  }
}

// --- Reservation Modal ---
function showNewReservationModal() {
  document.getElementById('reservationModal').classList.remove('hidden');
  document.getElementById('resDate').value = selectedCalendarDate || formatDate(new Date());
  document.getElementById('resTime').value = '';
  document.getElementById('resCustomerName').value = '';
  document.getElementById('resCustomerPhone').value = '';
  document.getElementById('resService').value = '';
  document.getElementById('resStatus').value = 'confirmed';
  document.getElementById('resMemo').value = '';
}

function closeReservationModal() {
  document.getElementById('reservationModal').classList.add('hidden');
}

function saveReservation() {
  const name = document.getElementById('resCustomerName').value.trim();
  const phone = document.getElementById('resCustomerPhone').value.trim();
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const service = document.getElementById('resService').value;
  const status = document.getElementById('resStatus').value;
  const memo = document.getElementById('resMemo').value.trim();

  if (!name || !phone || !date || !time || !service) {
    alert('필수 항목을 모두 입력해주세요.');
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

  // Update or create customer
  let customer = appData.customers.find(c => c.phone === phone);
  if (customer) {
    customer.visitCount++;
    customer.lastVisit = date;
    customer.name = name;
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

  saveData(appData);
  closeReservationModal();

  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'calendar') {
    renderCalendar();
    if (selectedCalendarDate) showDateReservations(selectedCalendarDate);
  }
  if (currentPage === 'customers') renderCustomers();
}

// --- Customer Management ---
function renderCustomers() {
  const query = document.getElementById('customerSearch').value.trim().toLowerCase();
  let filtered = appData.customers;
  if (query) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query));
  }
  filtered.sort((a, b) => b.visitCount - a.visitCount);

  const container = document.getElementById('customerList');
  if (filtered.length === 0) {
    container.innerHTML = '<p class="p-6 text-sm text-gray-400 text-center">고객이 없습니다</p>';
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer" onclick="showCustomerDetail('${c.id}')">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
        ${c.name.charAt(0)}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium">${c.name}</p>
        <p class="text-xs text-gray-500">${c.phone}</p>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-xs font-medium">${c.visitCount}회 방문</p>
        <p class="text-xs text-gray-400">${c.lastVisit ? formatDateKR(c.lastVisit) : '-'}</p>
      </div>
    </div>
  `).join('');
}

function filterCustomers() {
  renderCustomers();
}

function showCustomerDetail(customerId) {
  const customer = appData.customers.find(c => c.id === customerId);
  if (!customer) return;

  const panel = document.getElementById('customerDetailPanel');
  panel.classList.remove('hidden');

  document.getElementById('customerDetailName').textContent = customer.name;
  document.getElementById('customerDetailPhone').textContent = customer.phone;
  document.getElementById('customerDetailVisits').textContent = customer.visitCount + '회';
  document.getElementById('customerDetailLastVisit').textContent = customer.lastVisit ? formatDateKR(customer.lastVisit) : '-';

  // Visit history from reservations
  const visits = appData.reservations
    .filter(r => r.customerPhone === customer.phone && r.status !== 'cancelled')
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 10);

  const historyContainer = document.getElementById('customerVisitHistory');
  if (visits.length === 0) {
    historyContainer.innerHTML = '<p class="text-xs text-gray-400">방문 이력이 없습니다</p>';
  } else {
    historyContainer.innerHTML = visits.map(v => `
      <div class="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
        <div>
          <span class="font-medium">${v.service}</span>
          <span class="text-xs text-gray-400 ml-2">${v.time}</span>
        </div>
        <span class="text-xs text-gray-500">${formatDateKR(v.date)}</span>
      </div>
    `).join('');
  }

  // Scroll to detail on mobile
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Kakao Notification Preview ---
function showNotificationType(type) {
  document.querySelectorAll('.notif-tab').forEach(t => {
    t.classList.remove('active');
    t.classList.add('bg-gray-100', 'text-gray-600');
    t.classList.remove('bg-kakao', 'text-kakaoBrown');
  });
  event.target.classList.add('active');
  event.target.classList.remove('bg-gray-100', 'text-gray-600');

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('kakaoTime').textContent = timeStr;

  const templates = {
    confirm: `
      <p class="text-sm font-bold mb-2">📅 예약 확인 안내</p>
      <div class="text-sm space-y-1 text-gray-700">
        <p>안녕하세요, <strong>김미영</strong>님!</p>
        <p><strong>뷰티헤어살롱</strong> 예약이 확정되었습니다.</p>
        <div class="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
          <p>📆 날짜: <strong>2026년 4월 10일 (금)</strong></p>
          <p>🕐 시간: <strong>14:00</strong></p>
          <p>💇 서비스: <strong>커트</strong></p>
        </div>
        <p class="mt-2 text-xs text-gray-500">변경/취소는 1시간 전까지 가능합니다.</p>
      </div>
      <div class="mt-3 flex gap-2">
        <button class="flex-1 py-2 text-xs bg-kakao text-kakaoBrown rounded-lg font-bold">예약 확인</button>
        <button class="flex-1 py-2 text-xs border rounded-lg text-gray-500">변경/취소</button>
      </div>
    `,
    reminder: `
      <p class="text-sm font-bold mb-2">⏰ 예약 리마인더</p>
      <div class="text-sm space-y-1 text-gray-700">
        <p>안녕하세요, <strong>김미영</strong>님!</p>
        <p>내일 예약이 있습니다. 잊지 마세요! 😊</p>
        <div class="bg-gray-50 rounded-lg p-3 mt-2 space-y-1">
          <p>📆 날짜: <strong>2026년 4월 10일 (금)</strong></p>
          <p>🕐 시간: <strong>14:00</strong></p>
          <p>💇 서비스: <strong>커트</strong></p>
          <p>📍 위치: <strong>뷰티헤어살롱</strong></p>
        </div>
        <p class="mt-2 text-xs text-gray-500">방문이 어려우시면 미리 연락 부탁드립니다.</p>
      </div>
      <div class="mt-3">
        <button class="w-full py-2 text-xs bg-kakao text-kakaoBrown rounded-lg font-bold">길찾기</button>
      </div>
    `,
    cancel: `
      <p class="text-sm font-bold mb-2">❌ 예약 취소 안내</p>
      <div class="text-sm space-y-1 text-gray-700">
        <p>안녕하세요, <strong>김미영</strong>님.</p>
        <p>아래 예약이 취소되었습니다.</p>
        <div class="bg-red-50 rounded-lg p-3 mt-2 space-y-1">
          <p>📆 날짜: <strong><s>2026년 4월 10일 (금)</s></strong></p>
          <p>🕐 시간: <strong><s>14:00</s></strong></p>
          <p>💇 서비스: <strong><s>커트</s></strong></p>
        </div>
        <p class="mt-2 text-xs text-gray-500">다시 예약을 원하시면 아래 버튼을 눌러주세요.</p>
      </div>
      <div class="mt-3">
        <button class="w-full py-2 text-xs bg-kakao text-kakaoBrown rounded-lg font-bold">다시 예약하기</button>
      </div>
    `,
  };

  document.getElementById('kakaoMessage').innerHTML = templates[type];
}

// --- Public Booking Page ---
function initBookingPage() {
  bookingStep = 1;
  selectedService = null;
  selectedTime = null;
  updateBookingSteps();
  renderServiceList();

  // Set min date to today
  const dateInput = document.getElementById('bookingDate');
  dateInput.value = '';
  dateInput.min = formatDate(new Date());

  // Reset fields
  document.getElementById('bookingName').value = '';
  document.getElementById('bookingPhone').value = '';
  document.getElementById('bookingMemo').value = '';
  document.getElementById('bookingComplete').classList.add('hidden');
  document.getElementById('bookingStep1').classList.remove('hidden');
}

function renderServiceList() {
  const container = document.getElementById('serviceList');
  container.innerHTML = defaultServices.map(s => `
    <div class="service-card rounded-xl p-4 bg-white ${selectedService?.id === s.id ? 'selected' : ''}" 
         onclick="selectService('${s.id}')">
      <div class="flex justify-between items-center">
        <div>
          <p class="font-medium text-sm">${s.name}</p>
          <p class="text-xs text-gray-500">${s.duration}분 소요</p>
        </div>
        <p class="font-bold text-sm">₩${s.price.toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

function selectService(serviceId) {
  selectedService = defaultServices.find(s => s.id === serviceId);
  renderServiceList();
  setTimeout(() => goBookingStep(2), 200);
}

function goBookingStep(step) {
  bookingStep = step;
  updateBookingSteps();
}

function updateBookingSteps() {
  document.getElementById('bookingStep1').classList.toggle('hidden', bookingStep !== 1);
  document.getElementById('bookingStep2').classList.toggle('hidden', bookingStep !== 2);
  document.getElementById('bookingStep3').classList.toggle('hidden', bookingStep !== 3);

  ['step1dot', 'step2dot', 'step3dot'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (i < bookingStep) {
      el.classList.add('bg-primary', 'text-white');
      el.classList.remove('bg-gray-200', 'text-gray-500');
    } else {
      el.classList.remove('bg-primary', 'text-white');
      el.classList.add('bg-gray-200', 'text-gray-500');
    }
  });
}

function loadAvailableTimes() {
  const dateStr = document.getElementById('bookingDate').value;
  if (!dateStr) return;

  const container = document.getElementById('timeSlots');
  const existingRes = appData.reservations.filter(r => r.date === dateStr && r.status !== 'cancelled');
  const bookedTimes = existingRes.map(r => r.time);
  const { open, close } = defaultBusiness.operatingHours;
  const openHour = parseInt(open.split(':')[0]);
  const closeHour = parseInt(close.split(':')[0]);

  let html = '';
  for (let h = openHour; h < closeHour; h++) {
    for (const m of ['00', '30']) {
      const timeStr = `${String(h).padStart(2, '0')}:${m}`;
      const isBooked = bookedTimes.includes(timeStr);
      const isSelected = selectedTime === timeStr;

      if (isBooked) {
        html += `<div class="time-slot unavailable">${timeStr}</div>`;
      } else {
        html += `<div class="time-slot ${isSelected ? 'selected' : ''}" onclick="selectTimeSlot('${timeStr}')">${timeStr}</div>`;
      }
    }
  }
  container.innerHTML = html;
}

function selectTimeSlot(time) {
  selectedTime = time;
  loadAvailableTimes();
  setTimeout(() => {
    document.getElementById('bookingSummaryService').textContent = `서비스: ${selectedService.name} (₩${selectedService.price.toLocaleString()})`;
    document.getElementById('bookingSummaryDateTime').textContent = `일시: ${formatDateKR(document.getElementById('bookingDate').value)} ${selectedTime}`;
    goBookingStep(3);
  }, 200);
}

function submitBooking() {
  const name = document.getElementById('bookingName').value.trim();
  const phone = document.getElementById('bookingPhone').value.trim();
  const memo = document.getElementById('bookingMemo').value.trim();
  const date = document.getElementById('bookingDate').value;

  if (!name || !phone) {
    alert('이름과 연락처를 입력해주세요.');
    return;
  }

  const reservation = {
    id: generateId(),
    customerName: name,
    customerPhone: phone,
    date,
    time: selectedTime,
    service: selectedService.name,
    status: 'pending',
    memo,
    createdAt: new Date().toISOString(),
  };
  appData.reservations.push(reservation);

  // Update or create customer
  let customer = appData.customers.find(c => c.phone === phone);
  if (customer) {
    customer.visitCount++;
    customer.lastVisit = date;
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

  saveData(appData);

  // Show completion
  document.getElementById('bookingStep3').classList.add('hidden');
  document.getElementById('bookingComplete').classList.remove('hidden');
  document.getElementById('completeService').textContent = `서비스: ${selectedService.name}`;
  document.getElementById('completeDateTime').textContent = `일시: ${formatDateKR(date)} ${selectedTime}`;
  document.getElementById('completeName').textContent = `예약자: ${name}`;
}

function resetBooking() {
  initBookingPage();
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  showPage('dashboard');
});
