---
name: 스마트셀러
description: A seller's desk in the grammar of a Korean trading terminal; products are 종목, margin is the price change, orders are 체결.
colors:
  ground: "oklch(94% 0.006 255)"
  pane: "oklch(99.3% 0.002 255)"
  pane-2: "oklch(96.9% 0.004 255)"
  pane-3: "oklch(93.2% 0.007 255)"
  rule: "oklch(89.5% 0.006 255)"
  rule-strong: "oklch(80% 0.01 255)"
  ink: "oklch(23% 0.03 262)"
  ink-2: "oklch(40% 0.022 262)"
  ink-3: "oklch(50% 0.016 262)"
  bar: "oklch(24% 0.045 263)"
  bar-2: "oklch(30% 0.045 263)"
  bar-ink: "oklch(96% 0.01 255)"
  bar-ink-2: "oklch(78% 0.02 260)"
  up: "oklch(54% 0.2 25)"
  up-strong: "oklch(48% 0.19 25)"
  up-soft: "oklch(95.5% 0.025 20)"
  buy: "oklch(54% 0.2 25)"
  buy-hover: "oklch(48% 0.19 25)"
  down: "oklch(49% 0.17 258)"
  down-soft: "oklch(95.5% 0.022 255)"
  amber: "oklch(55% 0.12 70)"
  amber-soft: "oklch(95.5% 0.04 85)"
  vol: "oklch(78% 0.012 258)"
  focus: "oklch(58% 0.16 258)"
typography:
  figure-xl:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, system-ui, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  figure-md:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    fontFeature: "'tnum' 1"
  body:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, system-ui, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum' 1"
  figure-sm:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
rounded:
  r: "2px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s3h: "14px"
  s4: "16px"
  s5: "20px"
components:
  button-buy:
    backgroundColor: "{colors.buy}"
    textColor: "#ffffff"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "36px"
  button-buy-hover:
    backgroundColor: "{colors.buy-hover}"
    textColor: "#ffffff"
  button-line:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "0 10px"
    height: "30px"
  button-line-hover:
    backgroundColor: "{colors.pane-2}"
    textColor: "{colors.ink}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.pane}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "36px"
  button-ink-hover:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.pane}"
  button-sell:
    backgroundColor: "transparent"
    textColor: "{colors.down}"
    rounded: "{rounded.r}"
    padding: "0 10px"
    height: "30px"
  button-sell-hover:
    backgroundColor: "{colors.down-soft}"
    textColor: "{colors.down}"
  button-ghost:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "0 14px"
    height: "36px"
  input:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "0 10px"
    height: "36px"
  title-bar:
    backgroundColor: "{colors.bar}"
    textColor: "{colors.bar-ink}"
    height: "48px"
  screen-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.figure-sm}"
    padding: "0 16px"
    height: "44px"
  screen-tab-active:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
  pane:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.r}"
    padding: "0 10px"
    height: "26px"
---

# Design System: 스마트셀러

## Overview

**Creative North Star: "The Seller's HTS"**

스마트셀러 is drawn as a Korean home trading system (증권사 HTS): a deep ink-navy title bar, cool grey window chrome, white data panes ruled by 1px hairlines, and dense right-aligned tabular figures. The seller's catalogue is a screener of 종목; each product's 순수익 and 마진율 read as a signed quote; a product opens into a quote panel that ladders 판매가 down to 순수익; orders advance through 체결 stages. Every screen carries a 4-digit 화면번호 (1001, 1002, 2001, 3001, 4001, 5001), shown on its tab and beside its title, and a jump box in the title bar accepts those numbers.

Density is the point. Rows are compact, columns align on one numeric edge, and colour is spent almost entirely on the Korean market law: red for gain, blue for loss. The rest of the screen is ink on grey-white panes. The dark theme is the night HTS skin: same structure and same law, with lifted red and blue for contrast.

The one authored motion is the price tick. When a figure changes, it flashes red if it went up and blue if it went down, then settles. Under reduced motion nothing flashes.

**Key Characteristics:**
- Square panes (2px corners at most), 1px hairline rules, no floating cards.
- Korean market colour law everywhere: red = profit, blue = loss or reversal, in both themes.
- Tabular figures in three fixed sizes; money right-aligned on a shared edge.
- 4-digit 화면번호 on every screen tab, beside every screen title, and in the jump box.
- Status is carried by shape or pattern as well as colour (stage meters, hatched 취소).
- Light "day HTS" and dark "night HTS" skins, following `prefers-color-scheme` with a manual toggle.

