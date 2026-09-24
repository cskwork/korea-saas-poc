// ============================================================
// 스마트셀러 - 네이버 스마트스토어 위탁판매 관리 도구 POC
// Rendering and interaction. Business rules live in core.js.
// ============================================================

import {
    CATEGORY_FEES, CATEGORY_LABELS, MOCK_PRODUCTS, MOCK_CUSTOMER_NAMES, MOCK_ADDRESSES, KEYWORD_DATA,
    ORDER_FLOW, TABS, escapeHtml as esc, formatCurrency, formatNumber, toInt, productEconomics, calcProfit,
    validateCalcInput, screenProducts, nextStatus, canAdvance, canCancel, countByStatus, filterOrders,
    keywordReport, analyticsReport, generateTitle, generateKeywords, generateHashtags, resolveTab,
} from './core.js';

const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ─── State ────────────────────────────────────────────────

const STATE_KEY = 'smartseller_state';
const PREFS_KEY = 'smartseller_prefs';
const THEME_KEY = 'smartseller_theme';

function readJson(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        if (saved) return { ...fallback, ...JSON.parse(saved) };
    } catch (e) {
        console.warn('State load error', e);
    }
    return { ...fallback };
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn('State save error', e);
        return false;
    }
}

const EMPTY_STATE = { orders: [], listings: [], savedKeywords: [], calcHistory: [] };
let state = readJson(STATE_KEY, EMPTY_STATE);
['orders', 'listings', 'savedKeywords', 'calcHistory'].forEach(k => { if (!Array.isArray(state[k])) state[k] = []; });

const DEFAULT_PREFS = { supplier: 'all', category: 'all', minMargin: 10, sort: 'margin', query: '', orderFilter: 'all', period: '30' };
const prefs = readJson(PREFS_KEY, DEFAULT_PREFS);

let storageWarned = false;
function saveState() {
    if (!writeJson(STATE_KEY, state) && !storageWarned) {
        storageWarned = true;
        showToast('브라우저 저장소를 쓸 수 없어 새로고침하면 변경 내용이 사라집니다');
    }
}
const savePrefs = () => writeJson(PREFS_KEY, prefs);

// ─── Utilities ────────────────────────────────────────────

let seq = 0;
function generateId() {
    seq += 1;
    return Date.now().toString(36) + seq.toString(36) + Math.random().toString(36).slice(2, 6);
}
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = arr => arr[Math.floor(Math.random() * arr.length)];
const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function signed(value, digits = 1, unit = '%') {
    const v = Number(value) || 0;
    const dir = v > 0.05 ? 'up' : v < -0.05 ? 'down' : 'flat';
    const word = dir === 'up' ? '상승 ' : dir === 'down' ? '하락 ' : '';
    return `<span class="chg ${dir}">${icon(dir, 'tri')}<span class="visually-hidden">${word}</span>${Math.abs(v).toFixed(digits)}${unit}</span>`;
}

function marginCell(margin) {
    const dir = margin > 0 ? 'up' : margin < 0 ? 'down' : 'flat';
    const width = Math.max(0, Math.min(100, margin * (100 / 70)));
    return `<span class="margin ${dir}"><span class="margin-num">${icon(dir, 'tri')}${margin.toFixed(1)}%</span><span class="meter" aria-hidden="true"><span style="width:${width.toFixed(1)}%"></span></span></span>`;
}

function productByName(name) {
    return MOCK_PRODUCTS.find(p => p.name === name || (name && name.includes(p.name)));
}

function thumb(product, size = 'sm') {
    if (!product) return `<span class="thumb thumb-${size} thumb-blank" aria-hidden="true"></span>`;
    return `<img class="thumb thumb-${size}" src="assets/products/${product.id}.webp" alt="${esc(product.alt)}" width="96" height="96" loading="lazy" decoding="async">`;
}

// Price tick: red when the changed value went up, blue when it went down.
function flash(el, dir = 'up') {
    if (!el || reduceMotion.matches) return;
    el.classList.remove('tick', 'tick-down');
    void el.offsetWidth;
    el.classList.add(dir === 'down' ? 'tick-down' : 'tick');
}

// ─── Toast with optional undo ─────────────────────────────

let toastTimer;
let toastHandler = null;
function showToast(msg, action) {
    const toast = $('toast');
    const btn = $('toastAction');
    $('toastMsg').textContent = msg;
    toastHandler = action ? action.run : null;
    btn.hidden = !action;
    if (action) btn.innerHTML = `${icon('undo')}${esc(action.label)}`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), action ? 6000 : 2800);
}
$('toastAction').addEventListener('click', () => {
    const run = toastHandler;
    toastHandler = null;
    $('toast').classList.remove('show');
    if (run) run();
});

// ─── Theme ────────────────────────────────────────────────

function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function syncThemeButton() {
    const dark = currentTheme() === 'dark';
    const btn = $('themeBtn');
    btn.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
    btn.innerHTML = icon(dark ? 'sun' : 'moon');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0d1119' : '#1b2536');
}
$('themeBtn').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* not persisted */ }
    syncThemeButton();
    if (activeTab === 'analytics') renderAnalytics();
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    syncThemeButton();
    if (activeTab === 'analytics') renderAnalytics();
});

// ─── Clock ────────────────────────────────────────────────

const clockFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
function tickClock() {
    const now = new Date();
    $('clock').textContent = clockFmt.format(now);
    $('clock').dateTime = now.toISOString();
}

// ─── Tabs (hash routed, ARIA tabs) ────────────────────────

let activeTab = 'sourcing';
const tabButtons = [...document.querySelectorAll('.screen-tab')];

function showTab(id, { focus = false, updateHash = true } = {}) {
    if (!TABS.some(t => t.id === id)) id = 'sourcing';
    activeTab = id;
    if (id !== 'sourcing' && modal.open) closeModal();
    tabButtons.forEach(btn => {
        const on = btn.dataset.tab === id;
        btn.setAttribute('aria-selected', String(on));
        btn.tabIndex = on ? 0 : -1;
        if (on && focus) btn.focus();
    });
    document.querySelectorAll('.screen').forEach(panel => { panel.hidden = panel.id !== 'tab-' + id; });
    if (updateHash && location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    const tab = TABS.find(t => t.id === id);
    document.title = `${tab.label} · 스마트셀러`;
    $('jumpInput').placeholder = tab.code;

    if (id === 'analytics') renderAnalytics();
    if (id === 'orders') renderOrders();
    if (id === 'listing') renderListings();
    if (id === 'keywords') renderSavedKeywords();
}

tabButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
    btn.addEventListener('keydown', e => {
        let next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabButtons.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + tabButtons.length) % tabButtons.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabButtons.length - 1;
        if (next !== null) {
            e.preventDefault();
            showTab(tabButtons[next].dataset.tab, { focus: true });
        }
    });
});

window.addEventListener('popstate', () => showTab(resolveTab(location.hash) || 'sourcing', { updateHash: false }));
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); showTab('sourcing'); });

