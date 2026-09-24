// AI 콘텐츠 대행 서비스 — UI. Data and rules live in core.js.
import {
  CONTENT_TYPES, PLANS, ORDER_STATUSES, TOPIC_MAX,
  portfolioItems, demoOrders,
  escapeHtml, validateTopic, makeDraft,
  addToTray, removeFromTray, parseTray,
  parseOrders, seoulDate, allowance, createOrder, countByStatus, filterOrders, leadDays,
  filterPortfolio,
} from './core.js';

const KEYS = { tray: 'aica.tray.v1', orders: 'aica.orders.v1', plan: 'aica.plan.v1' };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ------------------------------------------------------------
// Storage (fails soft: private mode or a full quota keeps the page usable)
// ------------------------------------------------------------

let storageWarned = false;
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      if (!storageWarned) {
        storageWarned = true;
        showToast('브라우저 저장이 막혀 있어 새로고침하면 보관 내용이 사라집니다', 'warning');
      }
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* nothing stored */ }
  },
};

const state = {
  contentType: 'blog',
  generating: false,
  current: null,        // the draft shown on the proof sheet
  revision: 0,          // 1차, 2차 … 시안 for the current topic
  tray: parseTray(store.get(KEYS.tray) ?? '[]'),
  orders: parseOrders(store.get(KEYS.orders)) ?? structuredClone(demoOrders),
  plan: PLANS[store.get(KEYS.plan)] ? store.get(KEYS.plan) : null,
  portfolioFilter: 'all',
  orderFilter: 'all',
  orderQuery: '',
};

const saveTray = () => store.set(KEYS.tray, JSON.stringify(state.tray));
const saveOrders = () => store.set(KEYS.orders, JSON.stringify(state.orders));

// ------------------------------------------------------------
// Navigation
// ------------------------------------------------------------

function initNavigation() {
  const navbar = $('#navbar');
  const menuBtn = $('#mobile-menu-btn');
  const menu = $('#mobile-menu');

  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  };

  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  $$('.nav-link', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Footer service links pre-select the matching content type.
  $$('[data-type-link]').forEach((link) => link.addEventListener('click', () => selectType(link.dataset.typeLink)));
}

// ------------------------------------------------------------
// Generator
// ------------------------------------------------------------

function selectType(type) {
  const radio = $(`input[name="content-type"][value="${type}"]`);
  if (radio) {
    radio.checked = true;
    setType(type);
  }
}

function setType(type) {
  state.contentType = type;
  $('#topic-input').placeholder = CONTENT_TYPES[type].placeholder;
}

function setError(message) {
  const error = $('#topic-error');
  const input = $('#topic-input');
  error.textContent = message || '';
  error.hidden = !message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function initGenerator() {
  const form = $('#generator-form');
  const input = $('#topic-input');
  const count = $('#topic-count');

  $$('input[name="content-type"]').forEach((radio) => {
    radio.addEventListener('change', () => radio.checked && setType(radio.value));
  });

  input.addEventListener('input', () => {
    count.textContent = `${input.value.length} / ${TOPIC_MAX}`;
    count.classList.toggle('is-near', input.value.length >= TOPIC_MAX - 20);
    if (input.getAttribute('aria-invalid') === 'true') setError('');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generate();
  });

  const result = $('#generation-result');
  result.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'copy') copyCurrent();
    if (action === 'again') generate({ again: true });
    if (action === 'order') orderCurrent();
  });

  $('#tray-list').addEventListener('click', (e) => {
    const item = e.target.closest('[data-id]');
    if (!item) return;
    const draft = state.tray.find((d) => d.id === item.dataset.id);
    if (!draft) return;
    if (e.target.closest('[data-action="delete"]')) {
      state.tray = removeFromTray(state.tray, draft.id);
      saveTray();
      renderTray();
      if (state.current?.id === draft.id) renderEmptyProof();
      showToast('시안을 보관함에서 지웠습니다');
    } else if (e.target.closest('[data-action="open"]')) {
      state.current = draft;
      state.revision = 1;
      selectType(draft.type);
      input.value = draft.topic;
      input.dispatchEvent(new Event('input'));
      renderProof(draft, { animate: false });
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  });

  $('#tray-clear').addEventListener('click', () => {
    state.tray = [];
    saveTray();
    renderTray();
    renderEmptyProof();
    showToast('보관함을 비웠습니다');
  });

  setType(state.contentType);
  renderTray();
}

