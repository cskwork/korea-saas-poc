---
version: 1
slug: "components"
primary_target: "components"
related_targets: []
---

# Studio surfaces (크리에이트잇 module UI)

## Scope and mode

Whole module UI under `src/app/ai-design-video/**` rendered by `src/pocs/ai-design-video/components/**`.
- Operate: 오늘(dashboard), 주문 목록/상세/접수, 수익 분석, AI 도구 비교.
- Experience (inside the same world): 포트폴리오.
- Persuade (inside the same world): 가격표 → prefilled 주문 접수.

Audience/job: the one-person studio operator; see what is due, move orders through 의뢰접수 → 시안작업 → 수정요청 → 납품완료 within each package's revision allowance, prepare briefs with the AI assistant, track the month against the goal. Constraints: all numbers from rows; sample data labelled; works without an API key.

## Decision record (unattended run)

- Degraded roll (no network, no challengers, no QUALITY BAR boards); no user answered, so the assigned direction was taken as-is. Build path: code-led (no image generation available).
- Ordered grounded list: 1 편집 타임라인 (NLE track lanes) · 2 인쇄 교정지 (proof sheet, crop marks, 수정 N차 red pen) · 3 콘티 시트 (storyboard/continuity sheet) · 4 한국 유튜브 썸네일 문법 · 5 아트보드 캔버스 · 6 슬레이트 & 컬러바 · 7 컨택트 시트. Rut kept out: dark neon creative-studio dashboard; white gallery grid.
- Light theme from the scene: operator at a desk in daylight, planning on paper before opening the editor.

## Direction contract

THESIS: Every order is a cut on a 콘티 sheet, drawn at its deliverable's true aspect ratio and inked from blue sketch to pencil to red correction to black ink as it moves 의뢰접수 → 시안작업 → 수정요청 → 납품완료. It refuses the category default: dark creative-studio dashboard, neon gradient, KPI tiles, kanban cards.

OWN-WORLD: Cool-white copier-paper sheets on a pale cool-gray desk, printed with ink-black ruled tables (CUT | 화면 | 내용 | 진행 | 마감) and header blocks of labelled form cells. Frames are 2px ink rectangles at 16:9, 9:16, 1:1, 4:5, 3:1 and the tall 상세페이지 strip, carrying non-photo-blue safe-area guides. State is the drawing medium: dashed blue sketch, graphite line, red pencil with a correction tick, black ink with a circled OK. Copic cool-gray washes mark hover and selection; red pencil only for 수정, overdue, destructive. Rectangular ink buttons (2px radius). Pretendard for UI; Barlow Condensed for cut numbers, durations and aspect labels; Black Han Sans only inside frames as a rough's headline.

STORY: The operator opens today's sheet, sees which cuts are due and in which medium, advances one (it inks), logs a client's 수정 N차 against its allowance, generates an AI 콘티 for a new order, and checks the month's delivered total against the goal.

FIRST VIEWPORT: A ruled top bar: wordmark cell, nav cells, ink "새 주문 접수" at the right. Below it a full-width sheet header block: 제작 월, 오늘, four scene cells S#1–S#4 with cut counts (each a filter link), and 이번 달 납품 vs 목표 as a ruled measure. Then the cut table of open orders sorted by 마감, frames about 96px tall, four to five rows visible at 1440×900; overdue 마감 in red pencil.

FORM: 콘티 시트 (storyboard / continuity sheet), #3 of 7 on the ordered list, seed key 46873e5e. Signature interaction, 인킹: when an order changes status or a new AI 콘티 arrives, its frame redraws its perimeter in the new medium (420ms stroke draw, exponential ease-out), cut by cut; static under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

The row's frame inking itself when the order advances; the AI 콘티 table drawing its frames one cut at a time.

## Unresolved

- Real portfolio imagery does not exist; frames are authored layout roughs labelled 샘플.
- Owner has not confirmed prices, goal, or added order types (배너, 숏폼).

## Finish record

- Inspection: two batched rounds (desktop 1440 + mobile 390, all routes) in `.impeccable/review/`; no console errors, no 4xx/5xx, no horizontal overflow.
- Detector (impeccable 4.1.0): one finding (thick accent border on the rounded dialog) fixed; re-run clean.
- Finish review: run in-thread (no subagent tool in this harness), disposition `fix` → one batch (glyph check mark and arrows replaced with lucide icons, rush tag moved from red to ink per the red-pencil rule, non-sequential notes un-numbered, copy bars removed under set headlines, Korean particle in the not-found title) → recaptured and verified; all five fixes resolved.
- DESIGN.md and `.impeccable/design.json` written from the built CSS. No shipping rasters (all frames are code-drawn SVG), so no provenance owed.
