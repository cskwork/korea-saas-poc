---
name: 링크잇
description: 제휴 링크와 콘텐츠 수익을 한곳에서 추적 — a supermarket flyer where every link hangs on the shelf as a price label.
colors:
  flyer-red: "oklch(0.565 0.222 27)"
  flyer-red-deep: "oklch(0.47 0.2 27)"
  flyer-red-soft: "oklch(0.95 0.035 25)"
  event-yellow: "oklch(0.895 0.172 96)"
  event-yellow-deep: "oklch(0.82 0.17 88)"
  event-yellow-soft: "oklch(0.965 0.07 100)"
  label-ink: "oklch(0.2 0.015 265)"
  ink-secondary: "oklch(0.4 0.014 265)"
  ink-muted: "oklch(0.49 0.012 265)"
  label-white: "oklch(1 0 0)"
  flyer-paper: "oklch(0.99 0.002 255)"
  shelf-gray: "oklch(0.953 0.005 255)"
  shelf-gray-deep: "oklch(0.915 0.007 255)"
  rail-gray: "oklch(0.84 0.009 255)"
  rail-lip: "oklch(0.7 0.012 255)"
  hairline: "oklch(0.86 0.007 255)"
  market-up: "oklch(0.54 0.21 27)"
  market-down: "oklch(0.5 0.17 258)"
  market-down-soft: "oklch(0.95 0.03 258)"
  confirmed-green: "oklch(0.5 0.13 150)"
  confirmed-green-soft: "oklch(0.95 0.04 150)"
  series-1: "#da151f"
  series-2: "#145ec1"
  series-3: "#dc8900"
  series-4: "#23864b"
  series-5: "#8e3b86"
  series-other: "#9a9fa6"
typography:
  display:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.2
  price-hero:
    fontFamily: "Archivo, Pretendard Variable, sans-serif"
    fontSize: "clamp(3.25rem, 2rem + 4.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 72"
  price:
    fontFamily: "Archivo, Pretendard Variable, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
    lineHeight: 1.35
  body:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum'"
  label:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  label: "2px"
  control: "3px"
  sticker: "50%"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
components:
  button-primary:
    backgroundColor: "{colors.flyer-red}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.flyer-red-deep}"
  button-secondary:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "42px"
  button-secondary-hover:
    backgroundColor: "{colors.event-yellow-soft}"
  input:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  chip-status:
    textColor: "{colors.confirmed-green}"
    backgroundColor: "{colors.confirmed-green-soft}"
    rounded: "{rounded.label}"
    padding: "1px 7px"
  shelf-label:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.label}"
    padding: "12px 12px 10px"
  shelf-label-promo:
    backgroundColor: "{colors.event-yellow}"
  store-band:
    backgroundColor: "{colors.flyer-red}"
    textColor: "{colors.label-white}"
    height: "56px"
  flyer-band:
    backgroundColor: "{colors.event-yellow}"
    textColor: "{colors.label-ink}"
---

# Design System: 링크잇

## Overview

**Creative North Star: "The Shelf Label"**

링크잇 is built from a Korean supermarket's weekly flyer (마트 전단지) and the price labels clipped to its shelves (매대 가격표). Every affiliate link is a product on the shelf, and its label shows what the link has *earned*, not what the product costs. The page is flyer paper: a red store band at the top, yellow event bands that own whole regions, ink-black text, and gray shelf rails that the labels clip onto. Money is always a price: condensed heavy numerals with a small 원.

The system is an operating tool first. The flyer grammar lives in precise, functional places — the price numerals, the 단위가격 box that reads 클릭당 수익, the barcode that copies the short link, the round price-gun stickers — while tables, forms and navigation stay plain and familiar. Density is welcome: a marketer reads twelve labels, a ledger of orders and a comparison table without scrolling a hero away. Light theme, from the scene: an evening desk or a daytime commute, copy drafted for white blog pages.

The legacy teal/indigo SaaS dashboard (four KPI cards, a line chart and a donut on gray) is the rejected reference.

**Key Characteristics:**
- Red store band, yellow flyer bands, white flyer paper, gray shelf rails.
- Prices in condensed heavy numerals (Archivo, width 72) with a small Pretendard 원.
- Headings in a signboard face (Black Han Sans); everything else in Pretendard.
- Square-ish corners (2–3px), 1.5px ink rules, no drop shadows.
- Korean market colour convention: red rises, blue falls.
- One signature interaction: 스캔 복사 (scan the barcode to copy the short link).

## Colors

