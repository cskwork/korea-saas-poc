---
name: 스마트셀러
description: 도매 소싱부터 발주·마진까지, 남는 돈이 보이는 가판대
colors:
  pop: "#dcf23c"
  pop-strong: "#c3dc1c"
  pop-wash: "#f1fbb4"
  ink: "#1b1d24"
  ink-2: "#4a4f5a"
  ink-3: "#646a75"
  loss: "#c9281e"
  loss-wash: "#fbe5e1"
  tape: "#d6ad70"
  tape-ink: "#43300f"
  floor: "#e2e5e1"
  floor-sunk: "#d5d9d4"
  slip: "#fcfdfb"
  slip-alt: "#f3f5f2"
  rule: "#dadfd9"
  rule-strong: "#a3aaa2"
  chart-cost: "#2b2f3a"
  chart-mid: "#5f6571"
  chart-light: "#979da8"
typography:
  display:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  tag-price:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  section:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  slip-title:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
  meta:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  paper: "4px"
  stamp: "3px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  gutter-desktop: "44px"
  gutter-mobile: "16px"
components:
  button-primary:
    backgroundColor: "{colors.pop}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "0 14px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.pop-strong}"
  button-secondary:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "0 14px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.loss}"
    rounded: "{rounded.paper}"
    padding: "0 14px"
    height: "40px"
  slip:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "16px 20px 20px"
  hang-tag:
    backgroundColor: "{colors.pop}"
    textColor: "{colors.ink}"
    padding: "34px 22px 18px"
    width: "232px"
  margin-chip:
    backgroundColor: "{colors.pop}"
    textColor: "{colors.ink}"
    padding: "3px 8px 3px 12px"
  margin-chip-loss:
    backgroundColor: "{colors.loss-wash}"
    textColor: "{colors.loss}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "8px 12px"
    height: "42px"
  status-new:
    backgroundColor: "{colors.pop}"
    textColor: "{colors.ink}"
    rounded: "{rounded.stamp}"
    padding: "2px 8px"
  status-shipping:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
    rounded: "{rounded.stamp}"
    padding: "2px 8px"
---

# Design System: 스마트셀러

## Overview

**Creative North Star: "새벽 도매시장 가판대 (the wholesale stall at dawn)"**

The console is a Dongdaemun-style wholesale stall, not a SaaS dashboard. The page is a cool cement floor under white tube light; every list and form sits on a white 장끼 slip (the wholesale receipt) with a dashed tear rule under its heading; and the one object that carries the product's promise is a fluorescent POP hang tag, lettered in heavy signboard gothic, that says what the seller actually keeps after cost, the Naver category fee and shipping. Profit is written in black marker (흑자), loss in red marker (적자), exactly as Korean bookkeeping says it.

This is an Operate surface: sellers confirm 발주, enter tracking numbers, list items and check margins in short sessions. Expression lives in a few precise objects (the tag, the highlighter, the slip) and never in the controls' affordances. Everything else is quiet, dense and legible: Pretendard with tabular numerals, thin rules, ink-tone charts.

**Key Characteristics:**
- Cool cement ground, white slips, marker-black ink, one fluorescent yellow.
- The POP hang tag (clipped top corners, punched hole) is the only signature object; its price is set in Black Han Sans.
- 흑자 black / 적자 red is the whole semantic palette for money.
- 형광펜 (highlighter) strokes mark the current place and whatever needs action.
- Receipt lines with dotted leaders itemise every margin.

## Colors

A restrained world: neutrals of cement and paper, marker inks, and one fluorescent accent that is treated as a material (the POP card and the highlighter), not as decoration.

### Primary
- **POP Fluoro** (`pop`): the fluorescent card stock of Korean retail price cards. Hang tags, margin chips, the current-nav highlighter stroke, the primary action, the 신규주문 stamp, low-competition keyword marks. A green-leaning yellow, deliberately not Kakao's warm yellow and not Naver green. Hover darkens to `pop-strong`; `pop-wash` backs success notices.

