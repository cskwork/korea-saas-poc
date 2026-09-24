---
name: AI 콘텐츠 대행
description: Drafts delivered as press proofs (시안) on a cutting mat, not chat replies.
colors:
  cutting-mat: "#22524a"
  cutting-mat-deep: "#183d37"
  mat-ink: "#eef7f3"
  mat-ink-muted: "#bcd6cc"
  light-table: "#e5ebe9"
  proof-paper: "#fbfcfc"
  proof-paper-shade: "#f0f3f3"
  key-ink: "#15191b"
  key-ink-2: "#485357"
  key-ink-3: "#626d71"
  hairline: "#d6dcde"
  hairline-strong: "#8e999d"
  process-magenta: "#d8006b"
  process-magenta-deep: "#b0005a"
  process-cyan: "#00a0e3"
  process-cyan-ink: "#00628f"
  process-yellow: "#ffe100"
  process-yellow-soft: "#fff5a6"
  process-yellow-ink: "#5e4f00"
  spot-orange: "#ff6b1a"
  spot-orange-ink: "#9f3c06"
  correction-red: "#b3212f"
typography:
  display:
    fontFamily: "Hahmlet, Pretendard Variable, Apple SD Gothic Neo, serif"
    fontSize: "clamp(2.5rem, 6.2vw, 5rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Hahmlet, Pretendard Variable, serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Hahmlet, Pretendard Variable, serif"
    fontSize: "clamp(22px, 2.6vw, 30px)"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, Noto Sans KR, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-reading:
    fontFamily: "Hahmlet, Pretendard Variable, serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.9
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  sheet: "2px"
  control: "4px"
  toast: "6px"
  chip: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 32px)"
  section: "clamp(72px, 10vw, 128px)"
  sheet-pad: "clamp(24px, 5vw, 64px)"
  control-gap: "8px"
components:
  button-action:
    backgroundColor: "{colors.process-magenta}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-action-hover:
    backgroundColor: "{colors.process-magenta-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.key-ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-ghost-pressed:
    backgroundColor: "{colors.key-ink}"
    textColor: "{colors.proof-paper}"
  input-field:
    backgroundColor: "#ffffff"
    textColor: "{colors.key-ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "52px"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.mat-ink}"
    rounded: "{rounded.chip}"
    padding: "0 18px"
    height: "44px"
  chip-filter-pressed:
    backgroundColor: "{colors.proof-paper}"
    textColor: "{colors.key-ink}"
  proof-sheet:
    backgroundColor: "{colors.proof-paper}"
    textColor: "{colors.key-ink}"
    rounded: "{rounded.sheet}"
    padding: "clamp(28px, 4vw, 48px) clamp(22px, 4vw, 52px)"
---

# Design System: AI 콘텐츠 대행

## Overview

**Creative North Star: "The Proof Table" (시안 테이블)**

Everything the agency hands over is a 시안, the press proof every Korean shop owner has signed off at a print shop. Work lies as trimmed white sheets on a green self-healing cutting mat: crop marks inside the trim, a CMYK colour bar, a slug line with job details, and magenta proofreading marks where a person would circle something. The page alternates between the dark mat (where finished sheets are laid out) and a pale light-table (where work is ordered and drafted), so the scroll reads like walking along a print-shop bench.

The system is committed, not decorative: the mat carries 30–60% of the page, the sheets carry all reading content, and process colours are working signals (content type and action) rather than ornament. Density is moderate: sheets have generous margins, controls are compact and squared like print-shop forms.

**Key Characteristics:**
- Green cutting-mat field with a 24px / 120px ruled grid; plain pale light-table sections between.
- Cool white proof sheets with inset crop marks, 2px corners and a real paper shadow; hero and portfolio sheets sit slightly rotated.
- Myeongjo display (Hahmlet) set heavy; Pretendard for every control and label.
- Process magenta is the only action colour; cyan, yellow and spot orange label the three content types.
- One authored motion: a proof prints plate by plate and gets stamped.