$('jumpForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('jumpInput');
    const id = resolveTab(input.value);
    if (!id) {
        showToast(`화면번호 ${input.value || ''}을(를) 찾을 수 없습니다 (1001, 1002, 2001, 3001, 4001, 5001)`);
        input.select();
        return;
    }
    input.value = '';
    showTab(id, { focus: true });
});

// ─── Quote tape ───────────────────────────────────────────

function renderTape() {
    const items = screenProducts(MOCK_PRODUCTS, { sort: 'margin' }).map(p =>
        `<span class="tape-item"><span class="tape-name">${esc(p.name.split(' ').slice(0, 3).join(' '))}</span><span class="chg up">${icon('up', 'tri')}${p.margin.toFixed(1)}%</span><span class="tape-profit">${formatCurrency(p.profit)}</span></span>`
    ).join('');
    $('tapeTrack').innerHTML = items;
}

// ─── 1001 Product sourcing ────────────────────────────────

function listedNames() {
    return new Set(state.listings.map(l => l.originalName));
}

function renderSourcingGrid() {
    $('marginFilterValue').textContent = prefs.minMargin + '%';
    const rows = screenProducts(MOCK_PRODUCTS, prefs);
    $('productCount').textContent = rows.length === MOCK_PRODUCTS.length
        ? `${rows.length}개 상품`
        : `${MOCK_PRODUCTS.length}개 중 ${rows.length}개 상품`;

    const sortCol = { margin: 'col-margin', profit: 'col-profit', cost: 'col-cost', price: 'col-price' }[prefs.sort];
    document.querySelectorAll('.screener thead th').forEach(th => {
        if (sortCol && th.classList.contains(sortCol)) th.setAttribute('aria-sort', prefs.sort === 'cost' || prefs.sort === 'price' ? 'ascending' : 'descending');
        else th.removeAttribute('aria-sort');
    });

    const grid = $('sourcingGrid');
    if (rows.length === 0) {
        grid.innerHTML = `<tr class="empty-row"><td colspan="7"><div class="empty"><p>조건에 맞는 상품이 없습니다</p><p class="muted">최소 마진율을 낮추거나 검색어를 지워 보세요.</p><button type="button" class="btn btn-ghost btn-sm" data-action="reset-filters">조건 초기화</button></div></td></tr>`;
        return;
    }
    const listed = listedNames();
    grid.innerHTML = rows.map(p => `
        <tr data-id="${p.id}">
            <td class="col-name">
                <div class="prod">
                    ${thumb(p)}
                    <div class="prod-text">
                        <span class="prod-name">${esc(p.name)}</span>
                        <span class="prod-meta"><span class="code-tag">${p.id}</span>${esc(p.supplier)} · ${esc(CATEGORY_LABELS[p.category])}${listed.has(p.name) ? ' · <span class="listed-tag">등록됨</span>' : ''}</span>
                    </div>
                </div>
            </td>
            <td class="num col-cost" data-label="매입가">${formatCurrency(p.wholesalePrice)}</td>
            <td class="num col-price" data-label="판매가">${formatCurrency(p.retailPrice)}</td>
            <td class="num col-fee" data-label="수수료">${formatCurrency(p.fee)}<span class="sub">${p.feeRate.toFixed(1)}%</span></td>
            <td class="num col-profit" data-label="순수익"><span class="up-text">${formatCurrency(p.profit)}</span></td>
            <td class="num col-margin" data-label="마진율">${marginCell(p.margin)}</td>
            <td class="col-act">
                <div class="row-actions">
                    <button type="button" class="btn btn-line btn-sm" data-action="list" data-id="${p.id}">${icon('sparkles')}AI 등록</button>
                    <button type="button" class="btn btn-ghost btn-sm" data-action="detail" data-id="${p.id}" aria-label="${esc(p.name)} 상세">상세</button>
                </div>
            </td>
        </tr>`).join('');
    if (modal.open && modal.dataset.id) markSelectedRow(modal.dataset.id);
}

function syncFilterControls() {
    $('sourcingSupplier').value = prefs.supplier;
    $('sourcingCategory').value = prefs.category;
    $('marginFilter').value = prefs.minMargin;
    $('sourcingSort').value = prefs.sort;
    $('sourcingQuery').value = prefs.query;
}

function onFilterChange() {
    const before = screenProducts(MOCK_PRODUCTS, prefs).length;
    prefs.supplier = $('sourcingSupplier').value;
    prefs.category = $('sourcingCategory').value;
    prefs.minMargin = toInt($('marginFilter').value);
    prefs.sort = $('sourcingSort').value;
    prefs.query = $('sourcingQuery').value;
    savePrefs();
    renderSourcingGrid();
    const after = screenProducts(MOCK_PRODUCTS, prefs).length;
    if (after !== before) flash($('productCount'), after < before ? 'down' : 'up');
}

function resetFilters() {
    Object.assign(prefs, { supplier: 'all', category: 'all', minMargin: 0, sort: 'margin', query: '' });
    savePrefs();
    syncFilterControls();
    renderSourcingGrid();
}

['sourcingSupplier', 'sourcingCategory', 'sourcingSort'].forEach(id => $(id).addEventListener('change', onFilterChange));
$('marginFilter').addEventListener('input', onFilterChange);
$('sourcingQuery').addEventListener('input', onFilterChange);
$('sourcingFilters').addEventListener('submit', e => e.preventDefault());
$('resetFilters').addEventListener('click', resetFilters);

$('sourcingGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'list') selectForListing(btn.dataset.id);
    if (btn.dataset.action === 'detail') showProductDetail(btn.dataset.id, btn);
    if (btn.dataset.action === 'reset-filters') resetFilters();
});
// Clicking anywhere else on a row opens its quote (the 상세 button is the keyboard path).
$('sourcingGrid').addEventListener('click', e => {
    if (e.target.closest('button, a, input')) return;
    const row = e.target.closest('tr[data-id]');
    if (row) showProductDetail(row.dataset.id, row.querySelector('[data-action="detail"]'));
});

// Quote panel (product detail)
const modal = $('productModal');
let modalReturnFocus = null;

