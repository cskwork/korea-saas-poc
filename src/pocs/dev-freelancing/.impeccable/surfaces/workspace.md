---
version: 1
slug: "workspace"
primary_target: "workspace"
related_targets: ["profile"]
---

# Surface: DevFlow workspace (+ public profile)

Scope: every route under `/dev-freelancing` — the developer's workspace (Operate) and the public
profile/price page `/dev-freelancing/profile` (Persuade, same world in its paper register).

Audience and job: a Korean solo web/app 외주 developer, at the desk after a coding block (evening,
beside a dark editor), logging hours, moving projects, issuing 견적서/인보이스 and checking deposits.
Public page: a prospective client deciding whether to ask for a quote.

Run notes (unattended): no interview and no decision page were possible; the direction below is the
seed's assignment built as-is. The roll ran degraded (no network to impeccable.style): no challengers,
no QUALITY BAR boards, no pick card presented. Build path: code-led (no image generation).
Assumptions: dark workspace chosen from the use scene (evening, next to a dark-themed editor);
documents and the public page switch to paper because they are what the client sees.

Grounded list (ordered by resonance): 1 세금계산서/거래명세서 carbon-ruled form · 2 git log --graph
commit graph · 3 통장 passbook ledger · 4 code-editor chrome (tabs, gutter, status bar) · 5 Seoul
Metro line diagram · 6 punch-clock time card · 7 contribution calendar (day-cell heatmap).
Rut kept out: indigo stat-card SaaS dashboard (the legacy look) and its opposite, a neon terminal.

## Direction contract

THESIS: DevFlow is a ledger of cells. Every hour worked, milestone and invoice is a square that
fills — hollow → partial → solid — so the freelancer reads effort and money the way they read a
contribution calendar. It refuses the stat-card + indigo-sidebar dashboard and the neon terminal.

OWN-WORLD: graphite night-desk ground in two cool neutral layers; one five-step heat ramp (dim copper
→ amber → sodium yellow) used only as data: hours, fill state, money arrived; rose only for overdue
and destructive. Square cells (2px radius) on a 4px module, hairline rules, square-cornered
controls, dense tables with tabular numerals. Pretendard for all UI; JetBrains Mono only for measured
data (timer, hours, document numbers). Documents and the public profile flip to white paper, graphite
ink and the ramp's deep steps.

STORY: the developer sees half a year of work as cells, today's cell, what is unpaid and for how long;
starts or stops the timer from the dock; moves a project along the board; issues paper documents with
the real 3.3%/10% tax outcome. A client sees paper documents and a page that shows steady work.

FIRST VIEWPORT: dashboard at 1440 — 216px left rail (DevFlow mark, nav). Main: full-width work
calendar (26 weeks × 7 days, 14px cells, month labels, weekday labels, legend, deposit ticks under
weeks) with a one-line summary; below, 받을 돈 ledger rows (number, client, amount, age, state cell)
beside this month's goal as a 10-cell bar with net-after-tax, hours and effective hourly rate; then
active projects with hour-cell bars and next milestone. Fixed timer dock along the bottom: project
select + 타이머 시작 is the primary action; running, it shows the mono clock and 정지.

FORM: contribution calendar (day-cell heatmap), position 7 of my ordered list of seven; seed key
8afad53d. Signature interaction: 칸 채우기 — stopping the timer or logging hours steps today's cell
up a level with a bottom-up fill, and the project's hour-cells fill in order. Motion grammar:
160–220ms exponential ease-out, state changes only; reduced motion makes it instant.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Finish review (2026-09-24, in-thread: no subagent tool in this harness)

Round 1 (captures in `.impeccable/review/*-desktop.png|*-mobile.png`) — disposition: fix.
1. Estimate/invoice editor line rows crushed the item title at 1440 (title + 4 numeric fields on one row) → title row + numbers row.
2. Project page listed every time entry (page ~4,500px) → 8 most recent + link to the filtered time log.
3. "실효 시급" coloured unfinished projects' partial payments as losses → only finished projects compared with the base rate; others read 입금 전 / 일부 입금.
4. Paid-invoice 도장 collided with the number on phones → meta drops below the heading under 640px.
5. Amber borders used for emphasis (conversion box, featured plan) broke the Data-Only Ramp rule → neutral hairlines.
6. Icon-only delete buttons shouted in rose at rest → quiet until hover; arrow glyphs in the board hint → drawn icons.
Verdict pass (round 2 recaptures): 1–6 resolved. Detector (impeccable@4.1.0 detect): 0 findings.
