---
name: 크리에이트잇
description: A one-person design & short-video studio run from a 콘티 sheet — every order is a frame, inked stage by stage.
colors:
  copier-paper: "oklch(0.992 0.002 240)"
  desk-gray: "oklch(0.94 0.006 240)"
  marker-wash: "oklch(0.962 0.007 235)"
  marker-wash-strong: "oklch(0.925 0.01 235)"
  printed-rule: "oklch(0.87 0.006 245)"
  printed-rule-soft: "oklch(0.92 0.005 245)"
  ink: "oklch(0.23 0.014 255)"
  ink-hover: "oklch(0.33 0.014 255)"
  graphite: "oklch(0.46 0.012 250)"
  pencil: "oklch(0.64 0.01 250)"
  non-photo-blue: "oklch(0.76 0.09 228)"
  blue-line: "oklch(0.66 0.11 232)"
  blue-pencil: "oklch(0.5 0.13 245)"
  blue-wash: "oklch(0.955 0.02 230)"
  red-pencil: "oklch(0.555 0.19 27)"
  red-wash: "oklch(0.965 0.02 27)"
  red-deep: "oklch(0.49 0.18 27)"
  selection-blue: "oklch(0.85 0.07 228)"
  chart-ink: "oklch(0.36 0.014 255)"
  chart-blue: "oklch(0.58 0.12 238)"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  subhead:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title-large:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  body-small:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
  form-numeral:
    fontFamily: "Barlow Condensed, Pretendard Variable, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.005em"
    fontFeature: "tnum"
  form-numeral-medium:
    fontFamily: "Barlow Condensed, Pretendard Variable, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.15
    fontFeature: "tnum"
  form-numeral-display:
    fontFamily: "Barlow Condensed, Pretendard Variable, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1
  rough-headline:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "max(9px, 7.6cqw)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
rounded:
  sheet: "0px"
  control: "2px"
  data-end: "4px"
  stamp: "50%"
spacing:
  hairline: "4px"
  tight: "8px"
  group: "12px"
  field: "16px"
  sheet: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.copier-paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
    textColor: "{colors.copier-paper}"
  button-secondary:
    backgroundColor: "{colors.copier-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.copier-paper}"
    textColor: "{colors.red-pencil}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "34px"
  input:
    backgroundColor: "{colors.copier-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    height: "42px"
  nav-cell:
    backgroundColor: "{colors.copier-paper}"
    textColor: "{colors.graphite}"
    padding: "0 16px"
    height: "56px"
  nav-cell-active:
    backgroundColor: "{colors.marker-wash}"
    textColor: "{colors.ink}"
  header-cell:
    backgroundColor: "{colors.copier-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.form-numeral}"
    padding: "14px 16px 16px"
  header-cell-current:
    backgroundColor: "{colors.marker-wash-strong}"
    textColor: "{colors.ink}"
---

# Design System: 크리에이트잇

## Overview

**Creative North Star: "The 콘티 Sheet"**

The studio is run from a storyboard (콘티) sheet: cool copier paper on a pale gray desk, printed with ink-black ruled tables and header blocks of labelled form cells. Every order is a cut on that sheet, drawn as a frame at the deliverable's true aspect ratio (16:9 thumbnail, 9:16 short, 3:1 banner, 1:1 logo, the tall 상세페이지 strip), with the format's non-photo-blue safe-area guides inside. The frame is the unit of the whole product: the dashboard, order list, order page, AI storyboard, price sheet and portfolio all speak through it.

Stage is the drawing medium. An order moves 의뢰접수 → 시안작업 → 수정요청 → 납품완료 and its frame moves with it: dashed blue sketch, graphite pencil line, red correction pencil with a squiggle mark, black ink with a circled OK. The signature moment, 인킹, is the frame redrawing its perimeter in the new medium when the stage changes, and a fresh AI 콘티 drawing its cuts one after another. Everything else stays quiet: light ground chosen for a creator planning at a desk in daylight before opening the editor, dense ruled layouts, restrained color.

This world replaced the legacy POC's dark blue/magenta "creative studio" look, which is not a reference for future work.

**Key Characteristics:**
- One sheet per page: a title block with printed header cells, then ruled content; no floating cards.
- Frames at true aspect ratio carry the product's state; text beside them always names the stage too.
- Ink for structure and primary action, blue pencil for sketch/in-progress and focus, red pencil only for 수정, overdue and destructive.
- Condensed printed-form numerals for cut numbers, counts, D-days, timecodes and prices in header cells.
- Motion only as state: 460ms stroke draw with exponential ease-out; nothing animates on first load.

## Colors

A restrained paper-and-ink palette with two pencil colors that mean something.