async function generate({ again = false } = {}) {
  if (state.generating) return;
  const input = $('#topic-input');
  const button = $('#generate-btn');
  const result = $('#generation-result');

  let topic;
  if (again && state.current) {
    topic = state.current.topic;
  } else {
    const checked = validateTopic(input.value);
    if (!checked.ok) {
      setError(checked.error);
      input.focus();
      return;
    }
    setError('');
    topic = checked.topic;
  }

  const type = again && state.current ? state.current.type : state.contentType;
  const avoid = again && state.current ? state.current.templateIndex : -1;
  state.revision = again ? state.revision + 1 : 1;

  state.generating = true;
  button.disabled = true;
  button.textContent = '시안 뽑는 중…';
  result.setAttribute('aria-busy', 'true');
  result.innerHTML = `
    <div class="proof__loading">
      <span class="press" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <p>AI가 콘텐츠를 생성하고 있습니다...</p>
    </div>`;

  if (window.innerWidth < 960) {
    result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  await sleep(reduceMotion.matches ? 400 : 1300 + Math.random() * 700);

  const draft = makeDraft(type, topic, { avoid });
  state.current = draft;
  state.tray = addToTray(state.tray, draft);
  saveTray();
  renderTray();
  renderProof(draft, { animate: !reduceMotion.matches });

  result.setAttribute('aria-busy', 'false');
  button.disabled = false;
  button.textContent = '콘텐츠 생성하기';
  state.generating = false;
}

function proofLine(line, i) {
  const text = escapeHtml(line);
  const delay = `style="--i:${Math.min(i, 28)}"`;
  if (!line.trim()) return `<p class="proof__gap" ${delay} aria-hidden="true"></p>`;
  if (/^(■|【|━|✅ 결론|📌)/.test(line.trim())) return `<p class="proof__line proof__line--head" ${delay}>${text}</p>`;
  return `<p class="proof__line" ${delay}>${text}</p>`;
}

function renderProof(draft, { animate }) {
  const result = $('#generation-result');
  const type = CONTENT_TYPES[draft.type];
  const time = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(draft.createdAt));
  const ordered = state.orders.find((o) => o.id === draft.orderId);

  result.className = `sheet proof proof--${draft.type}${animate ? ' is-printing' : ''}`;
  result.innerHTML = `
    <header class="proof__head">
      <span class="type-tag type-tag--${draft.type}">${type.label}</span>
      <span class="proof__time">${escapeHtml(time)}</span>
      <span class="stamp proof__stamp">${state.revision}차 시안</span>
    </header>
    <h3 class="proof__title" id="generated-title">${escapeHtml(draft.title)}</h3>
    <div class="proof__body generated-content" id="generated-text">
      ${draft.body.split('\n').map(proofLine).join('')}
    </div>
    <div class="proof__actions">
      <button class="btn btn--ghost btn--sm" type="button" data-action="copy"><svg aria-hidden="true"><use href="#i-copy"/></svg>복사</button>
      <button class="btn btn--ghost btn--sm" type="button" data-action="again"><svg aria-hidden="true"><use href="#i-redo"/></svg>다른 시안</button>
      ${ordered
        ? `<a class="btn btn--ghost btn--sm" href="#dashboard">주문됨 · ${escapeHtml(ordered.id)}</a>`
        : `<button class="btn btn--action btn--sm" type="button" data-action="order"><svg aria-hidden="true"><use href="#i-send"/></svg>이 시안으로 주문하기</button>`}
    </div>
    <p class="proof__note">AI가 생성한 데모 콘텐츠입니다. 실제 서비스에서는 더 정교한 맞춤 콘텐츠를 제공합니다.</p>`;
}

function renderEmptyProof() {
  state.current = null;
  const result = $('#generation-result');
  result.className = 'sheet proof';
  result.innerHTML = `
    <div class="proof__empty">
      <img src="assets/empty-proof-480.webp" width="480" height="480" alt="" loading="lazy" decoding="async">
      <p>위에서 주제를 입력하고 콘텐츠를 생성해보세요</p>
    </div>`;
}

