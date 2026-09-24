// Run with: node --test pocs/02-smart-store/tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    MOCK_PRODUCTS, escapeHtml, formatCurrency, productEconomics, calcProfit, validateCalcInput,
    screenProducts, nextStatus, canAdvance, canCancel, countByStatus, filterOrders,
    keywordReport, analyticsReport, resolveTab, generateTitle,
} from '../core.js';

test('productEconomics applies the Naver category fee', () => {
    // 텀블러: 15,900 retail, 4,000 cost, 생활 6.0%
    const r = productEconomics(4000, 15900, '생활');
    assert.equal(r.feeRate, 6.0);
    assert.equal(Math.round(r.fee), 954);
    assert.equal(Math.round(r.profit), 10946);
    assert.equal(r.margin.toFixed(1), '68.8');
});

test('calcProfit subtracts cost, fee and shipping; loss is flagged and profit share never negative', () => {
    const ok = calcProfit({ cost: 10000, price: 25000, shipping: 3000, quantity: 100, feeRate: 5.5 });
    assert.equal(Math.round(ok.unitProfit), 10625);
    assert.equal(Math.round(ok.monthlyProfit), 1062500);
    assert.equal(ok.isProfit, true);

    const loss = calcProfit({ cost: 9000, price: 10000, shipping: 3000, quantity: 0, feeRate: 7.0 });
    assert.equal(loss.isProfit, false);
    assert.equal(loss.quantity, 1);
    assert.equal(loss.shares.profit, 0);
});

test('validateCalcInput requires positive cost and price', () => {
    assert.deepEqual(validateCalcInput({ cost: 1, price: 1 }), {});
    assert.ok(validateCalcInput({ cost: 0, price: 100 }).cost);
    assert.ok(validateCalcInput({ cost: 100, price: -5 }).price);
});

test('screenProducts filters by supplier, category, query and min margin, and sorts', () => {
    const all = screenProducts(MOCK_PRODUCTS, {});
    assert.equal(all.length, MOCK_PRODUCTS.length);
    for (let i = 1; i < all.length; i++) assert.ok(all[i - 1].margin >= all[i].margin);

    const beauty = screenProducts(MOCK_PRODUCTS, { category: '뷰티', supplier: '도매매' });
    assert.ok(beauty.length > 0);
    assert.ok(beauty.every(p => p.category === '뷰티' && p.supplier === '도매매'));

    const q = screenProducts(MOCK_PRODUCTS, { query: '  텀블러 ' });
    assert.deepEqual(q.map(p => p.id), ['P006']);

    const strict = screenProducts(MOCK_PRODUCTS, { minMargin: 70 });
    assert.ok(strict.every(p => p.margin >= 70));

    const cheap = screenProducts(MOCK_PRODUCTS, { sort: 'cost' });
    assert.equal(cheap[0].id, 'P014');
});

test('order flow advances in order, cancel only before shipping', () => {
    assert.equal(nextStatus('신규주문'), '처리중');
    assert.equal(nextStatus('배송중'), '배송완료');
    assert.equal(nextStatus('배송완료'), '배송완료');
    assert.equal(nextStatus('취소'), '취소');
    assert.equal(canAdvance({ status: '취소' }), false);
    assert.equal(canAdvance({ status: '배송완료' }), false);
    assert.equal(canCancel({ status: '신규주문' }), true);
    assert.equal(canCancel({ status: '처리중' }), true);
    assert.equal(canCancel({ status: '배송중' }), false);
});

test('countByStatus and filterOrders', () => {
    const orders = [
        { id: 'ORD-1', status: '신규주문', productName: '텀블러', customerName: '김민수', address: '서울시 강남구', trackingNumber: '' },
        { id: 'ORD-2', status: '취소', productName: '청바지', customerName: '이지은', address: '부산시 해운대구', trackingNumber: '' },
        { id: 'ORD-3', status: '배송중', productName: '세럼', customerName: '박서준', address: '인천시 남동구', trackingNumber: '6123' },
    ];
    const c = countByStatus(orders);
    assert.equal(c['신규주문'], 1);
    assert.equal(c['취소'], 1);
    assert.equal(filterOrders(orders, { status: '취소' }).length, 1);
    assert.deepEqual(filterOrders(orders, { query: '6123' }).map(o => o.id), ['ORD-3']);
    assert.deepEqual(filterOrders(orders, { query: '이지은' }).map(o => o.id), ['ORD-2']);
});

test('escapeHtml neutralises markup and quotes', () => {
    assert.equal(escapeHtml(`<img src=x onerror="a('b')">`), '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;');
    assert.equal(formatCurrency(-1234.4), '-₩1,234');
});

test('keywordReport is deterministic per keyword and keeps known data', () => {
    const a = keywordReport('캠핑 의자');
    const b = keywordReport('  캠핑   의자 ');
    assert.deepEqual(a, b);
    assert.equal(a.related.length, 7);
    assert.equal(new Set(a.related.map(r => r.term)).size, 7);
    const known = keywordReport('텀블러');
    assert.equal(known.monthly, 89000);
    assert.equal(known.competition, '중간');
    assert.equal(known.stars, 2);
});

test('analyticsReport is stable for a given day and compares with the previous period', () => {
    const day = new Date(2026, 8, 24);
    const r1 = analyticsReport(7, day);
    const r2 = analyticsReport(7, day);
    assert.deepEqual(r1, r2);
    assert.equal(r1.days.length, 7);
    assert.equal(r1.days.at(-1).date, '9/24');
    assert.equal(r1.bestsellers.length, 5);
    const shareSum = r1.categoryShare.reduce((s, c) => s + c.share, 0);
    assert.ok(Math.abs(shareSum - 100) < 1e-6);
    // The 7-day window is the tail of the 14-day history.
    const r14 = analyticsReport(14, day);
    assert.deepEqual(r14.days.slice(7), r1.days);
});

test('resolveTab accepts hash, screen code and position', () => {
    assert.equal(resolveTab('#orders'), 'orders');
    assert.equal(resolveTab('3001'), 'calculator');
    assert.equal(resolveTab('6'), 'analytics');
    assert.equal(resolveTab('9999'), null);
    assert.equal(resolveTab(''), null);
});

test('generateTitle adds one plain search term and no promotional claims', () => {
    const promo = /\[|\]|무료배송|당일|특가|1위|추천|보장|사은품|한정/;
    for (const category of ['패션', '뷰티', '생활', '전자기기', '식품', '기타']) {
        for (const pick of [l => l[0], l => l.at(-1)]) {
            const title = generateTitle('  스테인리스   텀블러 500ml ', category, pick);
            assert.ok(title.startsWith('스테인리스 텀블러 500ml'));
            assert.doesNotMatch(title, promo);
            assert.ok([...title].length <= 50);
        }
    }
    assert.equal(generateTitle('여성 데일리룩 원피스', '패션'), '여성 데일리룩 원피스');
});