### Primary
- **Ink** (`{colors.ink}`, ≈ #191d24): body text, ruled table frames, the 2px top-bar rule, primary buttons, finished (납품) frame lines, the OK stamp.
- **Blue Pencil** (`{colors.blue-pencil}`, ≈ #0068a7): focus rings, caret, aspect labels, "콘티 있음", S#1 scene numbers, template-source tags; the text-safe step of the non-photo-blue family.

### Secondary
- **Red Pencil** (`{colors.red-pencil}`, ≈ #ca322e): 수정요청 stage, overdue and today D-days, revision rounds, destructive buttons and the confirm dialog's action, the monthly goal line.

### Tertiary
- **Non-photo Blue** (`{colors.non-photo-blue}`) and **Blue Line** (`{colors.blue-line}`): safe-area guides and sketch frame outlines only; never text.
- **Chart Ink / Chart Blue** (`{colors.chart-ink}`, `{colors.chart-blue}`): data marks. Closed months and single orders in chart ink, the month in progress and subscriptions in chart blue (an emphasis pair, validated for CVD separation and ≥3:1 against paper).

### Neutral
- **Copier Paper** (`{colors.copier-paper}`): the sheet and every control surface.
- **Desk Gray** (`{colors.desk-gray}`): the page ground around the sheet, also the html background and scrollbar track.
- **Marker Wash / Strong** (`{colors.marker-wash}`, `{colors.marker-wash-strong}`): Copic-style washes for hover, current nav cell, selected filter cell, the frame stage backdrop.
- **Graphite** (`{colors.graphite}`, ≈ #53595f, 7:1 on paper): secondary text, labels, meta lines.
- **Pencil** (`{colors.pencil}`): input borders, unused tally boxes, pencil-stage frame roughs; non-text only.
- **Printed Rule / Soft** (`{colors.printed-rule}`, `{colors.printed-rule-soft}`): hairlines between rows and cells.

### Named Rules
**Selection Blue** (`{colors.selection-blue}`) tints text selection; **Red Deep** (`{colors.red-deep}`) is the hover of the solid danger button and the text on red-wash notices.

**The Pencil Means Something Rule.** Blue is sketch, progress and focus; red is correction, lateness and deletion. A new use of either color must mean one of those, or it is ink or graphite.

**The Paper Rule.** The ground is cool copier paper on a cool gray desk. Never warm it toward cream or ivory.

## Typography

**Display Font:** Pretendard Variable (global)
**Body Font:** Pretendard Variable
**Label/Numeral Font:** Barlow Condensed 500–700 (next/font), for printed-form numerals
**Rough Font:** Black Han Sans (next/font), only inside frames

**Character:** One workhorse Korean sans carries the interface; a condensed gothic does the numbering a production form would print; the thumbnail rough's heavy gothic appears only as the content of a frame, never as UI.

### Hierarchy
- **Display** (800, 28px / 24px under 720px, 1.2, -0.035em): the sheet title in the title block.
- **Headline** (800, 19px, -0.025em): section titles (진행 중인 컷, 월별 납품액); **Title-large** (800, 19px) for package names and the AI 콘티 heading.
- **Subhead** (800, 17px, -0.02em): block titles inside a section (의뢰 내용, 수정 기록, 주문 안내) and dialog titles.
- **Title** (700, 16px, 1.35): cut-row titles, copy lines.
- **Body** (400, 15px, 1.55): prose, facts; **Body-small** (14px) in dense rows; measure capped at 56–64ch.
- **Label** (500–600, 13px): header-cell labels, column heads, meta lines; **Micro** (700, 12px) only for tags and the OK stamp.
- **Form numeral** (Barlow Condensed 600, tabular): 24px header-cell values and cut numbers, 22px D-days and durations, 34px price-sheet prices.

### Named Rules
**The Rough Stays Inside Rule.** Black Han Sans renders only inside a frame as a piece's own copy; below ~9px it is dropped and the frame shows plain copy bars instead.

**The Printed Numeral Rule.** Counts, codes, durations and aspect labels use the condensed numeral face with tabular figures; running prose never does.

## Layout

A centered sheet (max 1320px plus a clamp(16px, 3vw, 32px) gutter) sits 24px below a sticky 56px top bar. Each page opens with a title block: title cell on the left (minmax(280px, 1.35fr)) and a grid of printed header cells (auto-fit, min 112px) on the right, closed by a 2px ink rule. Content is ruled rows, not cards: the cut table's columns are CUT 56px | 화면 176px | 내용 1fr | 진행 200px | 마감 132px, with 14px/12px cell padding and 1px rules.

Spacing moves in 4/8/12/16/24/32px steps; sheet sections pad 24px (16px on phones), with more space above a heading than below it.

Responsive behavior is structural: under 960px the title block stacks and nav folds into a 목차 panel; under 860px cut rows become a three-area grid (number, frame, stacked content); under 720px the sheet goes full-bleed without its shadow, header cells pair up two per row, and wide tables either reflow or scroll inside their own region.

## Elevation & Depth

Flat by default. The only lifted objects are paper on the desk: the sheet (`0 1px 2px` + a soft `0 12px 32px -12px` cool shadow), portfolio pieces pinned to the board, and the confirm dialog. Everything inside a sheet separates by rules and washes, never by shadow.

### Shadow Vocabulary
- **Sheet on desk** (`box-shadow: 0 1px 2px oklch(0.3 0.02 250 / 0.08), 0 12px 32px -12px oklch(0.3 0.02 250 / 0.16)`): the page sheet.
- **Pinned piece** (`box-shadow: 0 1px 2px oklch(0.3 0.02 250 / 0.12), 0 10px 24px -14px oklch(0.3 0.02 250 / 0.35)`): portfolio frames.
- **Floating panel** (`box-shadow: 0 16px 32px -16px oklch(0.2 0.02 250 / 0.3)`, the `--shadow-float` token): the mobile 목차 panel, the chart tooltip and the confirm dialog.

### Named Rules
**The Paper On Desk Rule.** Only whole sheets and pinned pieces cast shadows; a box inside the sheet that needs separation gets a rule.

## Shapes

Printed-form geometry: square sheets and cells, 2px corners on controls, 1px printed rules, 1.5–2.5px drawn frame lines. The only circles are the OK stamp (rotated −12°), the logo frame's construction guide and the shorts frame's action dots. Frames are exact aspect-ratio rectangles; image areas inside them are X-boxes (the layout convention for "picture goes here"), copy is bars or set type.

## Components

### Buttons
- **Shape:** rectangular, 2px corners, 1.5px ink border, 40px tall (34px small, 48px for the intake submit).
- **Primary:** ink fill, paper text, 600 weight; hover lifts to ink-hover.
- **Secondary:** paper fill, ink border and text; hover takes the marker wash.
- **Danger:** paper fill with red-pencil border and text; the confirming action inside the dialog is solid red.
- **Quiet:** underlined graphite text for low-stakes links (전체 보기, 데모 데이터 초기화).

### Inputs / Fields
- **Style:** paper fill, 1px pencil border, 2px corners, 42px tall; label 14px/600 above, hint and error lines below wired with aria-describedby.
- **Focus:** blue-pencil border plus a 2px translucent blue outline.
- **Error:** red-pencil border and a red 13px message naming the fix.

### Navigation
- **Style:** the top bar is a printed header row: wordmark cell, then nav cells divided by rules; the current cell is washed, bold and underlined by a 4px ink bar sitting on the 2px bottom rule; the ink "새 주문 접수" button closes the row.
- **Mobile:** a "목차" toggle opens a two-column grid of the same cells under the bar; the current cell carries a small ink square.

### Header Cells
- **Style:** labelled form cells (13px graphite label, condensed numeral value, optional sub line) in a ruled grid; linked cells act as filters and show the current one washed.

### Cut Row (signature)
- A 콘티 row: cut number, the order's frame at true aspect ratio with its aspect label in blue pencil, title and meta, stage mark (S#n + label), revision tally boxes (filled = used, red = billed beyond the allowance), and the D-day with date and price. The whole row is one link.

### Frame (signature)
- The deliverable drawn at its real ratio with format guides; medium by stage (sketch / pencil / redline / ink). Finished portfolio pieces render as marker comps in their own three colors with the headline set in the rough face. Inking replays the outline draw (pathLength-normalised dash, 460ms, exponential ease-out) with the rough settling in after it; staggered 90ms per cut in the AI storyboard; disabled under reduced motion.

### 콘티 Table
- The AI brief's storyboard: CUT | 화면 | 내용 | 자막·카피 | 시간, with durations as 3″ and start timecodes, and a total length line for video work.

## Do's and Don'ts

### Do:
- **Do** show every order as its frame at the true aspect ratio, and name its stage in text beside it.
- **Do** keep pages as one sheet: title block with printed header cells, then ruled rows.
- **Do** use blue pencil for focus, selection highlights and sketch/in-progress, and red pencil only for 수정, overdue and destructive actions.
- **Do** set counts, codes, D-days and durations in the condensed numeral face with tabular figures.
- **Do** label sample data as 샘플 where a visitor could mistake it for real work.

### Don't:
- **Don't** go back to the dark blue/magenta creative-studio look, neon gradients, KPI tiles or kanban cards.
- **Don't** put cards inside the sheet or shadows on anything inside it.
- **Don't** use Black Han Sans for UI labels, buttons or headings.
- **Don't** use Unicode glyphs or emoji as icons; icons come from lucide at one stroke weight.
- **Don't** warm the paper toward cream or add paper textures; the sheet is clean copier paper.
- **Don't** animate on page load; motion only marks a stage change or a new storyboard.
