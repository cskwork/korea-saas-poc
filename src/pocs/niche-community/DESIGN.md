---
name: 스타트업 빌더스
description: 초기 창업가들이 숫자로 대화하는 유료 멤버십 커뮤니티 — run like a Demo Day.
colors:
  keynote-canvas: "oklch(0.93 0.006 262)"
  canvas-deep: "oklch(0.895 0.009 262)"
  slide-white: "oklch(1 0 0)"
  slide-sunk: "oklch(0.975 0.004 262)"
  deck-ink: "oklch(0.23 0.03 266)"
  ink-secondary: "oklch(0.42 0.022 266)"
  ink-muted: "oklch(0.5 0.018 266)"
  hairline: "oklch(0.88 0.008 266)"
  hairline-strong: "oklch(0.8 0.012 266)"
  stage: "oklch(0.2 0.028 268)"
  stage-raised: "oklch(0.26 0.032 268)"
  stage-rule: "oklch(0.34 0.03 268)"
  on-stage: "oklch(0.97 0.004 266)"
  on-stage-secondary: "oklch(0.8 0.014 266)"
  pitch-timer: "oklch(0.56 0.2 32)"
  led: "oklch(0.72 0.19 40)"
  seats-open: "oklch(0.58 0.13 152)"
  seats-closing: "oklch(0.66 0.14 68)"
  seats-full: "oklch(0.55 0.2 27)"
  error: "oklch(0.52 0.19 27)"
  chart-recessive: "oklch(0.72 0.018 262)"
  chart-ink: "oklch(0.36 0.03 266)"
typography:
  action-title-page:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: "-0.035em"
  action-title:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1.4375rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  panel-title:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
  reading:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  led:
    fontFamily: "Doto, ui-monospace, monospace"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "\"ROND\" 100"
rounded:
  sm: "4px"
  md: "6px"
  pill: "999px"
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
    backgroundColor: "{colors.deck-ink}"
    textColor: "{colors.slide-white}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-accent:
    backgroundColor: "{colors.pitch-timer}"
    textColor: "{colors.slide-white}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-default:
    backgroundColor: "{colors.slide-white}"
    textColor: "{colors.deck-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-on-stage:
    backgroundColor: "{colors.on-stage}"
    textColor: "{colors.stage}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  slide:
    backgroundColor: "{colors.slide-white}"
    rounded: "{rounded.md}"
    padding: "24px 24px 0"
  covered-slide:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-stage}"
    rounded: "{rounded.sm}"
    padding: "16px"
  stage-band:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-stage}"
    padding: "24px 32px"
  tag-secret:
    backgroundColor: "{colors.slide-white}"
    textColor: "{colors.deck-ink}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  tag-ink:
    backgroundColor: "{colors.deck-ink}"
    textColor: "{colors.slide-white}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  input:
    backgroundColor: "{colors.slide-white}"
    textColor: "{colors.deck-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
---

# Design System: 스타트업 빌더스

## Overview

**Creative North Star: "The Demo Day Deck"**

The community is run like a demo day. Every post is a slide on a Keynote-grey light table, headed by an action title that states its point. The operator's dashboard is the traction section of the community's own IR deck: every panel's title is a computed sentence and every panel ends in a source line. Meetups live on a dark stage under a dot-matrix pitch timer. Premium content is 대외비 — a covered slide, the presenter's blank screen — never a blur or a paywall modal.

The surface is light because the scene is daytime: members read on phones between meetings and in bright coworking spaces; the operator works at a laptop. The stage is the one dark field, and it is reserved for the live moments: the next meetup, a meetup's own title slide, a covered slide, failure and permission states. Density is Operate-grade: small, calm labels; large, heavy titles; tabular numbers.

**Key Characteristics:**
- Light table of white slides on a cool grey canvas; slides carry shadow, never a border.
- Heavy Pretendard action titles (800) do the talking; labels stay small and quiet.
- One accent, the pitch-timer red-orange, meaning "now / the one that matters".
- Dot-matrix LED digits (Doto) only for times and countdowns.
- Deck grammar everywhere: footer rules, 대외비 markers, PowerPoint placeholders, source lines, slide counters.

## Colors

A restrained deck palette: cool neutral paper and ink, one dark stage, one hot accent borrowed from the pitch timer.

### Primary
- **Pitch-Timer Red** (`pitch-timer`): the only accent. The laser-pointer dot on the current agenda item, the current-month column in charts, the premium series, an active like, the primary meetup RSVP, focus rings, the caret, text selection (at 18% alpha).
- **LED Orange** (`led`): lit dot-matrix digits and focus rings on the stage only; its 13%-alpha ghost draws the unlit "88:88:88" segments behind the lit ones.