function showProductDetail(id, opener) {
    const p = MOCK_PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const { fee, profit, margin, feeRate } = productEconomics(p.wholesalePrice, p.retailPrice, p.category);
    modalReturnFocus = opener || document.activeElement;
    modal.dataset.id = p.id;
    $('modalTitle').textContent = p.name;
    $('modalContent').innerHTML = `
        <div class="quote-figure">
            <img src="assets/products/${p.id}.webp" alt="${esc(p.alt)}" width="192" height="192">
            <div class="quote-big">
                <span class="muted small">예상 순수익 (1개)</span>
                <strong class="up-text">${formatCurrency(profit)}</strong>
                ${marginCell(margin)}
            </div>
        </div>
        <dl class="ladder">
            <div><dt>도매처</dt><dd>${esc(p.supplier)}</dd></div>
            <div><dt>카테고리</dt><dd>${esc(CATEGORY_LABELS[p.category])}</dd></div>
            <div class="rung"><dt>권장 판매가</dt><dd>${formatCurrency(p.retailPrice)}</dd></div>
            <div class="rung minus"><dt>네이버 수수료 (${feeRate.toFixed(1)}%)</dt><dd>−${formatCurrency(fee)}</dd></div>
            <div class="rung minus"><dt>매입가</dt><dd>−${formatCurrency(p.wholesalePrice)}</dd></div>
            <div class="rung total"><dt>예상 순수익</dt><dd class="up-text">${formatCurrency(profit)}</dd></div>
        </dl>
        <p class="muted small">배송비는 포함되지 않았습니다. 배송비까지 넣어 보려면 수익 계산기로 보내세요.</p>
        <div class="quote-actions">
            <button type="button" class="btn btn-buy btn-block" data-action="list" data-id="${p.id}">${icon('sparkles')}AI 등록하기</button>
            <button type="button" class="btn btn-ghost btn-block" data-action="calc" data-id="${p.id}">${icon('calc')}수익 계산기로</button>
        </div>`;
    markSelectedRow(p.id);
    if (dockQuery.matches && activeTab === 'sourcing') {
        // Desktop: a docked, non-modal pane beside the screener, which stays usable.
        dock.classList.add('is-docked');
        if (!modal.open) modal.show();
        $('modalTitle').focus();
    } else if (!modal.open) {
        if (typeof modal.showModal === 'function') modal.showModal();
        else modal.setAttribute('open', '');
    }
}

const dock = $('screenerDock');
const dockQuery = window.matchMedia('(min-width: 1024px)');

function markSelectedRow(id) {
    document.querySelectorAll('#sourcingGrid tr[data-id]').forEach(tr => {
        const on = tr.dataset.id === id;
        tr.classList.toggle('is-selected', on);
        if (on) tr.setAttribute('aria-current', 'true'); else tr.removeAttribute('aria-current');
    });
}

function closeModal() {
    if (modal.open) modal.close();
}
modal.addEventListener('close', () => {
    dock.classList.remove('is-docked');
    markSelectedRow(null);
    if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
    modalReturnFocus = null;
});
// The docked (non-modal) panel does not close on Escape by itself. Escape inside a filled
// field is left to the field (it clears a search box).
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !modal.open || modal.matches(':modal')) return;
    if (e.target.matches('input, select, textarea') && e.target.value && !modal.contains(e.target)) return;
    e.preventDefault();
    closeModal();
});
dockQuery.addEventListener('change', closeModal);
$('closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if (e.target === modal) { closeModal(); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    modalReturnFocus = null;
    closeModal();
    if (btn.dataset.action === 'list') selectForListing(btn.dataset.id);
    if (btn.dataset.action === 'calc') sendToCalculator(btn.dataset.id);
});

function sendToCalculator(id) {
    const p = MOCK_PRODUCTS.find(x => x.id === id);
    if (!p) return;
    showTab('calculator');
    $('calcName').value = p.name;
    $('calcCategory').value = CATEGORY_FEES[p.category].toFixed(1);
    $('calcCost').value = p.wholesalePrice;
    $('calcPrice').value = p.retailPrice;
    renderCalcResult();
    $('calcShipping').focus();
    showToast('상품 가격을 불러왔습니다. 배송비와 판매수량을 확인하세요.');
}

// ─── 1002 AI listing creator ──────────────────────────────

const SOURCE_HINT = '<p class="hint">상품 소싱 탭에서 상품을 선택해주세요<br><span class="muted">또는 아래에서 직접 입력하세요</span></p>';

function selectForListing(id) {
    const p = MOCK_PRODUCTS.find(x => x.id === id);
    if (!p) return;
    closeModal();
    showTab('listing');
    $('listingOriginalName').value = p.name;
    $('listingCategory').value = p.category;
    $('listingCost').value = p.wholesalePrice;
    $('listingPrice').value = p.retailPrice;
    $('listingSourceProduct').innerHTML = `
        <div class="source-card">
            ${thumb(p, 'md')}
            <div>
                <p class="prod-name">${esc(p.name)}</p>
                <p class="prod-meta"><span class="code-tag">${p.id}</span>${esc(p.supplier)} · 매입 ${formatCurrency(p.wholesalePrice)}</p>
            </div>
        </div>`;
    clearFieldError('listingOriginalName', 'listingNameError');
    renderListingQuote();
    resetAiResult();
    $('generateListingBtn').focus();
    showToast('상품이 선택되었습니다. AI 생성 버튼을 눌러주세요!');
}

function renderListingQuote() {
    const cost = toInt($('listingCost').value);
    const price = toInt($('listingPrice').value);
    const category = $('listingCategory').value;
    const out = $('listingQuote');
    if (!(price > 0) || !(cost > 0)) { out.innerHTML = '<span class="muted">매입가와 판매가를 넣으면 수수료를 뺀 예상 순수익이 보입니다.</span>'; return; }
    const { profit, margin, feeRate } = productEconomics(cost, price, category);
    out.innerHTML = `<span>예상 순수익</span> <strong class="${profit >= 0 ? 'up-text' : 'down-text'}">${formatCurrency(profit)}</strong> ${marginCell(margin)} <span class="muted small">수수료 ${feeRate.toFixed(1)}% 반영</span>`;
}
['listingCost', 'listingPrice'].forEach(id => $(id).addEventListener('input', renderListingQuote));
$('listingCategory').addEventListener('change', renderListingQuote);
$('listingOriginalName').addEventListener('input', () => clearFieldError('listingOriginalName', 'listingNameError'));

function setFieldError(inputId, errorId, message) {
    const err = $(errorId);
    err.textContent = message;
    err.hidden = false;
    $(inputId).setAttribute('aria-invalid', 'true');
}
function clearFieldError(inputId, errorId) {
    $(errorId).hidden = true;
    $(inputId).removeAttribute('aria-invalid');
}

function resetAiResult() {
    $('aiResult').hidden = true;
    $('aiSkeleton').hidden = true;
    $('aiResultPlaceholder').hidden = false;
}

let generating = false;
$('listingForm').addEventListener('submit', e => {
    e.preventDefault();
    if (generating) return;
    const name = $('listingOriginalName').value.trim();
    const category = $('listingCategory').value;
    if (!name) {
        setFieldError('listingOriginalName', 'listingNameError', '상품명을 입력해주세요');
        $('listingOriginalName').focus();
        return;
    }

    generating = true;
    const btn = $('generateListingBtn');
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'AI 생성 중…';
    $('aiPane').setAttribute('aria-busy', 'true');
    $('aiResultPlaceholder').hidden = true;
    $('aiResult').hidden = true;
    $('aiSkeleton').hidden = false;

    // Simulated generation delay (demo: template based)
    setTimeout(() => {
        const title = generateTitle(name, category, randomChoice);
        $('aiTitle').textContent = title;
        $('aiTitleLen').textContent = `${[...title].length}자`;
        $('aiDescription').textContent = generateAIDescription(name, category);
        $('aiKeywords').innerHTML = generateKeywords(name, category).map(k => `<span class="chip">${esc(k)}</span>`).join('');
        $('aiHashtags').textContent = generateHashtags(name, category).join(' ');

        $('aiSkeleton').hidden = true;
        $('aiResult').hidden = false;
        $('aiPane').setAttribute('aria-busy', 'false');
        btn.disabled = false;
        btn.querySelector('.btn-label').textContent = 'AI 상품 설명 생성';
        generating = false;
        showToast('AI 상품 설명이 생성되었습니다!');
    }, 1200);
});

