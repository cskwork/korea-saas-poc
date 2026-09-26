---
name: 글품
description: AI가 시안을 쓰고 에디터가 검수해 마감일에 납품하는 콘텐츠 대행 작업실 — a banner stand for copy work.
colors:
  cobalt: "#1c4cc8"
  cobalt-press: "#173fa6"
  cobalt-deep: "#13295f"
  cobalt-wash: "#e7eefc"
  banner-yellow: "#fccf28"
  banner-yellow-press: "#f2c20f"
  banner-red: "#db2c2b"
  red-ink: "#b81f22"
  red-wash: "#fdeaea"
  banner-green: "#00884b"
  stage-received: "#91b1f1"
  stage-writing: "#5782e0"
  stage-review: "#2456d3"
  stage-delivered: "#13295f"
  kind-blog: "#00884b"
  kind-product: "#e4a000"
  kind-ad: "#db2c2b"
  check-marker: "#fff1b8"
  check-ink: "#6b3b00"
  ink: "#11161f"
  ink-2: "#414b5c"
  ink-3: "#5d6778"
  vinyl: "#fbfcfe"
  ground: "#eef1f5"
  steel-1: "#dde2ea"
  steel-2: "#c3cad6"
  steel-3: "#8a94a6"
  steel-4: "#5f6a7d"
typography:
  display:
    fontFamily: "Do Hyeon, Pretendard Variable, sans-serif"
    fontSize: "clamp(30px, 4vw, 44px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Do Hyeon, Pretendard Variable, sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.15
  proof:
    fontFamily: "Do Hyeon, Pretendard Variable, sans-serif"
    fontSize: "clamp(26px, 3.4vw, 42px)"
    fontWeight: 400
    lineHeight: 1.18
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.4
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  copy:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
  data:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  banner: "0px"
  control: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
  gutter: "clamp(16px, 4vw, 40px)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-press}"
  button-secondary:
    backgroundColor: "{colors.vinyl}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-masthead:
    backgroundColor: "{colors.banner-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "38px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
  segment-selected:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
    height: "40px"
  masthead:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
    height: "60px"
  order-banner:
    backgroundColor: "{colors.vinyl}"
    textColor: "{colors.ink}"
    rounded: "{rounded.banner}"
    padding: "16px 18px 14px"
  due-sticker:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "3px 8px 4px"
  due-sticker-late:
    backgroundColor: "{colors.red-ink}"
    textColor: "#ffffff"
  due-sticker-today:
    backgroundColor: "{colors.banner-yellow}"
    textColor: "{colors.ink}"
---

# Design System: 글품

## Overview

**Creative North Star: "The Banner Stand" (현수막 게시대)**

글품 is drawn as the municipal banner stand Korean small shops hang their 현수막 on. Every order is a banner hung for a posting period that ends on its due date; every draft is a 시안, the banner proof a print shop shows before it prints. Cobalt banner blue owns the masthead and runs as a top rail over the 게시 기간 stand and the order board, galvanized-steel greys carry structure, vinyl white carries the words, and the three banner substrates (green, yellow, red) name the three kinds of copy.

The product is an operator's console first. Density is honest: tables, ruled ledgers and tiers carry the work; the world lives in precise, repeated devices (the stitched hem, four grommets, the 게시기간 sticker, the sign-painter lettering) rather than in decoration. Light theme, from the scene: an office desk in daylight and a phone in a lit shop.

It rejects the SaaS default the legacy POC shipped (gradient hero, counters, icon cards, KPI tiles, kanban columns) and the editorial opposite (cream paper, serif, red pen).

**Key Characteristics:**
- Cobalt fields that own regions, not cobalt accents sprinkled on grey.
- Banners are rectangles with a dashed stitched hem 6–8px inside the edge and four grommets.
- Do Hyeon, the free sign-painter gothic of Korean shop banners, for titles, proofs, D-day and prices; Pretendard for everything a person reads or types.
- Dates are stickers: due day plus D-day on every order, red when late, yellow on the day.
- Pipeline stages read by position and a four-block meter, never by hue alone.

## Colors

A banner-shop palette: one committed brand field, three substrate colours for content kinds, one ordinal ramp for the pipeline, and cool steel neutrals.

