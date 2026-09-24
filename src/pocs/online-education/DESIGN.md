---
name: 에듀마켓
description: The semester timetable — a creator's school where every course is a coloured block and every lesson a block whose height is its running time.
colors:
  paper: "#fcfdfe"
  paper-sunk: "#f4f7fa"
  paper-deep: "#eceff5"
  rule: "#dfe2e7"
  rule-strong: "#c7cdd3"
  ink: "#161e2c"
  ink-soft: "#49505d"
  ink-mute: "#666c77"
  lemon: "#f9ea73"
  lemon-wash: "#fdf9db"
  lemon-ink: "#635100"
  focus: "#1a6fe1"
  danger: "#c22826"
  ok: "#007748"
  warn: "#925000"
  block-sky: "#a8dafa"
  block-sky-ink: "#064172"
  block-pink: "#f8c0d7"
  block-pink-ink: "#7d234d"
  block-mint: "#a6e8d0"
  block-mint-ink: "#004f41"
  block-tangerine: "#ffc998"
  block-tangerine-ink: "#7d3a01"
  block-lavender: "#d3c7f9"
  block-lavender-ink: "#503484"
  block-tomato: "#ffb8ab"
  block-tomato-ink: "#8d261b"
  block-lime: "#c6e99a"
  block-lime-ink: "#305313"
  block-lemon: "#f9ea92"
  block-lemon-ink: "#604e00"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 3.25rem)"
    fontWeight: 850
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  section-title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 750
    lineHeight: 1.3
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 650
    lineHeight: 1.3
  block-meta:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  lane: "4px"
  block: "6px"
  control: "8px"
  panel: "12px"
  hero: "14px"
spacing:
  hair: "2px"
  lane: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  button-danger-confirm:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "32px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  choice-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "34px"
  course-block:
    backgroundColor: "{colors.block-sky}"
    textColor: "{colors.block-sky-ink}"
    rounded: "{rounded.block}"
    padding: "8px 10px"
  product-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.block}"
  nav-item-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
  badge-sample:
    backgroundColor: "{colors.lemon-wash}"
    textColor: "{colors.lemon-ink}"
    rounded: "5px"
    height: "22px"
---

# Design System: 에듀마켓

## Overview

**Creative North Star: "The Semester Timetable"**

에듀마켓 borrows the one screen every Korean student builds each semester: a white timetable of hairline rules with a coloured block per course. The creator's studio is that timetable. The home screen lays this week's payments on a 월–일 × hour grid. The curriculum builder stacks lessons as blocks under section columns, and each block grows with the lesson's running time. Revenue charts stack the same course colours month by month. On the public course page the course's own block is zoomed to page scale, and the 수강신청 ritual ends with the course placed into the student's week ("내 시간표 짜기").

The surface is calm, light and exact. It is meant for a creator at a desk after work, and for a student deciding on a phone. Colour appears only as data (which course is which), plus one lemon marker for "today / now / you are here". Every other part of the page is paper, ink and rules.

**Key Characteristics:**
- Filled block = course, outlined block = digital product, everywhere (timetables, charts, chips, storefront).
- One colour per course, chosen from an eight-swatch block palette and kept for the course's lifetime.
- Block height carries running time; rules appear only where they measure time or rows.
- Lemon is the only accent: today's column, the now-line context, the active nav item, the sample-data badge.
- Near-black ink for primary actions; the palette never paints buttons.

## Colors

The ground is cool near-white paper. Structure uses cool grey rules and three steps of ink. Colour is reserved for course identity and for the single lemon marker.

### Primary
- **Timetable Ink** (`ink`): text, primary buttons, section index squares, the now-line. Its near-black navy keeps the pastel blocks legible and never competes with them.

### Secondary
- **Today Lemon** (`lemon`, with `lemon-wash` and `lemon-ink`): the "now / here" marker. It fills today's day label, washes today's timetable column, backs the active nav icon and tints the sample-data badge. The sample badge carries `lemon-ink` text on `lemon-wash`.