document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = $(btn.dataset.copy).textContent;
    try {
        await navigator.clipboard.writeText(text);
        showToast('클립보드에 복사했습니다');
    } catch (err) {
        showToast('복사하지 못했습니다. 텍스트를 직접 선택해 복사해 주세요.');
    }
}));

function generateAIDescription(name, category) {
    const templates = {
        '패션': `✨ ${name} ✨

🎯 이런 분께 추천드려요!
• 가볍게 입기 좋은 데일리 아이템을 찾는 분
• 여러 코디에 맞춰 입고 싶은 분

📋 상품 특징
• 소재: [원단 혼용률 확인 필요]
• 핏: [도매처 착용 정보 입력]
• 계절감: [착용 계절 입력]
• 세탁 방법: [케어 라벨 확인 필요]

📐 사이즈 가이드
[도매처 실측 사이즈 입력]

🚚 배송 안내
• 출고: [도매처 출고 기준 입력]
• 배송비: [배송비 정책 입력]

💬 교환/반품
• 수령 후 7일 이내 가능
• 단순 변심 시 반품 배송비 고객 부담`,
        '뷰티': `💎 ${name} 💎

✅ 주요 성분 & 효능
• 주요 성분: [전성분표 확인 필요]
• 효능 문구: [기능성 화장품 심사 여부 확인 필요]
• 피부 자극 테스트: [시험 성적서 확인 필요]

📌 추천 피부 타입
• [제조사 표기 기준으로 입력]

🧪 사용 방법
• [제조사 표기 사용 방법 입력]

📦 제품 정보
• 용량: [용량 입력]
• 사용 기한: [제조일·사용기한 입력]

🚚 출고: [도매처 출고 기준 입력]`,
        '생활': `🏠 ${name} 🏠

💡 이 제품이 특별한 이유!
• 일상에서 쓰기 편한 구성
• 소재 안전 인증: [KC 인증 여부 확인 필요]
• 관리 방법: [세척·관리 방법 입력]

📋 상세 스펙
• 소재: [소재 입력]
• 크기: [실측 크기 입력]
• 무게: [무게 입력]

🎯 이렇게 활용하세요!
• [사용 장소·용도 입력]

🚚 배송: [배송비·출고 기준 입력]`,
        '전자기기': `📱 ${name} 📱

🔋 핵심 스펙
• 규격: [모델명·규격 입력]
• 호환 기기: [호환 목록 확인 필요]
• 배터리: [용량·사용 시간 입력]
• 전파 인증: [KC 인증번호 확인 필요]

📦 패키지 구성
• [구성품 입력]

⚡ 주요 기능
• [주요 기능 입력]

🛡️ 품질 보증
• A/S: [도매처 A/S 정책 확인 필요]
• 불량 교환: [교환 기준 입력]

🚚 배송: [도매처 출고 기준 입력]`,
        '식품': `🍽️ ${name} 🍽️

🌿 이 제품의 특별함
• 원재료: [원재료명·원산지 입력]
• 간편하게 즐기는 한 끼·간식

📋 영양 정보 (1회 제공량 기준)
• [제조사 영양성분표 그대로 입력]

🍴 이렇게 드세요!
• 그대로 간식으로
• 알레르기 유발 성분: [표시사항 확인 필요]

📦 보관 방법
• [보관 방법 표시사항 입력]

🚚 배송: [도매처 출고 기준 입력]`
    };
    return templates[category] || templates['생활'];
}

$('saveListingBtn').addEventListener('click', () => {
    const listing = {
        id: generateId(),
        name: $('aiTitle').textContent,
        originalName: $('listingOriginalName').value.trim(),
        category: $('listingCategory').value,
        cost: toInt($('listingCost').value),
        price: toInt($('listingPrice').value),
        description: $('aiDescription').textContent,
        keywords: [...$('aiKeywords').children].map(c => c.textContent).join(', '),
        hashtags: $('aiHashtags').textContent,
        status: '등록완료',
        createdAt: new Date().toISOString()
    };

    state.listings.push(listing);
    saveState();
    renderListings();
    renderSourcingGrid();
    showToast('상품이 등록되었습니다!');

    resetAiResult();
    $('listingOriginalName').value = '';
    $('listingCost').value = '';
    $('listingPrice').value = '';
    $('listingSourceProduct').innerHTML = SOURCE_HINT;
    renderListingQuote();
    flash($('listingsTable').lastElementChild);
});

function renderListings() {
    const table = $('listingsTable');
    $('listingCount').textContent = state.listings.length ? `${state.listings.length}개` : '';
    if (state.listings.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="7"><div class="empty empty-art"><img src="assets/empty-box-320.webp" alt="" width="160" height="160"><p>등록된 상품이 없습니다</p><p class="muted">상품 소싱에서 AI 등록을 눌러 첫 상품을 등록해 보세요.</p></div></td></tr>';
        return;
    }
    table.innerHTML = state.listings.map(l => {
        const { margin } = productEconomics(l.cost, l.price, l.category);
        const p = productByName(l.originalName);
        return `
        <tr data-id="${esc(l.id)}">
            <td><div class="prod">${thumb(p)}<div class="prod-text"><span class="prod-name">${esc(l.name)}</span><span class="prod-meta">원본: ${esc(l.originalName)}</span></div></div></td>
            <td class="col-cat" data-label="카테고리">${esc(CATEGORY_LABELS[l.category] || l.category)}</td>
            <td class="num col-cost" data-label="매입가">${formatCurrency(l.cost)}</td>
            <td class="num" data-label="판매가">${formatCurrency(l.price)}</td>
            <td class="num col-margin" data-label="마진율">${l.price > 0 ? marginCell(margin) : '—'}</td>
            <td class="center col-status"><span class="status status-done">${esc(l.status)}</span></td>
            <td class="col-act"><button type="button" class="icon-btn" data-action="remove-listing" data-id="${esc(l.id)}" aria-label="${esc(l.name)} 등록 삭제">${icon('trash')}</button></td>
        </tr>`;
    }).join('');
}

$('listingsTable').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-listing"]');
    if (!btn) return;
    const idx = state.listings.findIndex(l => l.id === btn.dataset.id);
    if (idx < 0) return;
    const [removed] = state.listings.splice(idx, 1);
    saveState();
    renderListings();
    renderSourcingGrid();
    showToast('등록 상품을 삭제했습니다', {
        label: '되돌리기',
        run: () => {
            state.listings.splice(idx, 0, removed);
            saveState();
            renderListings();
            renderSourcingGrid();
        }
    });
});