### Primary
- **Cobalt Banner Blue** (#1c4cc8): the masthead, the 게시 기간 stand's top rail and 작성중 bars, the order board's top rail and its stage meters, primary buttons, selected segments, focus rings. Pressed state Cobalt Press (#173fa6); Cobalt Deep (#13295f) for the enterprise plan banner and success text; Cobalt Wash (#e7eefc) for hover washes and done steps.

### Secondary
- **Banner Yellow** (#fccf28): the emphasised key word on blue (the 품 of the wordmark, the headline marker behind counts, the active nav bar, the masthead CTA, the "추천" and D-day stickers, the 검수 stage on the stand. Also the product-description proof field (with ink lettering). Text selection.

### Tertiary
- **Banner Red** (#db2c2b): late overrun bars, today's line, the ad-copy proof field and kind swatch. Red Ink (#b81f22) for small red text (late stickers, errors, destructive confirmations) where contrast needs it; Red Wash (#fdeaea) behind error notices.
- **Banner Green** (#00884b): the blog proof field and kind swatch; the "Claude connected" dot.

### Pipeline ramp (ordinal, validated)
- **Stage ramp** 접수 #91b1f1 → 작성중 #5782e0 → 검수 #2456d3 → 납품완료 #13295f: the tier-flow strip and the throughput chart (접수 and 납품 series use the two ends).

### Neutral
- **Ink** (#11161f) text; **Ink 2** (#414b5c) secondary text; **Ink 3** (#5d6778) muted meta.
- **Vinyl** (#fbfcfe) panels, banners and forms; **Ground** (#eef1f5) the page field.
- **Steel 1–4** (#dde2ea, #c3cad6, #8a94a6, #5f6a7d): hairlines, control borders, rails (section heads, panel tops, the stand's crossbars), grommet rings.

### Named Rules
**The Substrate Rule.** Green, yellow and red mean blog, product and ad. They appear on proofs, kind swatches and charts only, and always beside their label.
**The Red Means Late Rule.** Outside the ad-copy proof, red is reserved for lateness, errors, over-quota meters and destructive confirmation. Nearness (D-1, D-2), open checks and "이용 중" are never red.

## Typography

**Display Font:** Do Hyeon (via next/font, fallback Pretendard Variable)
**Body Font:** Pretendard Variable (loaded globally)

**Character:** Sign-painter lettering against a clean Korean UI gothic: the banner speaks in Do Hyeon, the operator works in Pretendard.

### Hierarchy
- **Display** (400, clamp(30px, 4vw, 44px), 1.15): the 현황 status headline with marked counts: 지연 on a red-ink marker (only when something is late, and first), 오늘 마감 and 검수 대기 on yellow.
- **Headline** (400, 36px; 30px under 640px, 1.15): page titles and the order sheet title.
- **Proof** (400, clamp(26px, 3.4vw, 42px), 1.18; compact 21px): draft titles set as banners. Order-banner topics 21px, tier plates 26px, plan names 30px, prices 52px, D-day sticker labels 19px.
- **Title** (Pretendard 800, 16–17px): panel and section heads.
- **Body** (Pretendard 400, 15px, 1.55): UI text. **Copy** (16.5px, 1.8, max 68ch): the draft itself.
- **Label** (Pretendard 700, 14px): field labels, buttons. **Data** (12–13px, tabular numerals): meta rows, dates, counts, axis ticks.

### Named Rules
**The Lettering Rule.** Do Hyeon only where a banner or sticker would carry lettering: titles, proofs, D-day, prices, tier plates. Never in buttons, labels, tables or body copy.
**The Tabular Rule.** Every date, count and character tally uses tabular numerals.

## Layout

Content sits in a 1240px measure with a clamp(16px, 4vw, 40px) gutter. Operator pages use a main column plus a 300–320px side column (draft workbench, request form) that stacks under 960–1000px. The 게시 기간 stand is a 250px label column plus a 14-day grid; under 720px each row stacks (label over a slim track) and the stand runs edge to edge. The order board is a sequence of tiers (plate on the left, banners hung in an auto-fill grid of 270px minimum); under 720px tiers stack and banners go single-column. The 사례 board is a three-column wall where ad-copy strips span two columns (dense flow). Spacing rhythm steps 4 / 8 / 14 / 20 / 28px, with more space above a section head than below it.

## Elevation & Depth

Flat by default. Panels and forms carry no shadow; they are separated by a 4–6px steel or cobalt rail along their top edge. Only things that hang cast a short drop, as vinyl does off a rail: order banners (0 5px 8px -5px), proofs (0 6px 10px -6px) and plan banners (0 8px 12px -8px). Chart tooltips lift with 0 6px 16px -6px.

### Named Rules
**The Hanging Rule.** A shadow means "this is hung": banners, proofs and plan poles only. A panel that merely groups content gets a rail, never a shadow.

## Shapes

Rectangles. Banners and panels have square corners (0px); controls, stickers and tags use 2px. Banners carry a 1px dashed stitch line 6–8px inside the edge (an outline with negative offset) and four grommets: 8–10px rings of #c9d0db with a hole in the page ground. Kind swatches are 10–14px squares; the stage meter is four 8px blocks.

## Components

### Buttons
- **Shape:** 2px corners, 40px tall (32px small), 0 16px padding, Pretendard 700.
- **Primary:** cobalt with white text, pressed cobalt on hover. **Secondary:** vinyl with a 1px steel-2 inset ring. **Quiet:** cobalt text, wash on hover. **Danger:** vinyl with red-ink text; the confirmation that follows is solid red-ink.
- **Masthead CTA:** banner yellow with ink text.
- **Pending:** spinner plus a pending label ("저장하는 중…"); disabled at 55% opacity.
- **Phones:** under 720px every button, small ones included, is at least 44px tall.
- **One CTA per job:** "의뢰서 쓰기" lives only in the masthead (pressed while the 의뢰서 is open); pages do not repeat it.

### Inputs / Fields
- **Style:** white, 1px steel-2 border, 2px corners, 44px tall, cobalt caret.
- **Focus:** cobalt border plus a 3px cobalt halo at 18%. **Error:** red-ink border and a red-ink message wired with aria-describedby; after a rejected submit the keyboard lands on the first invalid field.
- **Segmented choice:** radio groups drawn as a strip; the chosen segment turns cobalt with white text.

### Navigation
- Cobalt masthead with grommets at its corners; white nav text, the current page underlined by a 4px yellow bar. Under 860px the nav becomes a horizontally scrolling strip under the wordmark row, its right edge faded. A yellow "본문으로 건너뛰기" skip link appears on first Tab.
- **Client view (납품서):** the delivery page sits outside the operator console: a slim 52px cobalt strip with the wordmark, "콘텐츠 대행 · 납품서" and the 샘플 tag, an 820px measure, and a footer without demo controls. A cobalt-wash note ("고객에게 보내는 화면이에요") links the operator back to the order and disappears in print.

### Order banner
- Vinyl rectangle with hem and grommets; order number and kind tag, the due sticker at top right, the topic in Do Hyeon, client and industry, then a ruled foot with the draft count and the next-step button. 검수 banners turn pale yellow with an amber hem; their "납품하기" opens the order sheet's delivery panel, because delivering means choosing the draft (and seeing its open [확인 필요] marks).

### Due sticker (게시기간 스티커)
- A 1px ink-bordered rectangle: "마감 9.24 (목)" in 11px tabular type over the D-label in Do Hyeon. The D-label on a yellow marker at D-1/D-2, solid yellow on the day, red-ink only when late, soft steel once delivered.

### [확인 필요] marker
- Open checks read in one yellow marker everywhere (the highlight in the copy, the "확인 필요 N곳" counts in lists and the 글자수 panel): #fff1b8 fill, #6b3b00 text, a 2px amber underline. Never red.

### Plan poles (요금제)
- Three hung banners (vinyl, cobalt, cobalt-deep). Each carries a fit panel: this month's orders against the plan's quota with a meter (red only when over), and warnings when switching would overrun the quota or drop a kind still in progress. The current plan wears a white "이용 중" sticker; moving down is a secondary button; 엔터프라이즈 leads to the quote form, with a quiet "데모에서 바로 바꿔 보기".

### Locked 납품본
- A draft delivered to a client is read-only while its order stays 납품완료: the toolbar keeps only 복사, a cobalt-wash lock note links to the order to take it back to 검수, and relinking, restoring and deleting are hidden (the server refuses them too).

### 시안 proof (signature)
- The draft title set as a banner in its kind's substrate (green, yellow with ink lettering, red), the first matching keyword in the key colour, byline beneath, hem and grommets. **시안 펼치기:** when AI writes or rewrites a draft, the proof unrolls from the left edge (clip-path over 620ms, cubic-bezier(0.16, 1, 0.3, 1)) behind a shaded roll that travels with the edge, then the grommets punch in (220ms after 560ms). Reduced motion shows it at rest.

### 게시 기간 stand
- Vinyl panel under a 6px cobalt top rail (a cobalt field made the bars hard to read); a day header with today in ink; one row per open order on a ground-grey track with a bar from request to due date (white with a dashed steel outline before a draft exists, cobalt while 작성중, yellow in 검수), a red overrun from the due date to today when late, and today's ink line behind the bars. Red stays reserved for late.

## Do's and Don'ts

### Do:
- **Do** let cobalt own whole regions (the #1c4cc8 masthead); the 게시 기간 stand and the order board sit on vinyl under a cobalt rail so their contents stay legible and keep the page ground cool (#eef1f5).
- **Do** give every order a due sticker and every draft a character count (공백 포함/제외, 원고지 매수).
- **Do** mark the facts AI left open as "[확인 필요: …]" and highlight them in drafts.
- **Do** label sample data (the 샘플 tag, dashed sample marks on cases).

### Don't:
- **Don't** reintroduce the legacy SaaS look: gradient heroes, counters, KPI tiles, icon cards, kanban columns.
- **Don't** drift to cream paper, serif display or red-pen editorial styling.
- **Don't** put Do Hyeon in buttons, labels, tables or body copy.
- **Don't** use green, yellow or red for anything but content kinds, lateness and errors.
- **Don't** put shadows on panels; only hung things cast them.
- **Don't** place label lines above headings; facts follow the title.