## Colors

One closed cool-grey ramp for all structure, one ink-navy for the chrome, and the market pair (red, blue) for every signed figure.

### Primary
- **Rising Red** (`up`): profit, gain, positive change. 순수익 in the screener, ▲ margin quotes, the tape's margin moves, sort arrows, the selected screen tab's top rule and 화면번호, the range slider, the calculator result when profitable, the leading share bar and first rank. Also the brand mark's fill.
- **Order Red** (`buy`, hover `buy-hover`): the fill for the 매수-style order key, the one command per screen that sends something into the loop (AI 등록하기 in the quote panel, listing generation, 테스트 주문 추가, keyword 분석). Same hue as Rising Red in light; darker than it in dark so white text keeps contrast.
- **Falling Blue** (`down`): loss, deduction, reversal. Fee and cost rows in the price ladder, negative results, the 매도-style 취소 button, the 손실 tag, the downward price tick.

### Secondary
- **Ledger Amber** (`amber`, `amber-soft`): the 데모 데이터 tag, the Naver fee segment in the cost stack, medium competition.
- **Volume Grey-Blue** (`vol`): volume bars in the sales chart and the shipping segment in the cost stack.
- **Focus Blue** (`focus`): focus rings and the focused input border only.

### Neutral
- **Window Grey** (`ground`): the page ground behind panes.
- **Pane White** (`pane`), **Pane 2** (`pane-2`), **Pane 3** (`pane-3`): data panes, then table headers, row hover, output fields, then the screen-tab strip and the selected screener row.
- **Hairline** (`rule`) and **Strong Hairline** (`rule-strong`): row rules and cell dividers; input borders, table header underline, active tab frame.
- **Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): primary text; secondary text and labels; tertiary meta and unchanged (보합) figures.
- **Title Bar Navy** (`bar`, `bar-2`) with **Bar Ink** (`bar-ink`, `bar-ink-2`): title bar, quote panel head, toast.

### Named Rules
**The Market Law Rule.** Red (`up`) means profit, gain, or a rise. Blue (`down`) means loss, a deduction, or a reversal such as 취소. The mapping never inverts, and dark mode keeps it. Green never means profit.

**The One Order Key Rule.** Red fills only the 매수-style order key (`buy`), at most one per screen or panel. Neutral per-row actions (AI 등록, 상세) are ink line or ghost buttons and never red.

**The Closed Ramp Rule.** Every neutral comes from the ground / pane / rule / ink ramp. No ad-hoc greys.

## Typography

**Body Font:** Pretendard Variable (Pretendard, -apple-system, system-ui, Apple SD Gothic Neo, Malgun Gothic fallback), loaded from the jsDelivr dynamic subset.

**Character:** A single Korean workhorse sans set with tabular numerals throughout. Rank comes from weight (400 to 800) and hairline rules rather than from size.

### Hierarchy
- **Figure XL** (800, 1.75rem / 28px, 1.1, -0.02em): the one big number per view. Quote panel 순수익, calculator result, order tally counts.
- **Headline** (800, 1.375rem, 1.25, -0.025em; 1.25rem on mobile): screen titles, preceded by the bordered 화면번호.
- **Title** (700, 0.9375rem, -0.01em): pane titles and block heads.
- **Figure MD** (700 to 800, 0.9375rem / 15px): ladder totals, index board values, rank amounts, quote-strip values.
- **Body** (400, 0.875rem, 1.55; 0.9375rem on mobile): running text and ledes (max 70ch). `word-break: keep-all`.
- **Figure SM** (400 to 700, 0.8125rem / 13px): every data grid cell, tape items, readouts, stack keys.
- **Label** (600, 0.75rem / 12px): field labels, table header cells, tally labels, meta lines, status and competition tags.

### Named Rules
**The Three Figures Rule.** Figures (money, percentages, counts) use exactly three sizes: 13px (`fs-sm`), 15px (`fs-md`), 28px (`fs-xl`). The 12px label size (`fs-xs`) is for labels and identifiers, never for a figure.

**The Tabular Everywhere Rule.** `font-variant-numeric: tabular-nums` is set on the body; money is right-aligned so columns share one numeric edge.

