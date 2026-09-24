---
version: 1
slug: "online-education"
primary_target: "online-education"
related_targets: ["school"]
---

# Surface brief: 에듀마켓 (/online-education)

## Scope and mode

- Studio routes (`/online-education`, courses, curriculum builder, students, products, revenue, plans): **Operate**. A solo creator at a desk after work, laptop in a lit room; 10–40 minute admin sessions. Light theme follows from that scene.
- School routes (`/online-education/school/**`: storefront, course landing, product page): **Persuade**. A prospective student, often on a phone, deciding whether to register.
- Build path: code-led (no image generation available). Roll: degraded (no network to impeccable.style), no challengers, no quality-bar boards.
- Unattended run: no one answered the ask round or a decision page. Assumptions recorded below.

## Grounded directions (ordered by resonance; rut kept out)

Rut: the category default (thumbnail-card grid, KPI tiles, blue "Enroll" hero, as on most course platforms) and its predictable opposite (dark creator-economy neon, or cream-and-serif "academy").

1. 교재 목차 — the 수험서/문제집 typographic system: 단원·소단원 numbering, thumb-index tabs, two-colour spot print.
2. 인강 강좌 목록·플레이어 — the Korean online-lecture site: dense lecture lists, 배속, 수강 기간, 진도율 bars.
3. 서점 매대와 띠지 — bookstore display tables, belly bands, 정가 stickers (the one candidate spent on the literal "market" reading).
4. 스터디 플래너와 형광펜 — the 10-minute planner grid coloured in with highlighters.
5. 대학 시간표·수강신청 — the semester timetable of coloured course blocks every Korean student builds, and the 수강신청 ritual. **(assigned)**
6. 교실 칠판과 자석 명패 — green board, chalk, magnet name tags.
7. 원고지·오답노트 — manuscript grid paper and the error notebook.

Families: print/publishing (1, 3), screen interfaces (2, 5), paper stationery (4, 7), classroom objects (6).

## Direction contract

THESIS: A course is a timetable. Lessons are coloured blocks whose height tracks their running time, stacked under section columns the way a student lays out a semester; the studio reads this week's sales as blocks on a week timetable, and the storefront runs the 수강신청 ritual that ends with the course placed into the student's own week. It refuses the category default of thumbnail cards, KPI tiles and a blue enroll hero.

OWN-WORLD: Cool near-white timetable paper; 1px cool-gray rules only where they measure time or rows. Course identity comes from an eight-swatch block palette (tomato, tangerine, lemon, lime, mint, sky, lavender, pink): soft saturated fills with same-hue dark text. Filled block = course, outlined block = digital product. Ink-navy chrome and near-black primary buttons; lemon marks today and now. Block corners 6px. Pretendard only, tabular numerals, heavy weights for block titles. lucide icons, one stroke weight.

STORY: The creator sees this week's sales as blocks and this month's revenue in one sentence, opens a course whose curriculum is a timetable they edit block by block, publishes it and shares the page. A student sees the outcomes and the curriculum as a timetable, picks a weekly pace, watches the lessons drop into their week, and registers.

FIRST VIEWPORT: Studio home. Desktop: left rail nav with wordmark; header row with the week as h1 ("9월 넷째 주"), prev/next week and a legend; a 7-column 월–일 × hour timetable filling about 70% of the width, one block per payment, coloured by course; right column with this month's revenue as a sentence plus growth against the same days last month, a two-block course/product split, drafts to finish and the latest registrations. Primary action "새 강의" top right. Mobile: the same week grid at seven narrow columns with bottom tab navigation. Course landing: title and facts top-left, curriculum timetable beneath, sticky right rail with price, pace picker, mini week timetable and the 수강 신청 form.

FORM: 대학 시간표·수강신청, position 5 of 7 on the grounded list. Seed key 5ff06ed7 (degraded roll).

SIGNATURE: "내 시간표 짜기". Choosing a weekly pace redistributes the course's lessons into session blocks on a 월–일 grid; blocks slide to their new days and the finish date recomputes. The chosen pace is stored with the enrollment and returns in the studio as on-track or behind. Motion grammar: blocks slide and settle (180–240ms, exponential ease-out); nothing else moves except state feedback; reduced motion shows the end state.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Assumptions (unattended run)

- Mode split (Operate studio, Persuade school) inferred from the brief; no user confirmation.
- Timetable axes: in the builder, section = column and block height grows with runtime (a floor keeps short lessons legible, so heights are ordered, not exact). On the studio home, columns are weekdays and rows are Seoul-time hours.
- Study-plan pace and on-track/behind are an extension of the brief's enrollment and progress features, kept inside product truth: they are computed from runtime, pace and dates, never claimed.
- Course codes, prices and all activity are sample data and labelled as such.

## Open decisions

- Real payment processing, learner login and lesson playback are out of scope; the public page says payments are recorded, not charged.

## Finish record

- Inspection: two batched rounds (desktop 1440 + mobile 390) under `.impeccable/review/`; no console errors, HTTP errors or horizontal overflow.
- Detector (impeccable@4.1.0, run once): 2 mechanical findings (layout `height` transition on planner sessions; unused bounce easing token), both fixed.
- Finish review (in-thread; this harness has no subagent tool): disposition **fix**. There were five material fixes: signature planner showed a partial week, revenue hero-metric strip, broken colour-chip swatches, truncated multi-lane week blocks, and the detector items. Verdict pass on the round-2 recaptures scored all five resolved, recomputed **ship** for the scored fixes.
- DESIGN.md and `.impeccable/design.json` written from the built world. No shipping rasters (all imagery is code-drawn data: timetables, fingerprints, charts), so no provenance is owed.