A flyer palette at full commitment: red and yellow own regions, ink carries text, gray carries the shelf.

### Primary
- **Flyer Red** (oklch(0.565 0.222 27)): the store band, the primary action, and every earned amount (price numerals). Also the scanner laser and the round stickers (1위, 최고, 품절).
- **Flyer Red Deep** (oklch(0.47 0.2 27)): hover and border of the primary button, commission figures in dense tables, destructive text.

### Secondary
- **Event Yellow** (oklch(0.895 0.172 96)): page header bands (the flyer's category band), the top-earning "promo" label, the active nav tab, text selection and the focus ring on red.
- **Event Yellow Deep / Soft** (oklch(0.82 0.17 88) / oklch(0.965 0.07 100)): borders and fills of info notices, the commission preview, the disclosure quote in drafts, button hover.

### Neutral
- **Label Ink** (oklch(0.2 0.015 265)): all primary text, 1.5px rules around labels, panels and tables, the goal track's frame, click bars in charts.
- **Ink Secondary / Muted** (oklch(0.4 0.014 265) / oklch(0.49 0.012 265)): notes, table headers, placeholders; both clear 4.5:1 on white.
- **Label White** (oklch(1 0 0)): labels, panels, inputs.
- **Flyer Paper** (oklch(0.99 0.002 255)): the page field below the bands.
- **Shelf Gray / Deep** (oklch(0.953 0.005 255) / oklch(0.915 0.007 255)): paused/expired rows, form item wells, skeleton bones, the footer.
- **Rail Gray + Rail Lip** (oklch(0.84 0.009 255) / oklch(0.7 0.012 255)): the shelf rail strip and its darker lip; dashed empty-state borders.

### Status
- **Market Up / Down** (oklch(0.54 0.21 27) / oklch(0.5 0.17 258)): ▲/▼ deltas. Red is up, blue is down, never green/red.
- **Confirmed Green** (oklch(0.5 0.13 150)): 판매 중 and 구매 확정 chips, success notices only.

### Chart series
Fixed categorical order, validated for colour-vision separation: series-1 red, series-2 blue, series-3 amber, series-4 green, series-5 plum, series-other gray. Programs take a slot by their position, never by rank.

### Named Rules
**The Price Is Red Rule.** An earned amount is always red condensed numerals; nothing else in the UI wears red text except errors and destructive actions.

**The Region Rule.** Yellow and red paint whole bands (header, page band, promo label), never small decorative accents on gray.

## Typography

**Display Font:** Black Han Sans (with Pretendard Variable)
**Figure Font:** Archivo, variable width at 72 (with Pretendard Variable)
**Body Font:** Pretendard Variable (loaded globally)

**Character:** Signboard lettering for headings, a price-label numeral for money, and a neutral Korean UI sans for everything that is read or operated.

### Hierarchy
- **Display** (400, clamp(1.75rem → 2.5rem), 1.1): page band titles and the dashboard headline sentence.
- **Headline** (400, 1.3125rem, 1.2): section titles, form panel titles.
- **Price Hero** (800, clamp(3.25rem → 6rem), 0.95, wdth 72): the month's earnings on the dashboard.
- **Price** (800, 1.25–2.75rem, 0.95, wdth 72): label prices, summary strip figures, goal percentage.
- **Title** (Pretendard 800, 0.9375rem): product names on labels and rows.
- **Body** (Pretendard 400, 0.9375rem, 1.55, tabular numerals): tables, forms, notes. Draft previews run at 1rem/1.8 within 68ch.
- **Label** (Pretendard 700, 0.75rem): table headers, field labels, chips, small print.

### Named Rules
**The Signboard Stops at Headings Rule.** Black Han Sans never sets buttons, labels, data or body text.

**The Small 원 Rule.** The currency unit sits at 0.42em beside a price numeral, in Pretendard 800.

## Layout

Content sits in a 1320px column with a clamp(16px, 3vw, 40px) gutter. Every screen opens with a full-bleed yellow band (title, one-line lead, actions) closed by a 3px ink rule; the dashboard's band is a two-column flyer (5fr headline and goal, 7fr daily bars and a ruled small-print strip). Below, sections stack with 48px between them and 16px between a section heading and its content; two-column splits run 7fr/5fr or content/360px form. Spacing follows a 4pt scale (4, 8, 12, 16, 24, 32, 48, 64).

Responsive behaviour is structural: at 1080px the band and two-column splits collapse to one column and the nav becomes a store-directory panel; at 900px the link shelf table turns into stacked labels; at 760px ledgers become cards with inline field names. Shelf rails scroll horizontally with snap on narrow screens instead of wrapping.

## Elevation & Depth

Flat by construction: a printed flyer has no shadows. Depth comes from rules and ground changes — 1.5px ink borders around labels and panels, the gray shelf rail behind labels, and the rail's flat darker lip (an inset band, not a gradient). The only shadow is a 2px paper-coloured ring around chart markers so they read over bars.

### Named Rules
**The Printed Rule.** No drop shadows, no blur, no glass. If something needs to stand out, give it a band of colour or a heavier rule.

## Shapes

Corners are nearly square: labels 2px, controls and panels 3px. Round shapes are reserved for price-gun stickers (circles rotated −8° to −10°: 샘플, 1위, 최고, 품절) and chart markers. Dashed borders mean "empty" or "danger zone"; solid ink borders mean content.

## Components

### Buttons
- **Shape:** near-square (3px), 42px tall (34px small), 2px border.
- **Primary:** flyer red fill, white text, deep red border; hover deepens to flyer red deep.
- **Secondary:** white fill, ink border and text; hover takes the yellow-soft fill.
- **Quiet:** underlined text button for low-weight actions (목표 금액 바꾸기, 모든 링크 보기).
- **Danger:** white with red border and deep-red text; always behind an inline second step ("정말 삭제할까요?").
- **Pending:** a spinning loader icon and a Korean progress label ("기록 중…"); disabled while pending.

### Chips
- **Style:** 1.5px border in the text colour, 2px corners, 0.75rem bold. Tones: ink, muted, green (판매 중/구매 확정), red (판매 종료/취소), blue, solid yellow (Claude 작성).

### Cards / Containers
- **Panels:** white, 1.5px ink border, 3px corners, 24px padding. Never nested inside another bordered panel.
- **Notices:** tinted fill with a same-colour border; success notices stamp in (scale 1.12 → 1, 180ms).

### Inputs / Fields
- **Style:** white, 1.5px rail-lip border, 3px corners, 44px tall, 1rem text; unit suffix (원, %) set inside the right edge.
- **Focus:** ink border plus a 3px event-yellow ring.
- **Error:** red border on red-soft fill; the message sits under the field and is linked with aria-describedby.

### Navigation
- **Store band:** 56px flyer red with a 3px yellow bottom rule; wordmark in Black Han Sans with a yellow tag mark; nav items in Pretendard 600 white; the current page is an ink-on-yellow tab. Under 1080px a 메뉴 button opens a full-width directory panel (deep red) listing every aisle with a short hint.

### Shelf Label (signature)
A link as a shelf-edge price label: program and category over a ruled line, the product name (2 lines max), a boxed 단위가격 reading 클릭당 수익 on the left and the earned amount as a red price on the right, a line of small print (클릭 · 판매 · 전환), and a Code 39 barcode of the short code. The top earner is a yellow promo label with a red 1위 sticker; paused and expired links sit on shelf gray with a muted price. Labels sit on a gray rail and only move once: a freshly registered label clips on (−10px, −1.5° → rest, 220ms).

### Scan Copy (signature interaction)
The barcode is the copy button. Pressing it sweeps a 3px red scanner line across the bars (280ms) and stamps a small red "복사됨" pill. Under reduced motion the sweep and stamp are skipped and only the status text changes.

### Charts
Single-series square columns (red for revenue, ink for clicks) on hairline grids with a 1.5px ink baseline; today's column is the opposite colour; days with orders carry a red dot. Hover or arrow keys move a dark readout; a hidden table carries every value. Shares use one stacked bar with a legend that always names values and percentages.

## Do's and Don'ts

### Do:
- **Do** show every earned amount as a red Archivo price with a small 원.
- **Do** open every screen with a yellow flyer band and a 3px ink rule.
- **Do** keep sample data labelled: the 샘플 sticker in the store band and the footer note.
- **Do** use red ▲ for rises and blue ▼ for falls, and show a change that rounds to zero as 변화 없음.
- **Do** put destructive actions behind an inline confirmation step.

### Don't:
- **Don't** use drop shadows, blur, glass or gradients; the flyer is printed.
- **Don't** set buttons, labels or data in Black Han Sans.
- **Don't** colour deltas green/red; this is a Korean market convention (red up, blue down).
- **Don't** place a small label or kicker above a heading; state tags are corner stickers.
- **Don't** animate labels on page load; only a newly registered label moves.
- **Don't** return to the four-KPI-card dashboard of the legacy POC.