## Layout

- **Desk:** max width 1440px, padded 20px (14px 12px on mobile). Screens are a vertical stack at 16px gaps: screen head (화면번호 + title + lede, count at the right), filter bar, then panes.
- **Chrome:** sticky 48px title bar; a 30px quote tape (horizontal scroll, no scrollbar); a sticky 44px screen-tab strip under the title bar.
- **Quote panel placement:** at 1024px and wider the quote panel docks non-modally beside the screener as a sticky 380px column (the 수수료 column drops to make room). Between 720px and 1023px it is a modal panel from the right (min(440px, 100vw), full height). Below 720px it is a bottom sheet (max 92dvh).
- **Declared column tiers:** at 1180px and below the screener's 수수료 column and the clock drop. At 960px and below split panes stack, the order tally goes from six cells to three, the index board from four to two, and secondary columns drop. Below 720px table rows become two- or three-line quote rows on a CSS grid with per-cell labels, and table headers hide.
- **Mobile tab bar:** below 720px the screen tabs become a fixed bottom bar (62px plus safe area), icon over label, and each tab keeps its 4-digit 화면번호. The toast rises above it.
- **Rhythm:** 4px base; gaps of 4, 8, 12, 16, 20; 10px and 14px are used as cell and pane paddings.

## Elevation & Depth