### Secondary
- **Red Marker** (`loss`): 적자 only. Loss figures, the loss hang tag's lettering, cancel strike-throughs, destructive buttons, overdue orders, field errors. `loss-wash` backs the loss chip and error notices.
- **Box Tape** (`tape`, text `tape-ink`): kraft packing tape; used only for the 배송중 status stamp (the parcel is sealed and moving).

### Neutral
- **Cement Floor** (`floor`): the page ground and the rail. `floor-sunk` for rail hover and skeletons.
- **Slip Paper** (`slip`): every content surface. `slip-alt` for filter bars, paused rows and table hovers.
- **Marker Ink** (`ink`, `ink-2`, `ink-3`): primary text, secondary text (safe on the floor), tertiary text (slips only; it drops below 4.5:1 on the floor).
- **Rules** (`rule`, `rule-strong`): row dividers and the dashed tear rule / input borders.
- **Chart inks** (`chart-cost`, `chart-mid`, `chart-light`): costs and context series in charts; the story series is always ink plus POP.

### Named Rules
**The 흑자·적자 Rule.** Money has two inks: black when the seller keeps something, red when they lose. Never green for profit, never red for a revenue drop.

**The One Fluoro Rule.** POP yellow is a material with a job (a tag, a highlighter stroke, the one primary action per area). Dense rows use the secondary button so a column of yellow never drowns the margin tags.

## Typography

**Display Font:** Black Han Sans (검은고딕), loaded with `next/font` in the module.
**Body Font:** Pretendard Variable (global).

**Character:** the heavy signboard gothic of market signs and POP cards for page titles and tag prices; a clean Korean workhorse sans for everything the seller reads or types.

### Hierarchy
- **Display** (400, 2.375rem, 1.1; 1.875rem under 720px): page titles only, one per page, often a full sentence ("발주 확인할 주문이 8건 있어요").
- **Tag price** (400, 1.875rem on list tags, 2.75rem on the large tag): prices and 남는 돈 on hang tags only.
- **Section** (800, 1.25rem): headings between slips on the overview.
- **Slip title** (700, 1.0625rem): the heading of each slip.
- **Body** (400, 0.9375rem, 1.55): copy and table text; ledes cap at ~68ch.
- **Label** (700, 0.8125rem): field labels, buttons, filter labels.
- **Meta** (500, 0.75rem): order numbers, timestamps, legends, hints.

### Named Rules
**The Signboard Rule.** Black Han Sans appears only in page titles, the wordmark and hang-tag figures. Never in buttons, labels, tables or data columns.

**The Tabular Rule.** Every column of money, counts and order numbers uses tabular numerals; large standalone figures (tag prices, KPI strip) keep proportional digits.

## Layout

- Desktop: a 236px floor-directory rail (wordmark on a small hang tag, seven stalls, sample-data note, reset, hub link) beside a working column capped at 1200px with 44px gutters.
- Under 1024px the rail becomes a sticky top bar (wordmark, 샘플 데이터, 초기화, hub arrow) over a horizontally scrolling stall strip; content gutters drop to 16px.
- Work surfaces are two-column where the task pairs an editor with its live tag (listing editor, manual listing, calculator: form left, sticky tag panel right) and collapse to one column under 960–1024px with the tag panel first.
- Dense tables become stacked label/value rows under 860px (sourcing board); wide tables scroll inside their slip, never the page.
- Filters sit in one row on a `slip-alt` bar above the results they scope; results dim to 55% while the server re-renders.
- Spacing rhythm: 6 / 10 / 16 / 20 / 24px; more space above a section heading than below it.

## Elevation & Depth

Paper on a floor: slips lift off the cement with a short, soft shadow; nothing else floats except dialogs and toasts.

### Shadow Vocabulary
- **Slip** (`0 1px 0 rgb(27 29 36 / .05), 0 4px 12px -6px rgb(27 29 36 / .22)`): every slip.
- **Lift** (`0 2px 0 rgb(27 29 36 / .06), 0 10px 22px -10px rgb(27 29 36 / .3)`): dialogs, toasts, chart tooltips.
- **Tag drop** (`drop-shadow(0 3px 3px rgb(27 29 36 / .16))`): the hang tag, applied to its wrapper so it follows the clipped silhouette and the punched hole.