### Neutral
- **Keynote Canvas** (`keynote-canvas`): the page ground, the html background and scrollbar track.
- **Canvas Deep** (`canvas-deep`): segmented-control troughs, skeleton bars, progress tracks.
- **Slide White** (`slide-white`) and **Slide Sunk** (`slide-sunk`): slides; hover washes inside slides.
- **Deck Ink** (`deck-ink`), **Ink Secondary**, **Ink Muted**: titles and primary text; meta and excerpts; timestamps and captions (muted still clears 4.5:1 on the canvas).
- **Hairline** / **Hairline Strong**: slide footer rules and list dividers / control borders and table rules.
- **Stage**, **Stage Raised**, **Stage Rule**, **On Stage**, **On Stage Secondary**: the dark stage band, the meetup title slide, covered slides, tooltips and gates.

### Semantic
- **Seats Open / Closing / Full** (`seats-open`, `seats-closing`, `seats-full`): the pitch-timer state vocabulary (여유 / 마감 임박 / 마감). Always a dot or seat mark next to an ink text label, never text colour.
- **Error** (`error`): field errors and destructive buttons, always with words.
- **Chart Recessive / Chart Ink**: the emphasis grammar for charts — everything recessive except the series the title is about (pitch-timer), with ink for a secondary lead series and a one-hue ink ramp for the cohort heatmap.

### Named Rules
**The One Hot Thing Rule.** The pitch-timer red marks at most one thing per region: the current item, the latest bar, the live action. If two things are red, one of them is wrong.