## Colors

A print-shop palette: mat green and paper white carry the page, CMYK process inks do the signalling.

### Primary
- **Cutting Mat Green** (cutting-mat): the page field for hero, portfolio and dashboard; its grid lines are mat ink at 8% and 16%.
- **Process Magenta** (process-magenta): every pressable primary action (무료 체험, 콘텐츠 생성하기, 이 시안으로 주문하기, 추천 plan) and proofreading marks (the circle around "AI", 시안/추천 stamps). Deepens to process-magenta-deep on hover.

### Secondary
- **Process Cyan** (process-cyan, text in process-cyan-ink): 블로그 포스트 plate, 진행중 status, plan checkmarks.
- **Process Yellow** (process-yellow, highlight process-yellow-soft, text process-yellow-ink): 상품 설명 plate and the highlighter behind product-copy subheads; text selection.
- **Spot Orange** (spot-orange, text spot-orange-ink): 광고 카피 plate and the underline under ad-copy subheads.

### Neutral
- **Proof Paper** (proof-paper) and **Paper Shade** (proof-paper-shade): sheet surface and pressed/selected fills.
- **Key Ink** (key-ink, key-ink-2, key-ink-3): headings, body, meta text. key-ink-3 is the lightest text allowed on paper.
- **Light Table** (light-table): the generator and pricing sections.
- **Mat Deep** (cutting-mat-deep): scrolled navbar and footer.
- **Hairlines** (hairline, hairline-strong): table rules, dashed perforations, input strokes.
- **Correction Red** (correction-red): field errors and the near-limit counter only.

### Named Rules
**The One Ink Rule.** Process magenta appears only on things you can press or on proofreading marks. A magenta element that does nothing is a bug.

**The Plate Rule.** Content type is always identified by its plate colour (cyan = 블로그, yellow = 상품 설명, spot orange = 광고 카피), as a square chip, never as a tinted card background.

## Typography

**Display Font:** Hahmlet (Google Fonts, 500–900), falling back to Pretendard
**Body Font:** Pretendard Variable (jsDelivr dynamic subset), falling back to Apple SD Gothic Neo / Noto Sans KR

**Character:** A heavy contemporary Myeongjo for anything that is "printed content", paired with a neutral Korean UI sans for everything you operate.

### Hierarchy
- **Display** (800–900, clamp(2.5rem, 6.2vw, 5rem), 1.12): the hero headline only.
- **Headline** (800, clamp(1.9rem, 3.6vw, 2.9rem), 1.2): section titles.
- **Title** (800, 22–30px, 1.3): proof titles, plan names (24px), case titles (700, 18.5px).
- **Body** (400, 16px, 1.6): UI copy and ledes (ledes 15.5–18.5px).
- **Reading** (Hahmlet 500, 17px, 1.9, max 66ch): generated blog drafts.
- **Label** (600, 12.5–13px, tabular figures): slug lines, meta, table headers, counters.

### Named Rules
**The Printed vs Operated Rule.** If it would be printed on the proof, it is Hahmlet; if you click or read it as interface, it is Pretendard.

**The Voice-per-Plate Rule.** Blog drafts read in Myeongjo; product copy uses Pretendard with yellow-highlighted subheads; ad copy uses Pretendard with heavier, spot-underlined subheads.

## Layout

Single column of full-bleed bands, content capped at 1200px with a fluid gutter (16–32px) and 72–128px band padding. The hero is a 7/5 split at ≥1024px (sheet overlapping the key art by 64px); below that the sheet stacks above the art. The generator is a two-column grid at ≥960px (order ticket and proof tray left, proof sheet right, sticky at 84px) and stacks form → proof → tray on smaller screens. Portfolio uses auto-fill columns of min 300px; plans auto-fit at min 290px. The order table becomes stacked rows under 640px with 주문/완료 labels. Navbar collapses to a menu button under 900px.