### Tertiary
- **Course Block Palette** (`block-sky`, `block-pink`, `block-mint`, `block-tangerine`, `block-lavender`, `block-tomato`, `block-lime`, `block-lemon`, each with a `-ink` partner). These are soft saturated fills (OKLCH lightness 0.85–0.93, chroma 0.07–0.11). Text on a block uses its same-hue ink, which gives 6:1 or better. A darker edge (lightness about 0.7) outlines blocks at 1px. New courses take the first unused swatch in the order sky, pink, mint, tangerine, lavender, tomato, lime, lemon.
- **State colours** (`ok`, `danger`, `warn`, `focus`): growth up / down, destructive confirms, behind-pace badges and the cobalt focus ring. They are used only for state, never decoration.

### Neutral
- **Paper** (`paper`): the page and every content surface.
- **Paper Sunk** (`paper-sunk`): the studio rail, table headers, inline edit trays and rest days in the study planner.
- **Paper Deep** (`paper-deep`): hover fills and progress-bar tracks.
- **Rules** (`rule`, `rule-strong`): hairlines between rows and timetable cells; `rule-strong` for control borders.
- **Ink Soft / Ink Mute**: secondary and tertiary text. Both hold at least 4.5:1 on paper and paper-sunk.

### Named Rules
**The Colour-Is-Data Rule.** A block colour always means "this course". Never use a block swatch for decoration, a button or a heading.

**The One Lemon Rule.** Lemon marks the present: today, now, the current page, sample data. It never marks a call to action.

**The Outline-Is-Product Rule.** Digital products never get a fill. They are paper blocks with a 1.5px `ink-mute` outline, so a timetable or chart reads course vs. product at a glance.

## Typography

**Face:** Pretendard Variable for everything. The platform loads it globally; this module adds no second face. Numbers use tabular figures (`font-variant-numeric: tabular-nums`) in tables, timetables, prices and times.

**Character:** a Korean workhorse sans, as on the timetable apps it borrows from. Personality comes from weight (750–850 for titles and block labels) and tight tracking, not from a display face.

### Hierarchy
- **Display** (850, `clamp(2rem, 1.4rem + 2.2vw, 3.25rem)`, lh 1.12, -0.035em): public course titles and the storefront school name only (Persuade surfaces).
- **Page title** (800, 2rem, lh 1.15): one h1 per studio page, such as the week title "9월 넷째 주". It steps to 1.625rem under 640px.
- **Section title** (750, 1.0625rem): section heads inside pages.
- **Body** (400, 0.9375rem, lh 1.55): prose and ledes. Line length is capped at 60–78ch.
- **Label** (650, 0.8125rem): buttons, form labels, tabs.
- **Block meta** (700, 0.6875rem): lesson type and time inside blocks, timetable day totals, hour gutter.

### Named Rules
**The Weight-Not-Face Rule.** Hierarchy comes from Pretendard's weight and size steps (a ratio of about 1.2 in the studio). Never add a display face to studio UI.

## Layout

- **Studio:** a 248px sticky rail (paper-sunk, full-height column) plus a fluid main column padded `clamp(20px, 3vw, 44px)`. Under 1024px the rail becomes a 56px top bar plus a fixed five-item bottom tab bar, the timetable-app convention.
- **Studio home:** week timetable (fluid) + a 320px summary column; the column moves below the grid under 1180px.
- **Week timetable:** a real `<table>` with a 44px hour gutter, seven equal day columns and 34px hour rows (28px on phones, where blocks become colour-only lanes). Up to three payments share a cell as lanes; more collapse into "+N".
- **Curriculum builder:** 288px section columns in a horizontally scrolling row with snap points. Under 700px the columns stack.
- **Course landing:** content column + a 380px sticky registration rail (`hero rail / body rail`). Under 1024px the order becomes hero, rail, body, and a fixed ink CTA bar appears at the bottom.
- **Rhythm:** 2 / 6 / 10 / 16 / 24 / 32 / 40px, with more space above a section heading than below it.

## Elevation & Depth