// ─── 2001 Order management ────────────────────────────────

function addMockOrder() {
    const pool = state.listings.length > 0 ? state.listings : MOCK_PRODUCTS.slice(0, 5);
    const product = randomChoice(pool);
    const qty = randomInt(1, 3);
    const price = product.price || product.retailPrice;

    const order = {
        id: 'ORD-' + Date.now().toString().slice(-8),
        productName: product.originalName || product.name,
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
    flash(document.querySelector(`#orderList tr[data-id="${order.id}"]`));
    showToast('새 주문이 접수되었습니다!');
}
$('addMockOrderBtn').addEventListener('click', addMockOrder);

const orderDateFmt = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

function stageMeter(status) {
    if (status === '취소') return '<span class="stage-meter void" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    const step = ORDER_FLOW.indexOf(status) + 1;
    return `<span class="stage-meter" aria-hidden="true">${ORDER_FLOW.map((_, i) => `<i class="${i < step ? 'on' : ''}"></i>`).join('')}</span>`;
}

function renderOrders() {
    const counts = countByStatus(state.orders);
    $('orderAllCount').textContent = state.orders.length;
    $('orderNewCount').textContent = counts['신규주문'];
    $('orderProcessingCount').textContent = counts['처리중'];
    $('orderShippingCount').textContent = counts['배송중'];
    $('orderCompleteCount').textContent = counts['배송완료'];
    $('orderCancelCount').textContent = counts['취소'];
    const badge = $('tabNewCount');
    badge.hidden = counts['신규주문'] === 0;
    badge.textContent = counts['신규주문'];
    badge.setAttribute('aria-label', `신규주문 ${counts['신규주문']}건`);

    document.querySelectorAll('.tally-cell').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === prefs.orderFilter)));

    const query = $('orderQuery').value;
    const filtered = filterOrders(state.orders, { status: prefs.orderFilter, query });
    $('orderResultCount').textContent = `${filtered.length}건`;

    const list = $('orderList');
    if (filtered.length === 0) {
        const searching = query.trim() || prefs.orderFilter !== 'all';
        list.innerHTML = `<tr class="empty-row"><td colspan="5"><div class="empty empty-art"><img src="assets/empty-box-320.webp" alt="" width="160" height="160"><p>주문이 없습니다</p><p class="muted">${searching ? '다른 상태를 고르거나 검색어를 지워 보세요.' : '테스트 주문 추가로 주문 흐름을 확인해 보세요.'}</p></div></td></tr>`;
        return;
    }

    list.innerHTML = filtered.map(o => {
        const p = productByName(o.productName);
        const cancelled = o.status === '취소';
        return `
        <tr data-id="${esc(o.id)}" class="${cancelled ? 'is-void' : ''}">
            <td class="col-when"><span class="mono">${esc(o.id)}</span><span class="sub">${orderDateFmt.format(new Date(o.orderDate))}</span></td>
            <td class="col-item">
                <div class="prod">${thumb(p)}<div class="prod-text">
                    <span class="prod-name">${esc(o.productName)}</span>
                    <span class="prod-meta">${esc(o.customerName)} · ${esc(o.address)} · ${esc(o.quantity)}개</span>
                    ${o.trackingNumber ? `<span class="prod-meta">송장 <span class="mono">${esc(o.trackingNumber)}</span></span>` : ''}
                </div></div>
            </td>
            <td class="num col-amt" data-label="금액"><strong>${formatCurrency(o.totalPrice)}</strong></td>
            <td class="col-stage"><span class="stage-cell">${stageMeter(o.status)}<span class="status-text">${esc(o.status)}</span></span></td>
            <td class="col-act">
                <div class="row-actions">
                    ${canAdvance(o) ? `<button type="button" class="btn btn-primary btn-sm" data-action="advance" data-id="${esc(o.id)}">${esc(nextStatus(o.status))}으로</button>` : ''}
                    ${canCancel(o) ? `<button type="button" class="btn btn-sell btn-sm" data-action="cancel" data-id="${esc(o.id)}" aria-label="${esc(o.id)} 주문 취소">취소</button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
}

function restoreOrder(snapshot) {
    const order = state.orders.find(o => o.id === snapshot.id);
    if (!order) return;
    order.status = snapshot.status;
    order.trackingNumber = snapshot.trackingNumber;
    saveState();
    renderOrders();
    flash(document.querySelector(`#orderList tr[data-id="${snapshot.id}"]`), 'down');
    showToast(`${snapshot.id} 주문을 ${snapshot.status} 상태로 되돌렸습니다`);
}

$('orderList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const order = state.orders.find(o => o.id === btn.dataset.id);
    if (!order) return;
    const snapshot = { id: order.id, status: order.status, trackingNumber: order.trackingNumber };

    if (btn.dataset.action === 'advance' && canAdvance(order)) {
        order.status = nextStatus(order.status);
        if (order.status === '배송중' && !order.trackingNumber) {
            order.trackingNumber = '6' + Math.random().toString().slice(2, 14);
        }
        saveState();
        renderOrders();
        flash(document.querySelector(`#orderList tr[data-id="${order.id}"]`));
        showToast(`주문 상태: ${order.status}`, { label: '되돌리기', run: () => restoreOrder(snapshot) });
    }
    if (btn.dataset.action === 'cancel' && canCancel(order)) {
        order.status = '취소';
        saveState();
        renderOrders();
        showToast(`${order.id} 주문을 취소했습니다`, { label: '되돌리기', run: () => restoreOrder(snapshot) });
    }
});

document.querySelectorAll('.tally-cell').forEach(cell => cell.addEventListener('click', () => {
    prefs.orderFilter = cell.dataset.filter;
    savePrefs();
    renderOrders();
}));
$('orderQuery').addEventListener('input', renderOrders);

// ─── 3001 Profit calculator ───────────────────────────────

function readCalc() {
    return {
        feeRate: parseFloat($('calcCategory').value),
        cost: toInt($('calcCost').value),
        price: toInt($('calcPrice').value),
        shipping: Math.max(0, toInt($('calcShipping').value)),
        quantity: Math.max(1, toInt($('calcQuantity').value) || 1),
    };
}