### Named Rules
**The Paper Rule.** Declare depth once: slips have a shadow and no border; inputs and buttons have a border and no shadow.

## Shapes

- Paper cut corners: 4px on slips, buttons and inputs; 3px on status stamps.
- The hang tag: rectangle with 12px (16px large) clipped top corners and a punched hole at top centre; list tags hang slightly askew (−1.6° to 1.5°), editor tags hang straight.
- The margin chip: a small tag pointing left (arrow notch on its left edge).
- Pills only for counts (the 발주 대기 badge).

## Components

### Buttons
- **Primary (POP card):** fluoro fill, 1.5px ink outline, 700 label, 40px tall; hover `pop-strong`; pressed nudges 1px down; disabled 55% opacity; pending shows a spinning loader and `aria-busy`.
- **Secondary:** slip fill with the same ink outline. **Ghost:** no outline, ink-2 text, floor-sunk hover. **Danger:** red outline and text; the confirm step uses a solid red button.
- One primary per area; dense rows use secondary or small (32px) buttons.

### Chips (status stamps)
- Rubber-stamp rectangles with a 1px border: 신규주문 on POP, 발주확인 on paper, 배송중 on box tape, 배송완료 in quiet grey, 취소 in red with a strike-through, 판매중지 with a dashed border.

### Cards / Containers
- **Slip:** white paper, 4px corners, slip shadow; heading row with a 1.5px dashed tear rule beneath; bodies pad 16–20px. Tables and queues run flush to the slip edges.

### Inputs / Fields
- White field, 1px `rule-strong` border, 42px tall; hover darkens the border to ink-2; focus turns it ink with a 3px POP ring. Money inputs are right-aligned tabular. Errors turn the border red and print the message under the field, linked with `aria-describedby`.
- Segmented choices (도매처, 판매 상태, 주문 상태) are radio groups in one ink-outlined strip; the checked segment is POP.

### Navigation
- The rail lists seven stalls with 18px lucide icons; the current stall's label gets a highlighter stroke that draws in from the left (220ms). The 주문 stall carries an ink pill with the waiting count in POP numerals.

### Hang Tag (signature)
- Caption (판매가 / 권장 판매가), price in Black Han Sans, dashed rule, 남는 돈 with sign, margin rate, and on the large tag a tone stamp (넉넉한/무난한/박한 마진, 적자). In live editors the figures re-ink left-to-right (220ms clip reveal) as values change and flip to red lettering at break-even. With no price yet it shows an instruction instead of zeros.

### 장끼 Receipt
- Label, dotted leader, right-aligned amount; the total line sits under a 1.5px ink rule. Used for the margin breakdown and the 7-day tally.

### Charts
- Emphasis form: the story series (남는 돈) is a 2px ink line over a POP wash; revenue is a grey context line; orders are grey columns with 4px rounded tops. Hairline solid gridlines, a shared crosshair and tooltip, arrow-key navigation, a direct end label, and a 표로 보기 table twin.

## Do's and Don'ts

### Do:
- **Do** put what the seller keeps next to every price: a hang tag, a margin chip or a receipt line.
- **Do** mark needs-action items with the highlighter or the POP stamp, and retract the mark when the item is handled.
- **Do** label sample data wherever it could be mistaken for a real store's numbers.
- **Do** keep charts in ink tones with the one story series emphasised; legends and tables carry identity, not color alone.

### Don't:
- **Don't** use green for profit or turn the console into a Naver-green dashboard; the product must not look like the platform it serves.
- **Don't** set buttons, labels or table data in Black Han Sans.
- **Don't** stack yellow: no POP buttons down a table column next to POP margin chips.
- **Don't** add kicker or eyebrow labels above headings, emoji icons, gradient text, side-stripe borders or glass panels.
- **Don't** fake product photography; items are represented by their name, supplier, category and tag.