The system is flat. Depth appears in two places only:
- **Lift** (`0 1px 2px ink/6%, 0 10px 24px -14px ink/28%`): the active rail item, the active tab and the registration panel.
- **Block edges** (1px inset in the block's edge colour at 55–60% alpha): define coloured blocks without shadows.

### Named Rules
**The Flat Paper Rule.** A timetable is paper. Never stack a border and a wide soft shadow on the same element. Cards use a 1px rule and no shadow.

## Shapes

- Lanes in the week grid: 4px. Lesson and course blocks: 6px. Controls and chips: 8px. Panels and tables: 12px. The course hero block and storefront course blocks: 14px.
- Section index markers are 26px ink squares with 6px corners. The sequence carries meaning (curriculum order), so numbers are allowed here only.
- Dashed outlines mark only "space to add" (add-lesson slot, add-section column, empty-course draft panel) and quiz lessons.

## Components

### Buttons
One family. Primary is ink with paper text. Secondary is paper with a `rule-strong` border. Ghost is transparent. Danger is text-red until confirmed; the confirm button is solid red. Sizes are 38px (default), 32px (small) and 48px (large; registration CTAs). Pending states swap in a spinning loader and a verb in progress ("신청하는 중"). Destructive actions always go through the inline confirm step: prompt text, then "삭제" and "취소". There is no browser `confirm()`.

### Chips
- **Choice chips** (radio groups: category, block colour, study pace, billing): 34px, 1px `rule-strong`; the selected chip is ink-filled. Colour choices carry a 14px swatch.
- **Course chip:** block fill with its ink text, used in rosters and lists.
- **Product chip:** paper with a 1.5px `ink-mute` outline.
- **Badges** (22px): live / 게시 중 (ink), ok / 수료, warn / 뒤처짐, danger / 환불, sample (lemon).

### Cards / Containers
There are no card grids. Content sits in ruled lists (one container, rows split by hairlines) or in panels (paper, 1px rule, 12px). The course hero is the only large colour field.

### Inputs / Fields
40px paper fields with 1px `rule-strong` borders. Focus shows the `focus` border plus a 3px focus halo at 18%. Invalid fields get a danger border and an error line wired with `aria-describedby`. Labels always sit above fields; hints are 12px `ink-mute`.

### Navigation
Rail items are 40px with an icon in a 28px square. The active item gets a paper background and lift, and its icon square turns lemon. The phone tab bar uses the same lemon icon capsule for the current page.

### Week Timetable (signature)
Seven day columns × hour rows, with today's column washed lemon and future days slightly sunk. A 2px ink now-line with a dot sits at the current minute. Course payments are filled blocks in the course colour (title + compact amount); products are outlined blocks with a file icon. Headers show weekday, date and the day's compact total.

### Curriculum Board (signature)
Section columns hold lesson blocks whose `min-height` is `clamp(76px, 56px + minutes × 1.6px, 170px)`. Heights therefore follow running time above a legibility floor. Video lessons are solid fills, text lessons are 42% tints and quizzes are 30% tints with a dashed edge. Block tools (up, down, edit, delete) sit at the block's foot. Reorders slide via FLIP (240ms, exponential ease-out); reduced motion shows the end state.

### Study Planner (signature: "내 시간표 짜기")
Two pace chip groups (days per week, minutes per session) drive a seven-day mini timetable of the first full study week. Session blocks are course-coloured, their heights follow the session's minutes, and they slide between days when the pace changes. A summary line reports sessions, weeks and the finish day. The chosen pace is stored with the registration.

## Do's and Don'ts

### Do:
- **Do** give every new course a block colour and use that colour everywhere the course appears.
- **Do** draw products as outlined blocks next to filled course blocks, so the course/product split reads without a legend.
- **Do** compute every number on screen from payment and enrollment rows, and label demo data with the lemon "샘플" badge.
- **Do** use a real `<table>` for timetables and data, with tabular numerals.
- **Do** keep motion for state only: block reorders, planner re-pacing, pending spinners.

### Don't:
- **Don't** add KPI tile rows or big-number strips. Summaries are sentences (the ledger line) or table footers.
- **Don't** paint buttons, headings or backgrounds with a block swatch; colour is data.
- **Don't** add an eyebrow or kicker above headings, or number sections that carry no sequence.
- **Don't** use thumbnail images or icon tiles for courses. The curriculum fingerprint (the course's own timetable silhouette) is the course's picture.
- **Don't** animate layout properties (height, width, top) or use bouncy easing; slide with transforms.
- **Don't** switch to a dark theme or a cream ground. The world is cool timetable paper.