function renderCalcResult({ showErrors = false } = {}) {
    const input = readCalc();
    const errors = validateCalcInput(input);
    [['calcCost', 'calcCostError', 'cost'], ['calcPrice', 'calcPriceError', 'price']].forEach(([inputId, errId, key]) => {
        if (errors[key] && showErrors) setFieldError(inputId, errId, errors[key]);
        else if (!errors[key]) clearFieldError(inputId, errId);
    });
    if (Object.keys(errors).length) {
        $('calcResult').innerHTML = '<div class="empty"><p>비용을 입력하고 계산 버튼을 눌러주세요</p><p class="muted">매입가와 판매가는 1원 이상이어야 합니다.</p></div>';
        return null;
    }
    const r = calcProfit(input);
    const dirText = r.isProfit ? 'up-text' : 'down-text';
    const pct = v => v.toFixed(1);
    $('calcResult').innerHTML = `
        <div class="headline ${r.isProfit ? 'is-up' : 'is-down'}">
            <span class="headline-label">개당 순수익</span>
            <strong class="headline-num ${dirText}">${formatCurrency(r.unitProfit)}</strong>
            <span class="headline-sub">${signed(r.marginRate)} <span class="muted">마진율</span>${r.isProfit ? '' : ' <span class="loss-tag">손실</span>'}</span>
        </div>
        <dl class="ladder">
            <div class="rung"><dt>판매가</dt><dd>${formatCurrency(input.price)}</dd></div>
            <div class="rung minus"><dt>매입가</dt><dd>−${formatCurrency(input.cost)}</dd></div>
            <div class="rung minus"><dt>네이버 수수료 (${input.feeRate.toFixed(1)}%)</dt><dd>−${formatCurrency(r.fee)}</dd></div>
            <div class="rung minus"><dt>배송비</dt><dd>−${formatCurrency(input.shipping)}</dd></div>
            <div class="rung total"><dt>개당 순수익</dt><dd class="${dirText}">${formatCurrency(r.unitProfit)}</dd></div>
        </dl>
        <div class="projection">
            <h4>월간 예상 <span class="muted">(${formatNumber(r.quantity)}개 판매 기준)</span></h4>
            <dl class="ladder compact">
                <div><dt>월 매출</dt><dd>${formatCurrency(r.monthlyRevenue)}</dd></div>
                <div class="minus"><dt>월 수수료 합계</dt><dd>−${formatCurrency(r.monthlyFee)}</dd></div>
                <div class="minus"><dt>월 배송비 합계</dt><dd>−${formatCurrency(r.monthlyShipping)}</dd></div>
                <div class="total"><dt>월 순수익</dt><dd class="${dirText}">${formatCurrency(r.monthlyProfit)}</dd></div>
            </dl>
        </div>
        <div class="structure">
            <span class="muted small">비용 구조 (판매가 대비)</span>
            <div class="stack" role="img" aria-label="매입 ${pct(r.shares.cost)}%, 수수료 ${pct(r.shares.fee)}%, 배송 ${pct(r.shares.shipping)}%, 수익 ${pct(r.shares.profit)}%">
                <span class="seg seg-cost" style="flex-basis:${r.shares.cost}%"></span>
                <span class="seg seg-fee" style="flex-basis:${r.shares.fee}%"></span>
                <span class="seg seg-ship" style="flex-basis:${r.shares.shipping}%"></span>
                <span class="seg seg-profit" style="flex-basis:${r.shares.profit}%"></span>
            </div>
            <ul class="stack-key">
                <li><i class="seg-cost"></i>매입 ${pct(r.shares.cost)}%</li>
                <li><i class="seg-fee"></i>수수료 ${pct(r.shares.fee)}%</li>
                <li><i class="seg-ship"></i>배송 ${pct(r.shares.shipping)}%</li>
                <li><i class="seg-profit"></i>수익 ${pct(r.shares.profit)}%</li>
            </ul>
        </div>`;
    return { input, r };
}

['calcCost', 'calcPrice', 'calcShipping', 'calcQuantity'].forEach(id => $(id).addEventListener('input', () => renderCalcResult()));
$('calcCategory').addEventListener('change', () => renderCalcResult());

$('calcForm').addEventListener('submit', e => {
    e.preventDefault();
    const result = renderCalcResult({ showErrors: true });
    if (!result) {
        showToast('매입가와 판매가를 입력해주세요');
        (readCalc().cost > 0 ? $('calcPrice') : $('calcCost')).focus();
        return;
    }
    const { input, r } = result;
    const categoryName = $('calcCategory').selectedOptions[0].text.split('(')[0].trim();
    state.calcHistory.unshift({
        name: $('calcName').value.trim() || categoryName + ' 상품',
        cost: input.cost, price: input.price, fee: r.fee.toFixed(0), profit: r.unitProfit.toFixed(0),
        margin: r.marginRate.toFixed(1)
    });
    if (state.calcHistory.length > 10) state.calcHistory = state.calcHistory.slice(0, 10);
    saveState();
    renderCalcHistory();
    flash($('calcHistoryTable').firstElementChild);
    showToast('계산 내역에 기록했습니다');
});

function renderCalcHistory() {
    const table = $('calcHistoryTable');
    $('clearCalcHistory').hidden = state.calcHistory.length === 0;
    if (state.calcHistory.length === 0) {
        table.innerHTML = '<tr class="empty-row"><td colspan="6"><div class="empty"><p>계산 내역이 없습니다</p><p class="muted">계산하기를 누르면 최근 10건까지 여기에 쌓입니다.</p></div></td></tr>';
        return;
    }
    table.innerHTML = state.calcHistory.map(h => {
        const up = parseFloat(h.profit) > 0;
        return `
        <tr>
            <td class="col-hname">${esc(h.name)}</td>
            <td class="num col-cost" data-label="매입가">${formatCurrency(h.cost)}</td>
            <td class="num" data-label="판매가">${formatCurrency(h.price)}</td>
            <td class="num col-fee" data-label="수수료">${formatCurrency(h.fee)}</td>
            <td class="num" data-label="순수익"><span class="${up ? 'up-text' : 'down-text'}">${formatCurrency(h.profit)}</span></td>
            <td class="num" data-label="마진율">${signed(parseFloat(h.margin))}</td>
        </tr>`;
    }).join('');
}

$('clearCalcHistory').addEventListener('click', () => {
    const previous = state.calcHistory;
    state.calcHistory = [];
    saveState();
    renderCalcHistory();
    showToast('계산 내역을 비웠습니다', { label: '되돌리기', run: () => { state.calcHistory = previous; saveState(); renderCalcHistory(); } });
});

// ─── 4001 Keyword research ────────────────────────────────

const COMP_CLASS = { '낮음': 'comp-low', '중간': 'comp-mid', '높음': 'comp-high' };
const TREND_ICON = { '상승': 'up', '하락': 'down', '유지': 'flat', '계절성': 'flat' };

function renderKeywordSuggest() {
    $('keywordSuggest').innerHTML = '<span class="muted small">예시</span>' +
        Object.keys(KEYWORD_DATA).map(k => `<button type="button" class="chip chip-btn" data-kw="${esc(k)}">${esc(k)}</button>`).join('');
}

