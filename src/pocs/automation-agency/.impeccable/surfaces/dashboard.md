---
version: 1
slug: "dashboard"
primary_target: "dashboard"
related_targets: ["catalog","roi","workflows","projects","quotes","pricing"]
---

# Surface brief: AutoMate Pro module (first surface: dashboard)

Scope: the whole `automation-agency` module world; first surface is the dashboard (`/automation-agency`).
Visitor mode: Operate (dashboard, catalogue, ROI, workflow builder, projects, quotes). The pricing page is
a Persuade surface inside the same world.

Audience and job: a solo automation-agency operator (PRODUCT.md) running delivery and maintenance
subscriptions; sees pipeline and recurring revenue, advances projects, quotes, designs workflows, and
turns the laptop toward a client for ROI and quote.

## Grounding (unattended run)

No user was present: no interview, no decision page. Roll ran degraded (no network, no challengers, no
quality-bar boards). Proceeded with the assigned index. Assumptions: light theme (daytime office / client
meeting on a laptop), Korean-first copy, sample data labelled.

Mechanism: repetitive work becomes a measured automation (hours saved × hourly cost vs fees) that is
built once and then kept running on a monthly maintenance subscription.
Category rut: blue/violet gradient SaaS dashboard with a stat-card row (the legacy look). Predictable
opposite: near-black terminal with neon accent. Literal reading of the name: robots, gears, lightning.

Grounded list, ordered by resonance (drawn before the roll):
1. FA control cabinet (제어반): pilot lamps, engraved nameplates, run/stop, wire numbers. (industrial hardware)
2. PLC ladder / sequence schematic (시퀀스 회로도): rails, contacts, coils, rungs. (technical notation)
3. Korean business forms (견적서, 거래명세표): red ruled grids, seal, 일금 ○○원정. (paperwork)
4. Seoul metro line diagram (지하철 노선도) and station signage: octilinear coloured lines, stations,
   interchange rings, line-number badges, the circle line. (wayfinding graphics)  <- ASSIGNED
5. Flowchart stencil ruler (순서도 템플릿자) and ISO 5807 notation. (drafting tools)
6. Punch-clock time card (출퇴근 기록카드): stamped hours in columns. (time-keeping paperwork)
7. Factory production status board (생산현황판): target/actual counters, magnet board. (shop-floor ritual)

## Direction contract

THESIS: The agency is a transit network. Every client's work runs as a line: projects travel station by
station through delivery (대기 → 분석 → 개발 → 테스트 → 배포) and then join the maintenance circle line,
where subscriptions keep circulating; that loop is the business. Refuses the stat-card dashboard: the
numbers live on the map.

OWN-WORLD: White map ground, charcoal station-sign bands (#26292e) with white Hangul, one uniform line
weight, octilinear routes (horizontal + 45° bends, rounded joins), stations as white discs with a
line-coloured ring, interchanges as white capsules with a charcoal ring, termini as end bars, rounded
line-number badges. Line colours are data: 구축선 navy for delivery, 순환선 green for maintenance, and
one line colour per tool (Make purple, Zapier orange, n8n pink, Apps Script sky, Sheets olive, others
brown/gold). Pretendard carries all text; a condensed signage Latin face carries station codes and
English sub-labels only. Tables are timetables: ruled, tabular numerals, no cards.

STORY: The operator sees in one look where every project is and what recurs each month, advances a
project to the next station, opens the builder to lay a client's workflow as a line, proves ROI as a
journey to the break-even station, and issues a VAT-inclusive quote. A client across the table
understands the route, the fare (fees) and the payback stop without explanation.

FIRST VIEWPORT: Top: a charcoal station-sign band as navigation (current station large and white, the
others as stations on a thin line, sample-data tag and reset at the right). Below, full width at ~60% of
the viewport: the network map: the navy delivery line left to right with five stations, each labelled
with its project count and client names, merging into the green circle line on the right; maintenance
clients sit as stations on the loop; the loop encloses 월 정기 수익 (MRR) and the subscription count.
Under the map: a timetable row, "도착 예정" (upcoming deadlines) and open quotes (pipeline value). Primary
action "새 프로젝트" sits in the band's right end of the map header.

FORM: Seoul metro line diagram + station signage as a working system, candidate 4 of 7 on the ordered
list, seed key bac9b5c7. Signature interaction: 노선 잇기, connecting two stations in the workflow builder
draws the octilinear segment in the upstream tool's line colour (draw-on stroke, instant under
reduced motion); the same grammar moves a project's marker to the next station on "다음 역으로".
Motion grammar: 180–240ms expo-out, state-only; lines draw, markers slide, nothing fades in on load.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Whether the operator works mostly on phone in the field (assumed desktop-first, phone-capable).
- Real pricing and packages to replace the legacy POC figures.

## Finish record (2026-09-24)

- Build path: code-led (no image generation). Two capture rounds (desktop 1440 + mobile 390) in `.impeccable/review/`.
- Detector (impeccable@4.1.0): 2 findings (border-right bend on the network map, width transition on the route fill), both fixed by an SVG bend + filled drop and a scaleX transition; re-run clean.
- Finish review: substituted in-thread (no subagent tool in this harness). Round 1 disposition `fix`: diagonal branch labels colliding with station plates; inspector app select truncated; comparison-table row headers styled as column heads; quote builder min-content overflow at 390px (select intrinsic width); ROI slider track showed no value; dashboard primary actions not in the map header as FIRST VIEWPORT promised; "→" glyph as date-range separator. Round 2 recapture: all resolved except the branch-label geometry, re-fixed after capture and verified by unit test only.
- Rasters: none shipped (OG card is rendered at request time by `@/core/og`).
- DESIGN.md and `.impeccable/design.json` written from the built world.
