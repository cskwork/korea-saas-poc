---
version: 1
slug: "console"
primary_target: "console"
related_targets: []
---

# Surface: 스마트셀러 console (all routes under /smart-store)

Mode: **Operate**. The visitor is a solo SmartStore consignment seller completing tasks:
confirm new orders (발주), enter tracking, pick and list profitable wholesale items, check
margins and sales. Build path: **code-led** (no image generation in this run).

Unattended run: no user was available for the question round or the decision page. The
roll ran **degraded** (impeccable.style unreachable; no challengers, no QUALITY BAR boards).
Proceeded with the assigned direction; assumptions are listed below.

## Grounded candidates (ordered by resonance, written before the roll)

1. 택배 운송장 (courier waybill label) — every order ends as a thermal-printed waybill.
2. 거래명세서 carbon triplicate — the paper between wholesaler and seller, 공급가액/합계 columns.
3. 증권 HTS 호가창 — Korean trading screens, red-up/blue-down, dense grids.
4. **동대문 도매시장 새벽 가판 — the wholesale market floor: cement floor under tube light,
   white 장끼 slips, fluorescent POP price cards and hang tags lettered in marker, 형광펜,
   box tape. ← ASSIGNED (index 4)**
5. 금전출납부 ledger book (rejected on its own: another module already owns a ledger world).
6. Corrugated parcel + packing tape + handling stamps.
7. POS thermal receipt.

Rut kept out: the category's SaaS dashboard (sidebar + KPI tiles + Naver green) and its
predictable opposite (dark trading terminal with neon). The name's literal reading
("smart" = tech gloss) was not spent on any candidate.

## Direction contract

THESIS: The console is a wholesale-market stall, not a KPI dashboard: every item and order
carries a marker-lettered price tag that says what the seller actually keeps, in 흑자 black
or 적자 red. It refuses the green SaaS dashboard of stat tiles and donut charts.

OWN-WORLD: Cool cement-gray floor as the page ground; white 장끼 slips (thin ruled paper
surfaces, dashed tear rules) hold every list and form; the fluorescent-yellow POP hang tag
(clipped top corners, punched hole) is the one signature object and carries margin; 형광펜
yellow stroke marks the current place and anything that needs action; marker-black ink;
red marker only for 적자, cancel strike-throughs and destructive acts; kraft box-tape brown
marks parcels in transit. Display lettering is a heavy signboard gothic (Black Han Sans)
for page titles and tag prices only; everything else Pretendard with tabular numerals.

STORY: The seller sees what needs doing today (orders waiting for 발주), believes the margin
numbers because fee, cost and shipping are itemised on every tag, and moves each item and
order to its next step in place.

FIRST VIEWPORT: /smart-store at 1440×900 — left rail on the floor (wordmark, seven stalls,
sample-data note, reset). Main column opens with the date and a signboard-lettered sentence
headline counting orders waiting for 발주, primary action "주문 처리" at the headline's right.
Below: a wide slip of waiting orders, each with an inline 발주 확인 button, beside a narrow
7-day 장끼 tally (receipt lines with dotted leaders, change vs the previous 7 days). Under
them, a row of four fluorescent hang tags: unlisted high-margin wholesale items, each with
one-click AI 등록.

FORM: 동대문 도매시장 새벽 가판 (wholesale market floor), candidate 4 of 7 on the ordered list;
seed key e75fd997. Signature interaction: **흑자·적자 가격표** — the hang tag rewrites itself
live while a price, cost or shipping value is typed (listing price editor, calculator),
flipping from black to red ink at break-even. Motion grammar: 150–220ms ease-out only for
state — the 형광펜 stroke draws in from the left on the current item/needs-action mark and
retracts when an order is processed; no page-load choreography.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Assumptions (unattended)

- Light theme: the seller works at a desk by day/evening room light and checks a phone
  outdoors; the market world itself is lit by white tube light.
- No product photography exists; the build ships no rasters and does not fake product
  images. Items are represented by their text, supplier, category and tag.
- Fluorescent yellow is a green-leaning 형광 yellow, deliberately distinct from Kakao's warm
  yellow and from Naver green (no platform impersonation).

## Finish review (in-thread; this harness has no subagent tool)

Evidence: `.impeccable/review/desktop.png` + `mobile.png` (overview) and per-route captures
(sourcing, item, listings, listing, new, orders, calculator, keywords, analytics). Detector
(`impeccable@4.1.0 detect`): 0 findings. Review disposition: **fix** — 5 material fixes:
1. FIRST VIEWPORT: hang-tag row fell below the fold at 1440×900 → queue cut to 4 orders, spacing tightened.
2. Floor: date line above the H1 read as an eyebrow → folded into the lede.
3. Floor: "+"/"−" text glyphs as the test-order disclosure icon → lucide Plus, rotates on open.
4. Motion grammar: 형광펜 retract on 발주 확인 was missing → waiting orders carry the stroke; it retracts while confirming.
5. Table rows broken by flex cells (calc history, row headers) → flex moved inside cells; tbody th styled as rows.
Verdict pass on recaptures: all five resolved; no regressions seen. Disposition for the scored fixes: **ship**.
Keep: the POP hang tag with 흑자/적자 ink on the cement/slip world; do not spread yellow further.