function performKeywordSearch(value) {
    const input = $('keywordInput');
    if (typeof value === 'string') input.value = value;
    const kw = input.value.trim();
    if (!kw) {
        const err = $('keywordError');
        err.textContent = '키워드를 입력해주세요';
        err.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
    }
    $('keywordError').hidden = true;
    input.removeAttribute('aria-invalid');

    const data = keywordReport(kw);
    $('keywordTitle').textContent = `“${data.keyword}”`;
    $('keywordStats').innerHTML = `
        <div><dt>월간 검색량</dt><dd class="big">${formatNumber(data.monthly)}</dd></div>
        <div><dt>경쟁도</dt><dd><span class="comp ${COMP_CLASS[data.competition]}">${esc(data.competition)}</span></dd></div>
        <div><dt>트렌드</dt><dd><span class="chg ${TREND_ICON[data.trend] || 'flat'}">${icon(TREND_ICON[data.trend] || 'flat', 'tri')}${esc(data.trend)}</span></dd></div>
        <div><dt>추천 점수</dt><dd><span class="pips" role="img" aria-label="3점 만점에 ${data.stars}점">${[1, 2, 3].map(i => `<i class="${i <= data.stars ? 'on' : ''}"></i>`).join('')}</span></dd></div>`;

    const saved = new Set(state.savedKeywords);
    $('relatedKeywordsTable').innerHTML = data.related.map(r => `
        <tr>
            <td class="col-kw"><button type="button" class="link-btn kw-link" data-kw="${esc(r.term)}">${esc(r.term)}</button></td>
            <td class="num" data-label="월간 검색량">${formatNumber(r.monthly)}</td>
            <td class="center" data-label="경쟁도"><span class="comp ${COMP_CLASS[r.competition]}">${esc(r.competition)}</span></td>
            <td class="num" data-label="추천도"><span class="score ${r.score >= 70 ? 'up-text' : r.score < 40 ? 'down-text' : ''}">${r.score}점</span></td>
            <td class="center col-save"><button type="button" class="icon-btn star-btn" data-save="${esc(r.term)}" aria-pressed="${saved.has(r.term)}" aria-label="${esc(r.term)} 저장">${icon('star')}</button></td>
        </tr>`).join('');

    $('keywordResults').hidden = false;
    flash($('keywordStats'));
    showToast(`"${data.keyword}" 키워드 분석 완료!`);
}

$('keywordForm').addEventListener('submit', e => { e.preventDefault(); performKeywordSearch(); });
$('keywordInput').addEventListener('input', () => { $('keywordError').hidden = true; $('keywordInput').removeAttribute('aria-invalid'); });
$('keywordSuggest').addEventListener('click', e => {
    const btn = e.target.closest('[data-kw]');
    if (btn) performKeywordSearch(btn.dataset.kw);
});

$('relatedKeywordsTable').addEventListener('click', e => {
    const star = e.target.closest('[data-save]');
    if (star) {
        const kw = star.dataset.save;
        if (state.savedKeywords.includes(kw)) {
            state.savedKeywords = state.savedKeywords.filter(k => k !== kw);
            star.setAttribute('aria-pressed', 'false');
            showToast('키워드가 삭제되었습니다');
        } else {
            state.savedKeywords.push(kw);
            star.setAttribute('aria-pressed', 'true');
            showToast(`"${kw}" 키워드 저장 완료!`);
        }
        saveState();
        renderSavedKeywords();
        return;
    }
    const link = e.target.closest('[data-kw]');
    if (link) performKeywordSearch(link.dataset.kw);
});

function renderSavedKeywords() {
    const container = $('savedKeywordsList');
    if (state.savedKeywords.length === 0) {
        container.innerHTML = '<p class="muted">저장된 키워드가 없습니다. 연관 키워드 표에서 별을 눌러 저장하세요.</p>';
        return;
    }
    container.innerHTML = state.savedKeywords.map(kw => `
        <span class="chip chip-saved">
            <button type="button" class="chip-main" data-kw="${esc(kw)}">${icon('star', 'icon icon-xs')}${esc(kw)}</button>
            <button type="button" class="chip-x" data-remove="${esc(kw)}" aria-label="${esc(kw)} 삭제">${icon('x', 'icon icon-xs')}</button>
        </span>`).join('');
}

$('savedKeywordsList').addEventListener('click', e => {
    const rm = e.target.closest('[data-remove]');
    if (rm) {
        const kw = rm.dataset.remove;
        const idx = state.savedKeywords.indexOf(kw);
        state.savedKeywords = state.savedKeywords.filter(k => k !== kw);
        saveState();
        renderSavedKeywords();
        document.querySelectorAll('#relatedKeywordsTable [data-save]').forEach(b => { if (b.dataset.save === kw) b.setAttribute('aria-pressed', 'false'); });
        showToast('키워드가 삭제되었습니다', {
            label: '되돌리기',
            run: () => { state.savedKeywords.splice(idx, 0, kw); saveState(); renderSavedKeywords(); }
        });
        return;
    }
    const chip = e.target.closest('[data-kw]');
    if (chip) performKeywordSearch(chip.dataset.kw);
});

// ─── 5001 Sales analytics (SVG chart, no chart library) ───

function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderAnalytics() {
    const period = parseInt(prefs.period, 10) || 30;
    document.querySelectorAll('input[name="analyticsPeriod"]').forEach(r => { r.checked = r.value === String(period); });
    const report = analyticsReport(period);
    const t = report.totals;

    $('kpiRevenue').textContent = formatCurrency(t.revenue);
    $('kpiOrders').textContent = formatNumber(t.orders) + '건';
    $('kpiProfit').textContent = formatCurrency(t.profit);
    $('kpiMargin').textContent = t.margin.toFixed(1) + '%';
    $('kpiRevenueChange').innerHTML = signed(report.change.revenue);
    $('kpiOrdersChange').innerHTML = signed(report.change.orders);
    $('kpiProfitChange').innerHTML = signed(report.change.profit);
    $('kpiMarginChange').innerHTML = signed(report.change.margin, 1, '%p');

    drawSalesChart(report.days);

    const max = Math.max(...report.categoryShare.map(c => c.share), 1);
    $('categoryShare').innerHTML = report.categoryShare.map(c => `
        <div class="share">
            <span class="share-name">${esc(CATEGORY_LABELS[c.category])}</span>
            <span class="share-bar" aria-hidden="true"><span style="width:${(c.share / max * 100).toFixed(1)}%"></span></span>
            <span class="share-pct">${c.share.toFixed(1)}%</span>
            <span class="share-amt">${formatCurrency(c.revenue)}</span>
        </div>`).join('');

    $('bestsellerList').innerHTML = report.bestsellers.map((p, i) => `
        <li class="rank">
            <span class="rank-no">${i + 1}</span>
            ${thumb(p)}
            <span class="prod-text"><span class="prod-name">${esc(p.name)}</span><span class="prod-meta">${p.sales}건 판매</span></span>
            <strong class="rank-amt">${formatCurrency(p.revenue)}</strong>
        </li>`).join('');
}