function renderTray() {
  const list = $('#tray-list');
  $('#tray-empty').hidden = state.tray.length > 0;
  $('#tray-clear').hidden = state.tray.length === 0;
  $('#ticket-meta').textContent = `시안 ${state.tray.length}건 보관 중`;
  list.innerHTML = state.tray.map((d) => `
    <li class="tray__item" data-id="${escapeHtml(d.id)}">
      <button class="tray__open" type="button" data-action="open">
        <span class="type-dot type-dot--${d.type}" aria-hidden="true"></span>
        <span class="tray__topic">${escapeHtml(d.topic)}</span>
        <span class="tray__meta">${CONTENT_TYPES[d.type].short}${d.orderId ? ' · 주문됨' : ''}</span>
      </button>
      <button class="icon-btn icon-btn--sm" type="button" data-action="delete" aria-label="${escapeHtml(d.topic)} 시안 지우기">
        <svg aria-hidden="true"><use href="#i-trash"/></svg>
      </button>
    </li>`).join('');
}

async function copyCurrent() {
  if (!state.current) return;
  const text = `${state.current.title}\n\n${state.current.body}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('콘텐츠가 복사되었습니다!', 'success');
  } catch {
    // Fallback for browsers that block the async clipboard API.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    showToast(ok ? '콘텐츠가 복사되었습니다!' : '복사에 실패했습니다. 본문을 직접 선택해 복사해주세요', ok ? 'success' : 'error');
  }
}

function orderCurrent() {
  const draft = state.current;
  if (!draft || draft.orderId) return;
  const today = seoulDate();
  const quota = allowance(state.orders, state.plan, today);
  if (!quota.canOrder) {
    showToast(`이번 달 ${quota.plan.name} 한도(${quota.limit}건)를 모두 썼습니다. 요금제를 올려 주세요`, 'error');
    return;
  }
  const order = createOrder(state.orders, draft, today);
  state.orders = [order, ...state.orders];
  saveOrders();
  draft.orderId = order.id;
  state.tray = state.tray.map((d) => (d.id === draft.id ? { ...d, orderId: order.id } : d));
  saveTray();
  renderTray();
  renderProof(draft, { animate: false });
  renderDashboard();
  showToast(`${order.id} 주문이 접수되었습니다 (대기중)`, 'success');
}

// ------------------------------------------------------------
// Portfolio
// ------------------------------------------------------------

function initPortfolio() {
  $$('.portfolio-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.portfolioFilter = btn.dataset.filter;
      $$('.portfolio-filter-btn').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderPortfolio();
    });
  });
  renderPortfolio();
}

const MINI_LAYOUTS = {
  blog: '<i class="mini__h"></i><i class="mini__l"></i><i class="mini__l"></i><i class="mini__l mini__l--s"></i><i class="mini__l"></i><i class="mini__l mini__l--s"></i>',
  product: '<i class="mini__img"></i><i class="mini__h mini__h--s"></i><i class="mini__l mini__l--s"></i><i class="mini__l mini__l--s"></i>',
  ad: '<i class="mini__big"></i><i class="mini__big mini__big--s"></i><i class="mini__cta"></i>',
};

function renderPortfolio() {
  const items = filterPortfolio(portfolioItems, state.portfolioFilter);
  $('#portfolio-grid').innerHTML = items.map((item) => `
    <li class="case case--${item.category}">
      <div class="mini" aria-hidden="true">${MINI_LAYOUTS[item.category]}</div>
      <div class="case__body">
        <p class="case__meta"><span class="type-tag type-tag--${item.category}">${CONTENT_TYPES[item.category].short}</span><span>${escapeHtml(item.industry)}</span></p>
        <h3 class="case__title">${escapeHtml(item.title)}</h3>
        <p class="case__text">${escapeHtml(item.preview)}</p>
      </div>
    </li>`).join('');
}

// ------------------------------------------------------------
// Pricing
// ------------------------------------------------------------

function initPricing() {
  $$('.plan-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.plan = btn.dataset.plan;
      store.set(KEYS.plan, state.plan);
      renderPlans();
      renderDashboard();
      const plan = PLANS[state.plan];
      const message = state.plan === 'enterprise'
        ? '엔터프라이즈 상담 요청이 기록되었습니다 (데모). 대시보드에 무제한으로 표시됩니다'
        : `${plan.name} 요금제를 선택했습니다 (데모). 대시보드에서 월 한도를 확인하세요`;
      showToast(message, 'success');
    });
  });
  renderPlans();
}

function renderPlans() {
  $$('.plan').forEach((card) => card.classList.toggle('is-selected', card.dataset.plan === state.plan));
  $$('.plan-btn').forEach((btn) => {
    const selected = btn.dataset.plan === state.plan;
    btn.setAttribute('aria-pressed', String(selected));
    btn.textContent = selected ? '선택됨' : (btn.dataset.plan === 'enterprise' ? '문의하기' : '시작하기');
  });
  const status = $('#plan-status');
  status.textContent = state.plan ? `현재 선택: ${PLANS[state.plan].name} (${PLANS[state.plan].price}) · 데모` : '';
}

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------

const STATUS_CLASS = { '완료': 'done', '진행중': 'doing', '대기중': 'waiting' };

function initDashboard() {
  $('#dashboard-stats').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    state.orderFilter = btn.dataset.filter;
    renderDashboard();
  });
  $('#order-search').addEventListener('input', (e) => {
    state.orderQuery = e.target.value;
    renderOrders();
  });
  $('#orders-reset').addEventListener('click', () => {
    state.orders = structuredClone(demoOrders);
    store.remove(KEYS.orders);
    state.tray = state.tray.map(({ orderId, ...d }) => d);
    saveTray();
    renderTray();
    if (state.current) {
      delete state.current.orderId;
      renderProof(state.current, { animate: false });
    }
    renderDashboard();
    showToast('데모 주문으로 되돌렸습니다');
  });
  renderDashboard();
}

function renderDashboard() {
  const counts = countByStatus(state.orders);
  const filters = [['all', '전체 주문', counts.all], ...ORDER_STATUSES.map((s) => [s, s === '진행중' ? '진행 중' : s === '대기중' ? '대기 중' : s, counts[s]])];
  $('#dashboard-stats').innerHTML = filters.map(([key, label, n]) => `
    <button class="tally dashboard-filter-btn${key !== 'all' ? ` tally--${STATUS_CLASS[key]}` : ''}" type="button" data-filter="${key}" aria-pressed="${state.orderFilter === key}">
      <span class="tally__n">${n}</span><span class="tally__label">${label}</span>
    </button>`).join('');

  const quota = allowance(state.orders, state.plan, seoulDate());
  const box = $('#allowance');
  if (!quota.plan) {
    box.innerHTML = '<p>요금제를 선택하면 이번 달 주문 한도가 여기에 표시됩니다. <a href="#pricing">요금제 보기</a></p>';
  } else if (quota.limit === Infinity) {
    box.innerHTML = `<p><strong>${quota.plan.name}</strong> · 이번 달 주문 ${quota.used}건 · 한도 없음</p>`;
  } else {
    const pct = Math.min(100, Math.round((quota.used / quota.limit) * 100));
    box.innerHTML = `
      <p><strong>${quota.plan.name}</strong> · 이번 달 주문 ${quota.used} / ${quota.limit}건 ${quota.canOrder ? `(남은 ${quota.remaining}건)` : '· 한도 소진'}</p>
      <meter min="0" max="${quota.limit}" value="${quota.used}" high="${Math.max(1, quota.limit - 2)}" optimum="0" aria-label="이번 달 사용량 ${pct}%"></meter>`;
  }
  $('#orders-reset').hidden = !store.get(KEYS.orders);
  renderOrders();
}

function renderOrders() {
  const orders = filterOrders(state.orders, { status: state.orderFilter, query: state.orderQuery });
  const tbody = $('#orders-tbody');
  $('#orders-summary').textContent = `${state.orders.length}건 중 ${orders.length}건 표시`;

  if (orders.length === 0) {
    const why = state.orderQuery.trim() ? `'${escapeHtml(state.orderQuery.trim())}'에 맞는 주문이 없습니다` : '해당 상태의 주문이 없습니다';
    tbody.innerHTML = `<tr><td colspan="5" class="orders__empty">${why}</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map((o) => {
    const days = leadDays(o);
    const step = ORDER_STATUSES.indexOf(o.status);
    return `
      <tr>
        <td class="orders__id">${escapeHtml(o.id)}</td>
        <td><span class="orders__topic">${escapeHtml(o.topic)}</span><span class="orders__type">${escapeHtml(o.type)}</span></td>
        <td>
          <span class="status status--${STATUS_CLASS[o.status]}">
            <span class="track" aria-hidden="true">${ORDER_STATUSES.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</span>
            ${o.status}
          </span>
        </td>
        <td class="orders__date" data-label="주문">${o.date}</td>
        <td class="orders__date" data-label="완료">${o.completedDate ? `${o.completedDate}<span class="orders__lead">${days}일 소요</span>` : '-'}</td>
      </tr>`;
  }).join('');
}

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showToast(message, type = 'info') {
  const region = $('#toast-region');
  const toast = document.createElement('p');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------

initNavigation();
initGenerator();
initPortfolio();
initPricing();
initDashboard();
