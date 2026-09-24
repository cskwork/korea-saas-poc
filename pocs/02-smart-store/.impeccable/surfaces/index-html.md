---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: 스마트셀러 seller desk (single-page app)

Scope: `pocs/02-smart-store/index.html` (six screens: 상품 소싱, AI 등록, 주문 관리, 수익 계산, 키워드, 매출 분석).
Mode: Operate. Audience/job: a solo Naver Smart Store dropshipping seller deciding what to list and moving orders to delivery; laptop at a desk for sourcing and listing, phone for order checks.
Constraints: static HTML/CSS/JS, localStorage only, mock data labeled as demo, Korean copy preserved, no NAVER brand imitation.
Decision note: owner approved "as recommended" (2026-09-24); no interactive direction round was held (subagent run, no answer channel). Build path: code-led (not stored in config).

## Direction contract

THESIS: The seller's catalogue is a trading screen. Products are 종목, margin after Naver fee is the price change, orders are 체결 내역. Refuses the category default: green SaaS cards, emoji tiles, KPI card rows.

OWN-WORLD: Korean HTS (증권사 홈트레이딩 화면) grammar: cool grey window chrome, white data panes ruled by 1px hairlines, deep ink-navy title bar, Korean market colour law (red 상승 = profit, blue 하락 = loss), tabular figures everywhere, 4-digit 화면번호 on every screen tab, dense right-aligned number columns. Pretendard only. Square corners (2px max). Dark theme is the night HTS skin, same law.

STORY: The seller scans the screener, sees each product's 순수익 and 마진율 as a signed quote, opens one into a quote panel that ladders 판매가 down to 순수익, sends it to AI 등록 as an order ticket, and watches orders move through 체결 stages.

FIRST VIEWPORT: Ink title bar (wordmark, 데모 데이터 tag, 화면번호 jump box, clock); a quote tape of margin moves; screen tabs with codes; 1001 상품 소싱 screener table filling the pane, filter bar on top, count at right; row click opens the quote panel at the right (desktop) or a sheet (mobile).

FORM: HTS trading terminal, position 6 of 7 on the ordered list; seed key 4c4deefd.
- Raise (exposure record, declined): one closed neutral ramp; no ad-hoc greys.
- Raise (drum machine, declined): one "now" marker; the tape and the newest 체결 row flash once.
- Raise (orizuru, declined): every state change recoverable; cancel and advance offer 되돌리기.
- Raise (deep dive, declined): one numeric spine; all money right-aligned on a shared column edge.
- Raise (bitmap specimen, declined): numbers at three fixed sizes only.
- Raise (info-noise sleeve, declined): columns drop in declared tiers as width shrinks.

Signature interaction: quote flash. Changing filters or advancing an order flashes the affected numbers red/blue for 600ms like a price tick (reduced motion: no flash).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