function drawSalesChart(days) {
    const host = $('salesChart');
    const W = Math.max(300, Math.round(host.clientWidth || 800));
    const narrow = W < 560;
    const H = narrow ? 260 : 320;
    const pad = { l: narrow ? 38 : 52, r: 12, t: 12, b: 26 };
    const volH = narrow ? 56 : 72;
    const gap = 14;
    const priceH = H - pad.t - pad.b - volH - gap;
    const innerW = W - pad.l - pad.r;
    const n = days.length;
    const step = innerW / n;
    const x = i => pad.l + step * i + step / 2;

    const maxRev = Math.max(...days.map(d => d.revenue)) * 1.1;
    const y = v => pad.t + priceH - (v / maxRev) * priceH;
    const maxVol = Math.max(...days.map(d => d.orders));
    const volTop = pad.t + priceH + gap;
    const vy = v => volTop + volH - (v / maxVol) * volH;

    const up = cssVar('--up');
    const ink = cssVar('--ink');
    const rule = cssVar('--rule');
    const ink3 = cssVar('--ink-3');
    const vol = cssVar('--vol');

    const ticks = 4;
    let grid = '';
    for (let i = 0; i <= ticks; i++) {
        const v = (maxRev / ticks) * i;
        const yy = y(v).toFixed(1);
        grid += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${yy}" y2="${yy}" stroke="${rule}" stroke-width="1"/>`;
        grid += `<text x="${pad.l - 6}" y="${yy}" dy="0.32em" text-anchor="end" class="axis">${v === 0 ? '0' : (v / 10000).toFixed(0) + '만'}</text>`;
    }
    grid += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${volTop + volH}" y2="${volTop + volH}" stroke="${rule}"/>`;

    const labelEvery = Math.ceil(n / (narrow ? 5 : 10));
    const xLabels = days.map((d, i) => (i % labelEvery === 0 || i === n - 1) ? `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="axis">${d.date}</text>` : '').join('');

    const line = key => days.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join('');
    const area = `${line('revenue')}L${x(n - 1).toFixed(1)},${(pad.t + priceH).toFixed(1)}L${x(0).toFixed(1)},${(pad.t + priceH).toFixed(1)}Z`;
    const bw = Math.max(2, step * 0.62);
    const bars = days.map((d, i) => `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${vy(d.orders).toFixed(1)}" width="${bw.toFixed(1)}" height="${(volTop + volH - vy(d.orders)).toFixed(1)}" fill="${i === n - 1 ? up : vol}"/>`).join('');

    host.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="chartDesc" class="chart-svg">
            <desc id="chartDesc">최근 ${n}일 일별 매출, 순수익 선 그래프와 주문 수 막대 그래프. 같은 수치를 표로도 제공합니다.</desc>
            ${grid}
            <path d="${area}" fill="${ink}" opacity="0.06"/>
            <path d="${line('revenue')}" fill="none" stroke="${ink}" stroke-width="1.75" stroke-linejoin="round"/>
            <path d="${line('profit')}" fill="none" stroke="${up}" stroke-width="1.75" stroke-linejoin="round"/>
            ${bars}
            ${xLabels}
            <line class="cross" data-cross="x" y1="${pad.t}" y2="${volTop + volH}" stroke="${ink3}" stroke-dasharray="3 3" visibility="hidden"/>
            <circle class="cross" data-cross="rev" r="3.5" fill="${ink}" visibility="hidden"/>
            <circle class="cross" data-cross="profit" r="3.5" fill="${up}" visibility="hidden"/>
        </svg>
        <table class="visually-hidden"><caption>일별 매출 데이터</caption><thead><tr><th>날짜</th><th>매출</th><th>순수익</th><th>주문 수</th></tr></thead>
        <tbody>${days.map(d => `<tr><td>${d.date}</td><td>${formatCurrency(d.revenue)}</td><td>${formatCurrency(d.profit)}</td><td>${d.orders}</td></tr>`).join('')}</tbody></table>`;

    const readout = i => {
        const d = days[i];
        $('chartReadout').innerHTML = `<span class="mono">${d.date}</span> 매출 <strong>${formatCurrency(d.revenue)}</strong> 순수익 <strong class="up-text">${formatCurrency(d.profit)}</strong> 주문 <strong>${d.orders}건</strong>`;
    };
    readout(n - 1);

    const svg = host.querySelector('svg');
    const cross = key => svg.querySelector(`[data-cross="${key}"]`);
    const show = i => {
        const cx = x(i).toFixed(1);
        cross('x').setAttribute('x1', cx);
        cross('x').setAttribute('x2', cx);
        cross('rev').setAttribute('cx', cx);
        cross('rev').setAttribute('cy', y(days[i].revenue).toFixed(1));
        cross('profit').setAttribute('cx', cx);
        cross('profit').setAttribute('cy', y(days[i].profit).toFixed(1));
        svg.querySelectorAll('.cross').forEach(el => el.setAttribute('visibility', 'visible'));
        readout(i);
    };
    svg.addEventListener('pointermove', e => {
        const rect = svg.getBoundingClientRect();
        const px = (e.clientX - rect.left) * (W / rect.width);
        show(Math.min(n - 1, Math.max(0, Math.floor((px - pad.l) / step))));
    });
    svg.addEventListener('pointerleave', () => {
        svg.querySelectorAll('.cross').forEach(el => el.setAttribute('visibility', 'hidden'));
        readout(n - 1);
    });
}

document.querySelectorAll('input[name="analyticsPeriod"]').forEach(r => r.addEventListener('change', () => {
    prefs.period = r.value;
    savePrefs();
    renderAnalytics();
}));

let resizeTimer;
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (activeTab === 'analytics') renderAnalytics(); }, 150);
});

// ─── Demo reset ───────────────────────────────────────────

$('resetDemo').addEventListener('click', () => {
    if (!window.confirm('등록 상품, 주문, 계산 내역, 저장 키워드를 모두 지우고 처음 데모 상태로 되돌릴까요?')) return;
    state = { orders: [], listings: [], savedKeywords: [], calcHistory: [] };
    seedOrders();
    saveState();
    renderAll();
    showToast('데모 데이터를 초기화했습니다');
});

// ─── Initialization ───────────────────────────────────────

function seedOrders() {
    const statuses = ['신규주문', '처리중', '배송중', '배송완료'];
    for (let i = 0; i < 8; i++) {
        const product = randomChoice(MOCK_PRODUCTS);
        const qty = randomInt(1, 3);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - randomInt(0, 14));
        state.orders.push({
            id: 'ORD-' + (10000000 + i),
            productName: product.name,
            customerName: randomChoice(MOCK_CUSTOMER_NAMES),
            address: randomChoice(MOCK_ADDRESSES),
            quantity: qty,
            unitPrice: product.retailPrice,
            totalPrice: product.retailPrice * qty,
            status: statuses[Math.min(i, statuses.length - 1)],
            orderDate: orderDate.toISOString(),
            trackingNumber: i >= 2 ? '6' + Math.random().toString().slice(2, 14) : ''
        });
    }
}

function renderAll() {
    renderSourcingGrid();
    renderListings();
    renderOrders();
    renderCalcHistory();
    renderSavedKeywords();
    renderCalcResult();
    renderListingQuote();
    if (activeTab === 'analytics') renderAnalytics();
}

function init() {
    if (state.orders.length === 0) {
        seedOrders();
        saveState();
    }
    syncFilterControls();
    syncThemeButton();
    renderTape();
    renderKeywordSuggest();
    tickClock();
    setInterval(tickClock, 30000);
    renderAll();
    showTab(resolveTab(location.hash) || 'sourcing', { updateHash: false });
}

init();