**The Stage Is Earned Rule.** The dark stage appears only for live or withheld things (next meetup, a meetup's title slide, 대외비 covers, errors, operator gates, tooltips). Never as a decorative section background.

## Typography

**Display Font:** Pretendard Variable (the Korean startup-deck face; loaded globally)
**Body Font:** Pretendard Variable
**Label/Mono Font:** Doto (dot-matrix, `ROND` axis at 100) — digits only

**Character:** One family doing everything at different weights, the way a Korean IR deck is set; the dot-matrix face is an instrument readout, not a voice.

### Hierarchy
- **Action title, page** (800, 2.125rem, 1.22, -0.035em): post titles in presenter view, profile names.
- **Action title** (800, 1.4375rem, 1.3, -0.03em): slide titles in the feed, the composer's title placeholder, the stage band title.
- **Panel title** (800, 1.1875rem, 1.4, -0.02em): dashboard action titles, section headings.
- **Body** (400, 0.9375rem, 1.7): excerpts, comments, descriptions; max 64–68ch.
- **Reading** (400, 1.0625rem, 1.85): the post body in presenter view, pre-wrapped, max 68ch.
- **Label** (600, 0.8125rem): buttons, meta lines, tabs; captions drop to 0.75rem.
- **LED** (700–900, 2.75rem on stage, 1.75rem in the run-of-show): countdowns and meetup times, tabular.

### Named Rules
**The Action Title Rule.** A panel or slide title is a sentence that states the takeaway ("MRR이 5개월 동안 … 늘었습니다"), computed from rows. Never a label like "매출 추이", never a kicker above it.

**The LED Is a Readout Rule.** Doto is for time and countdown digits. Never for headings, labels or prose.

## Layout

Fixed rem type scale (1.2 ratio), 4px spacing base (4/8/12/16/24/32/48/64), side gutter `clamp(16px, 3vw, 32px)`, sticky 60px deck chrome.

- **Feed (light table):** full-width stage band, then a 1320px grid of agenda (216px) · slides (max 720px) · rail (272px). Below 1180px the rail tucks under the agenda; below 860px it becomes one column and the agenda becomes a horizontal chip scroller.
- **Presenter view:** slide (fluid) + 260px column of next/previous 16:9 previews; previews fall under the slide below 960px.
- **Dashboard:** a summary slide with a six-cell ruled KPI row (3 then 2 columns on smaller screens), then a two-column deck of traction slides, then the ledger.
- **Phones:** the global nav becomes a fixed deck-footer bar (five icons + labels, pitch-timer tab marker); no horizontal page scroll at 360px.

## Elevation & Depth

Depth is paper on a table: slides lift off the canvas with a soft, offset shadow; nothing else floats except popovers and tooltips. Borders and shadows are never combined on the same container.

### Shadow Vocabulary
- **Slide** (`box-shadow: 0 1px 2px oklch(0.2 0.03 266 / 0.06), 0 8px 20px -12px oklch(0.2 0.03 266 / 0.28)`): every slide, composer, comment form.
- **Lift** (`box-shadow: 0 2px 4px oklch(0.2 0.03 266 / 0.08), 0 16px 32px -16px oklch(0.2 0.03 266 / 0.35)`): persona popover, chart tooltip, hovered presenter preview, meetup title slide.

### Named Rules
**The Paper Not Glass Rule.** No blur, no glow, no halo. Depth is an offset shadow or a change of field (canvas → slide → stage).

## Shapes

Slides and controls share a small, square-ish corner (6px; 4px inside slides and on covered panels) — a projected slide, not a card. Pills (999px) are only for tags, the persona name tag and phone channel chips. The 16:9 ratio is used literally where a slide stands alone: the meetup title slide, presenter previews, the covered slide in presenter view and the error/permission slides.

## Components

### Buttons
- **Shape:** 6px corners, 40px tall (32px small), 13px/600 labels, 16px icons.
- **Primary (ink):** deck-ink fill, white label — publish, save, register.
- **Accent (pitch-timer):** only for the RSVP on the stage and the premium start.
- **Default:** white with a strong hairline; hover darkens the border; active nudges 1px down.
- **On stage:** inverted (on-stage fill, stage label) or ghost with a stage-rule border.
- **Danger:** error text with a tinted border; the destructive confirm is error-filled.
- **Destructive flow:** two-step inline confirm (question + 취소 + explicit verb), focus moves to the confirm, Esc cancels.

### Chips / Tags
- **대외비:** outlined in ink with a lock icon — the deck's confidential marker, bottom-right in a slide's footer.
- **공지 / 운영자 명찰:** ink-filled pill. **샘플 데이터:** hairline pill in the chrome.

### Cards / Containers (Slides)
- **Slide:** white, 6px, slide shadow, 24px padding; closes with a hairline footer rule holding like/comment/share on the left and markers on the right.
- **Covered slide:** stage-filled panel inside the slide: lock + "프리미엄 멤버에게 공개된 슬라이드예요", length and comment counts, an inverted CTA. The body never reaches the client.
- **Traction slide:** action title, chart or table, then a hairline and a muted 출처 line.

### Inputs / Fields
- **Style:** white, strong hairline, 6px, 40px; label above in 13px/600.
- **Composer placeholders:** dashed hairline boxes reading "제목을 입력하십시오" / "텍스트를 입력하십시오"; the dash disappears once filled; focus turns the box solid pitch-timer.
- **Focus:** 2px pitch-timer outline (LED orange on the stage).
- **Error:** error border plus a message linked with aria-describedby.

### Navigation
- **Agenda (desktop header and feed channels):** the current item in ink at 800 with the laser dot; the rest dimmed to ink-muted at 500 — the agenda slide convention. Premium channels carry a lock.
- **Deck footer (phones):** fixed bottom bar, five icon+label items, current item in ink with a 3px pitch-timer tab.
- **Presenter stepper:** round prev/next, "n / total" counter; ←/→ keys and swipes step through the current feed with a 200–220ms push (disabled under reduced motion).

### Pitch Timer (signature)
The stage band: Doto digits in LED orange over their unlit ghost ("D-1 12:48:31"), meetup title in 800 on-stage, meta in on-stage secondary, a seat meter (one mark per seat, warn-outlined free seats when closing) and the RSVP. Ticks once a second; the first render uses the server clock so hydration matches.

## Do's and Don'ts

### Do:
- **Do** state every chart's takeaway as its title and end it with a 출처 line.
- **Do** keep premium content server-side and show it as a covered slide with its length and comment count.
- **Do** label sample data wherever a visitor could take it for real (chrome tag, footer, 샘플 장소, dashboard header).
- **Do** use tabular numerals for columns, counters and times; proportional figures elsewhere.
- **Do** give every destructive action the two-step inline confirm.

### Don't:
- **Don't** use emoji or unicode glyphs as icons; channel and badge icons are lucide at 1.75 stroke.
- **Don't** put a kicker or eyebrow label above a title, or number sections that are not a real sequence.
- **Don't** paint more than one pitch-timer red element per region, or use it for decoration.
- **Don't** add gradients, glass, glows or side-stripe borders; depth is the slide shadow only.
- **Don't** set Doto outside time digits, or display type anywhere in labels and data.
