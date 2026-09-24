// Run with: node --test pocs/01-ai-content-agency/tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOPIC_MAX, TRAY_LIMIT, demoOrders, portfolioItems,
  escapeHtml, validateTopic, makeDraft, addToTray, removeFromTray, parseTray,
  parseOrders, seoulDate, nextOrderId, allowance, createOrder, countByStatus, filterOrders, leadDays,
  filterPortfolio,
} from '../core.js';

test('escapeHtml neutralises markup typed into the topic', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml("A&B's"), 'A&amp;B&#39;s');
});

test('validateTopic trims, collapses whitespace and enforces the length limit', () => {
  assert.deepEqual(validateTopic('   '), { ok: false, error: '주제를 입력해주세요' });
  assert.deepEqual(validateTopic('  무선   이어폰 '), { ok: true, topic: '무선 이어폰' });
  assert.equal(validateTopic('가'.repeat(TOPIC_MAX)).ok, true);
  assert.equal(validateTopic('가'.repeat(TOPIC_MAX + 1)).error, '200자 이내로 입력해주세요');
});

test('makeDraft fills every {{topic}} and "다른 시안" never repeats the previous template', () => {
  const first = makeDraft('blog', '디지털 마케팅', { pick: () => 0, now: new Date('2026-09-25T00:00:00Z') });
  assert.equal(first.templateIndex, 0);
  assert.ok(first.title.includes('디지털 마케팅'));
  assert.ok(!first.body.includes('{{topic}}'));
  const again = makeDraft('blog', '디지털 마케팅', { pick: () => 0, avoid: first.templateIndex });
  assert.equal(again.templateIndex, 1);
  assert.throws(() => makeDraft('video', 'x'), /Unknown content type/);
});

test('the proof tray keeps the newest drafts first, without duplicates, capped', () => {
  let tray = [];
  for (let i = 0; i < TRAY_LIMIT + 3; i += 1) {
    tray = addToTray(tray, makeDraft('ad', `주제 ${i}`, { now: new Date(Date.UTC(2026, 8, 25, 0, i)) }));
  }
  assert.equal(tray.length, TRAY_LIMIT);
  assert.equal(tray[0].topic, `주제 ${TRAY_LIMIT + 2}`);
  assert.equal(addToTray(tray, tray[3]).length, TRAY_LIMIT);
  assert.equal(removeFromTray(tray, tray[0].id).length, TRAY_LIMIT - 1);
});

test('parseTray ignores corrupt or foreign storage', () => {
  assert.deepEqual(parseTray('not json'), []);
  assert.deepEqual(parseTray('{"a":1}'), []);
  const good = makeDraft('product', '텀블러');
  assert.deepEqual(parseTray(JSON.stringify([good, { id: 1 }])), [good]);
});

test('parseOrders falls back to demo data (null) on anything invalid', () => {
  assert.equal(parseOrders(null), null);
  assert.equal(parseOrders('oops'), null);
  assert.equal(parseOrders(JSON.stringify([{ id: 'x' }])), null);
  assert.deepEqual(parseOrders(JSON.stringify(demoOrders)), demoOrders);
});

test('seoulDate uses the Asia/Seoul calendar day', () => {
  assert.equal(seoulDate(new Date('2026-09-24T15:30:00Z')), '2026-09-25');
  assert.equal(seoulDate(new Date('2026-09-24T14:59:00Z')), '2026-09-24');
});

test('createOrder numbers orders per year and starts them as 대기중', () => {
  assert.equal(nextOrderId(demoOrders, '2026'), 'ORD-2026-008');
  assert.equal(nextOrderId(demoOrders, '2027'), 'ORD-2027-001');
  const order = createOrder(demoOrders, makeDraft('blog', '신제품 런칭'), '2026-09-25');
  assert.deepEqual(order, {
    id: 'ORD-2026-008', type: '블로그 포스트', topic: '신제품 런칭', status: '대기중', date: '2026-09-25', completedDate: null,
  });
});

test('allowance counts this month against the chosen plan', () => {
  const today = '2026-09-25';
  const september = Array.from({ length: 10 }, (_, i) => ({ ...demoOrders[0], id: `ORD-2026-1${i}0`, date: '2026-09-02' }));
  assert.deepEqual(allowance(demoOrders, null, today), { plan: null, used: 0, limit: null, remaining: null, canOrder: true });
  const starter = allowance([...september, ...demoOrders], 'starter', today);
  assert.equal(starter.used, 10);
  assert.equal(starter.canOrder, false);
  assert.equal(allowance(september, 'pro', today).remaining, 20);
  assert.equal(allowance(september, 'enterprise', today).canOrder, true);
});

test('dashboard counts, filters and search', () => {
  assert.deepEqual(countByStatus(demoOrders), { all: 7, '대기중': 3, '진행중': 2, '완료': 2 });
  assert.equal(filterOrders(demoOrders, { status: '완료' }).length, 2);
  assert.equal(filterOrders(demoOrders, { query: '스킨케어' })[0].id, 'ORD-2026-002');
  assert.equal(filterOrders(demoOrders, { query: 'ord-2026-007' }).length, 1);
  assert.equal(filterOrders(demoOrders, { status: '완료', query: '검색광고' }).length, 0);
  assert.equal(leadDays(demoOrders[0]), 2);
  assert.equal(leadDays(demoOrders[4]), null);
});

test('portfolio filter keeps every case under 전체', () => {
  assert.equal(filterPortfolio(portfolioItems, 'all').length, 9);
  assert.equal(filterPortfolio(portfolioItems, 'ad').length, 3);
});