Flat. Panes sit on the ground, separated by 1px hairlines and tonal steps (ground, pane, pane-2, pane-3). One shadow token exists, and only floating layers use it: the modal or sheet quote panel and the toast. When the quote panel docks at 1024px and wider it loses its shadow and takes a strong hairline frame.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 10px 30px oklch(20% 0.03 262 / 0.16), 0 2px 6px oklch(20% 0.03 262 / 0.08)`; dark: `0 14px 40px oklch(5% 0.01 262 / 0.6), 0 2px 8px oklch(5% 0.01 262 / 0.4)`): modal quote panel, bottom sheet, toast.

### Named Rules
**The Ruled Pane Rule.** Anything that is part of the desk is ruled onto it, never lifted off it. Only floating layers cast a shadow.

## Shapes

Square window geometry: a 2px radius on panes, buttons, inputs, chips and thumbnails, and 0 on tags, meters, the tape and the ladder. 1px hairlines divide everything; a 2px bar marks selection (red at the top of the active screen tab, ink at the bottom of the pressed tally cell). Drawn marks do the work of state: filled triangles (▲▼ as SVG) for direction, a four-cell stage meter for order progress, 135° hatching for cancelled orders, a dashed frame for the empty source slot in AI 등록.

## Components

### Buttons
Compact terminal keys: 36px tall (30px small, 42px block), 2px corners, 600 weight, 1px press-down on active.
- **Buy (매수):** Order Red fill, white text. The one order key per screen or panel.
- **Line:** Pane White with an Ink 3 border, 700 weight; hover to Pane 2 with an Ink border. The default per-row action (AI 등록).
- **Ink:** Ink fill with pane text; confirming commands that record or advance (상품 등록 저장, 계산하기, 처리중으로, 배송중으로).
- **Sell (매도):** transparent with a Falling Blue text and a half-strength blue border; hover fills Down Soft. Reversing actions (취소).
- **Ghost:** Pane White with a Strong Hairline border; secondary actions (상세, 조건 초기화).
- **Link:** underlined Ink 2 text at 12px for low-emphasis actions.

### Chips
- **Style:** 26px, 2px corners, Strong Hairline border on Pane White, 12px 600 text.
- **Saved keyword chip:** split into a main part (red star) and a remove part behind a hairline divider.

### Inputs / Fields
- **Style:** 36px (42px on mobile at 16px text to avoid iOS zoom), Strong Hairline border, Pane White ground, 2px corners; numbers right-aligned. Labels sit above in 12px 600 Ink 2.
- **Focus:** border turns Focus Blue with a 3px 22% Focus Blue halo.
- **Select:** native appearance removed; a drawn two-triangle caret.
- **Filter bar:** one ruled pane holding search, selects, the margin slider (red thumb, red value) and reset.

### Navigation
- **Title bar:** ink-navy, wordmark with the red brand mark and a hairline-divided sub label, the 화면 jump box (4-digit entry), the 데모 데이터 amber tag, clock, theme toggle.
- **Screen tabs:** HTS window tabs on the Pane 3 strip. Each shows icon, 화면번호, label. The active tab becomes a Pane White folder tab framed in Strong Hairline, with a 2px red top rule and a red 화면번호. A red count badge marks new orders.
- **Mobile:** fixed bottom bar, same active red rule, icon turns red; 화면번호 stays under the label.

### Screener grid (signature)
Sticky Pane 2 header in 12px labels, 1px row rules, 44px product thumbnails with a bordered product code tag, right-aligned money. 순수익 in Rising Red, 마진율 as a signed quote (▲ + percentage) over a 3px margin meter. Row click selects the row (Pane 3) and opens the quote panel.

### Quote panel and price ladder (signature)
Navy head with the product name; a 140px image beside the Figure XL 순수익 and signed margin; then the price ladder: 판매가 down through fee and cost rows in Falling Blue to a total row above a 1px Ink rule. Buy button and Ghost button stacked below.

### Order tally and stage meter
Six cells in one ruled strip (전체, 신규주문, 처리중, 배송중, 배송완료, 취소), each a pressable filter with a stage mark and a Figure XL count; the pressed cell gets a 2px ink bottom bar. In rows, a four-segment stage meter fills in Ink per stage; 취소 is hatched and its row is struck through in Ink 3, so status never depends on colour.

### Quote tape
30px strip of hairline-divided items: product name, signed red margin, 순수익. It scrolls horizontally without a visible scrollbar.

### Price tick (signature motion)
A changed figure or row flashes its background from 22% (16% for rows) Rising Red when the value went up, or Falling Blue when it went down, fading over 700ms (900ms for rows) on the expo ease-out. Used on the product count, new listings, advanced or cancelled orders, calculator history and keyword stats. No flash under reduced motion.

### Generated listing output
AI 등록 output sits in Pane 2 boxes with hairline borders (title, description, tags), each with a 12px label and a copy action. Generated copy uses bracketed placeholders such as `[케어 라벨 확인 필요]` or `[KC 인증 여부 확인 필요]` wherever a claim cannot be verified from the source listing, instead of inventing it.

### Toast
Navy bar bottom-right (full width above the tab bar on mobile) with an outlined 되돌리기 action for recoverable changes.

### Imagery
Product thumbnails (`assets/products/P001-P018.webp`) are photographic studio packshots on a seamless cool light-grey ground, cut from one GPT Image 2 contact sheet; the empty-state box (`assets/empty-box-320.webp`) is a flat outlined illustration on the same ground; `og.jpg` is a rendered terminal-style social card. Each carries its generation prompt: a `.json` sidecar for the WebP files, an embedded JPEG comment for `og.jpg`. Thumbnails sit in 1px hairline frames at 2px corners on a Pane 3 placeholder.

## Do's and Don'ts

### Do:
- **Do** colour every signed figure by the market law: red (`up`) for profit or rise, blue (`down`) for loss, deduction, or reversal, in both themes.
- **Do** keep figures at 13px, 15px or 28px and right-align money on a shared column edge.
- **Do** give every screen a 4-digit 화면번호 on its tab, beside its title, and reachable from the jump box, including on the mobile bottom bar.
- **Do** carry status in a shape or pattern too: stage meters, hatching for 취소, ▲▼ marks for direction.
- **Do** flash changed figures red (up) or blue (down) once, and never under reduced motion.
- **Do** dock the quote panel beside the screener at 1024px and wider, use a modal side panel from 720px to 1023px, and a bottom sheet below 720px.
- **Do** write `[.. 입력 필요]` / `[.. 확인 필요]` placeholders in generated copy wherever a claim cannot be verified.
- **Do** keep provenance JSON next to every generated raster.

### Don't:
- **Don't** fill neutral per-row actions in red; the red fill is reserved for the single 매수-style order key per screen or panel.
- **Don't** use green for profit or invert the red/blue mapping in any theme.
- **Don't** introduce greys outside the closed ramp, or radii above 2px on panes, buttons, inputs, and chips.
- **Don't** split figures into floating KPI cards; counts live in one ruled strip (tally, index board, quote strip).
- **Don't** cast shadows at rest; only the modal quote panel, sheet, and toast float.
- **Don't** use gradient fills as decoration; gradients appear only as drawing devices (hatching, stage fill, select caret, skeleton shimmer).
- **Don't** imitate NAVER's logo or brand identity.