## Elevation & Depth

Depth is physical: sheets lie on the mat. One paper shadow carries almost everything; the recommended plan and selected plan lift a little further. Controls are flat with strokes.

### Shadow Vocabulary
- **Paper on mat** (`box-shadow: 0 1px 1px rgb(0 0 0 / 0.14), 0 14px 30px -14px rgb(6 26 22 / 0.55)`): every sheet, case and plan.
- **Lifted sheet** (`box-shadow: 0 1px 1px rgb(0 0 0 / 0.14), 0 22px 40px -16px rgb(6 26 22 / 0.6)`): the recommended plan.
- **Selected sheet** (`box-shadow: 0 0 0 3px #15191b, <paper on mat>`): the plan the visitor chose.

### Named Rules
**The Paper Rule.** Only paper casts a shadow. Buttons, chips, inputs and tallies never do.

## Shapes

Paper is almost square (2px); form controls are squared-off (4px); filter chips are the only pills. Dashed 1.5px perforation rules separate a sheet's head, price or actions from its body. Crop marks are 14px L-shapes inset 10px inside every sheet. Stamps are 2px magenta outlines rotated −6°.

## Components

### Buttons
- **Shape:** squared (4px), 44px tall (40px small, 52px large).
- **Action:** magenta fill, white 700 text; hover deepens; press nudges down 1px.
- **Ghost:** transparent with 1.5px key-ink stroke; pressed state inverts to ink.
- **Focus:** 3px outline, magenta on paper, yellow on the mat, 2px offset.

### Chips
- **Style:** pill outline in mat ink on the mat; pressed chip becomes a white paper pill with ink text (`aria-pressed`).

### Cards / Containers
- **Proof sheet:** paper, 2px corners, crop marks, paper shadow, 24–64px padding.
- **Case sheet:** paper with a 148px miniature layout drawn in grey bars and a 6px plate-colour top edge.
- **Order ticket and tray:** paper with a 1px hairline border instead of a shadow (they are forms on the table, not proofs).

### Inputs / Fields
- **Style:** white, 1.5px hairline-strong stroke, 4px corners, 52px tall; label above, counter right-aligned.
- **Focus:** stroke turns key ink plus the focus outline. **Error:** correction-red stroke and message below.

### Navigation
- Transparent over the hero mat, mat-deep at 96% once scrolled; Pretendard 600 links in mat-ink-muted, white on hover; magenta 무료 체험 action at ≥560px; menu button under 900px opens a stacked panel (Escape closes).

### Proof Sheet (signature)
Type tag, timestamp and an N차 시안 stamp head the sheet; the title sits over a hairline; body lines follow the plate's voice; a dashed perforation separates 복사 / 다른 시안 / 이 시안으로 주문하기. On generate the title registers from offset C/M/Y ghosts into black, lines lay down left to right 40ms apart, and the stamp lands last. Reduced motion shows the finished sheet.

### Order Docket
Status tallies double as filters; a search field filters by topic, number or type; a plan allowance strip with a meter sits above the table; each status shows a three-segment track (대기중 → 진행중 → 완료).

## Do's and Don'ts

### Do:
- **Do** put any new reading content on a proof sheet with crop marks, never directly on the mat.
- **Do** mark content type with its plate chip (cyan, yellow, spot orange) and its label text.
- **Do** keep demo figures and generated drafts labelled as POC/demo content.
- **Do** use tabular figures for order numbers, dates, prices and counts.

### Don't:
- **Don't** use process magenta for decoration, headings or non-interactive fills (The One Ink Rule).
- **Don't** give buttons, chips or inputs shadows (The Paper Rule).
- **Don't** add emoji or glyphs as UI icons; icons are the inline SVG set in index.html (1.9–2.2 stroke).
- **Don't** add a label line above section headings; the heading stands alone.
