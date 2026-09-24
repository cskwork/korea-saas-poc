---
name: 펴냄
description: 한 사람의 발행소 — a newsletter studio and public letter set as a Korean monthly magazine in two-colour print.
colors:
  paper: "oklch(0.988 0.002 250)"
  paper-panel: "oklch(0.962 0.004 250)"
  paper-press: "oklch(0.935 0.005 250)"
  ink: "oklch(0.2 0.014 262)"
  ink-secondary: "oklch(0.4 0.014 262)"
  ink-tertiary: "oklch(0.5 0.012 262)"
  hairline: "oklch(0.86 0.006 262)"
  hairline-strong: "oklch(0.74 0.008 262)"
  highlighter: "oklch(0.93 0.13 102)"
  correction-red: "oklch(0.53 0.19 28)"
  settled-green: "oklch(0.5 0.11 155)"
  card-stock: "oklch(0.955 0.022 262)"
  cover-jjok: "oklch(0.4 0.13 266)"
  cover-juhong: "oklch(0.64 0.18 40)"
  cover-ssuk: "oklch(0.48 0.1 130)"
  cover-hwang: "oklch(0.83 0.15 86)"
  cover-jaju: "oklch(0.44 0.14 352)"
  cover-cheongrok: "oklch(0.48 0.085 200)"
  cover-meokhoe: "oklch(0.36 0.02 262)"
  cover-bunhong: "oklch(0.82 0.08 14)"
  series-subscription: "#e25c26"
  series-ads: "#3857ac"
  series-membership: "#a6a01b"
typography:
  nameplate:
    fontFamily: "Hahmlet, Nanum Myeongjo, AppleMyungjo, Batang, serif"
    fontSize: "clamp(52px, 7.4vw, 104px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  numeral:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "clamp(88px, 10vw, 128px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  numeral-band:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  numeral-latest:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "clamp(72px, 10vw, 140px)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.05em"
  wordmark:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  cover-title:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "clamp(26px, 2.6vw, 36px)"
    fontWeight: 700
    lineHeight: 1.28
    letterSpacing: "-0.02em"
  reading-title:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "clamp(28px, 4.6vw, 44px)"
    fontWeight: 700
    lineHeight: 1.26
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  reading:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.92
  reading-compact:
    fontFamily: "Hahmlet, Nanum Myeongjo, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.88
  body:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  print: "2px"
  data-end: "4px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.print}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ink-secondary}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.print}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-press}"
  button-danger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.correction-red}"
    rounded: "{rounded.print}"
    height: "40px"
  tag:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.print}"
    padding: "1px 6px"
    typography: "{typography.label}"
  tag-published:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.print}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.print}"
    padding: "8px 12px"
    height: "40px"
  send-panel:
    backgroundColor: "{colors.paper-panel}"
    padding: "20px"
  reply-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.print}"
    padding: "20px 24px 24px"
---

# Design System: 펴냄

## Overview

**Creative North Star: "The Monthly Magazine's Editorial Office"**

펴냄 treats a newsletter as a periodical. The studio is the office of a 1970s–80s Korean monthly — issues carry 호수, the lineup is a 목차, the publication's vital record is a 판권, sponsors buy 광고 지면 and members write in the 독자 마당. The public letter is that magazine's own pages: a nameplate, a cover band per issue, 명조 text set for reading, and a bound-in 정기구독 신청서 that tears off along a perforated line.

The world is two-colour print on bright coated stock. Black ink and white paper carry every control, table and label; colour arrives only as issue covers, where each numbered issue owns one of eight printing inks and shows it as a solid field. Heavy ink rules (3px over 1px) open blocks the way magazine section heads do. Density is editorial rather than dashboard: statements and colophons in running text, tables with tabular figures, leader-dotted contents rows instead of KPI tiles.

It is light because the scene is: an editor at a desk or café table drafting next week's issue, readers on phones in a bright morning subway car.

**Key Characteristics:**
- 먹 and 종이 for the interface; eight cover inks for issue identity only.
- Hahmlet 명조 for nameplates, issue numerals, titles and reading text; Pretendard for every control, label and table.
- Heavy-over-light ink rules open sections; hairlines separate rows.
- Square 2px corners on everything printed; pills only for the 좋아요 control.
- Magazine vocabulary as structure: 호수, 목차, 판권, 교정쇄, 정기구독 신청서, 광고 지면.

## Colors

A two-colour press: one near-black ink on cool white stock, plus a rack of eight cover inks that are never used for UI state.

### Primary
- **먹 Ink** (oklch(0.2 0.014 262)): all body text, primary buttons (solid), section rules, table heads, active navigation underline, focus rings, published-status tags.

### Secondary
- **Cover inks** (쪽 oklch(0.4 0.13 266), 주홍 oklch(0.64 0.18 40), 쑥 oklch(0.48 0.1 130), 황 oklch(0.83 0.15 86), 자주 oklch(0.44 0.14 352), 청록 oklch(0.48 0.085 200), 먹회 oklch(0.36 0.02 262), 분홍 oklch(0.82 0.08 14)): issue `n` takes ink `(n − 1) mod 8`. They fill the desk's next-issue cover, the reading page's cover band, the letter's latest-issue cover and the small swatches in contents rows. Each ink declares its own type colour (`--on-cover`): paper on the dark inks, ink on 주홍, 황 and 분홍.

### Tertiary
- **Chart series** (구독료 #e25c26, 광고 #3857ac, 멤버십 #a6a01b): drawn from the ink rack and validated for colour-vision separation in stack order (adjacent ΔE ≥ 24). The membership olive sits under 3:1 against paper, so every chart ships a legend and a table view.

### Neutral
- **Coated Paper** (oklch(0.988 0.002 250)): page ground everywhere; slightly cool, never cream.
- **Panel Paper** (oklch(0.962 0.004 250)): the editor's send panel, inline forms, footers — the second neutral layer.
- **Press Grey** (oklch(0.935 0.005 250)): hover wash on quiet controls and skeleton blocks.
- **Secondary / Tertiary Ink** (oklch(0.4 …), oklch(0.5 …)): supporting text, captions, axis labels; both clear 4.5:1 on paper.
- **Hairlines** (oklch(0.86 …), oklch(0.74 …)): row separators and field strokes.
- **Card Stock** (oklch(0.955 0.022 262)): the bound-in reply card and the letter's notices — a pale blue-grey card, distinct from the page.
- **Highlighter** (oklch(0.93 0.13 102)): text selection, `**굵게**` emphasis in reading text, the "샘플" mark and one-off notices.
- **Correction Red** (oklch(0.53 0.19 28)) and **Settled Green** (oklch(0.5 0.11 155)): errors/destructive actions and goals reached.

### Named Rules
**The Cover-Only Colour Rule.** Chromatic colour belongs to an issue's cover (or a chart series). No button, tag, link or state is ever tinted with a cover ink.

**The Sample Mark Rule.** Every figure a visitor could mistake for real — simulated opens and clicks, sample ledgers — carries the highlighter "샘플" mark beside it.

## Typography

**Display Font:** Hahmlet (via next/font, variable weight; fallbacks Nanum Myeongjo, AppleMyungjo, Batang)
**Body Font:** Pretendard Variable (global)

**Character:** A contemporary 명조 with heavy, flat-terminal weights for nameplates and numerals and a quiet regular for long reading, paired with a neutral Korean gothic that does all operational work.

### Hierarchy
- **Nameplate** (800, clamp(52px, 7.4vw, 104px), 1.0, −0.04em): the publication's name on the letter's front page; the studio wordmark "펴냄" is the same face reversed out of an ink block (30px).
- **Numeral** (800, up to 128px on the desk cover, 64px on the reading band, 140px on the letter's latest cover): 호수, with "제" and "호" set at 0.32em.
- **Headline** (800, 2.125rem, 1.15): studio page titles; reading-page titles run clamp(28px, 4.6vw, 44px) at 700.
- **Title** (700, 1.25rem, 1.3): section heads under the ink rule, contents titles, board post titles.
- **Reading** (400, 18px / 1.92, 17px on phones; measure 36rem): issue bodies and board posts.
- **Body** (400, 0.9375rem / 1.55): UI text, forms, tables (tabular figures in every table).
- **Label** (600–700, 0.75–0.8125rem): field labels, tags, table heads. No uppercase, no tracking.

### Named Rules
**The Two Voices Rule.** 명조 speaks for the publication (names, numbers, titles, prose); Pretendard speaks for the tool (controls, labels, data). A button or table cell is never set in 명조, except the 원고 | 교정쇄 switch, which names the two states of the text itself.

## Layout

A 1280px page on a 12-column grid with a fluid gutter (clamp(16px, 3vw, 32px)). The desk splits 7/5: the next-issue cover and the circulation chart on the left, the 목차 and 판권 on the right; below 860px the columns dissolve and sections reorder cover → 목차 → 판권 → chart → 독자 마당 → 광고 지면. The editor is a writing sheet plus a 320px sticky send panel, stacking below 1000px. Reading pages hold a 36rem measure. Spacing runs on a 4px grid with larger gaps above headings than below. Tables collapse to labelled two- or three-column cards below 760px; the studio's section strip scrolls sideways on phones with a fade at its edge.

## Elevation & Depth

Flat print. Depth comes from rules and paper tone, not shadows: the send panel and inline forms sit on panel paper under a 3px ink rule. Only three things lift: the manuscript sheet (a hairline edge plus a long soft shadow, `0 18px 40px -28px`), dialogs (`0 18px 48px -12px`) and toasts — objects that are physically on top of the page.

### Named Rules
**The Ruled, Not Raised Rule.** A section is opened by a heavy-over-light ink rule, never by a card with a shadow.

## Shapes

Square print corners (2px) on buttons, fields, covers, tags and cards; chart columns take the 4px data-end on their top segment only. Rules are 3px ink over a 1px ink line two pixels below. Status is drawn with borders: 초안 dashed, 발행 예약 outlined, 발행 solid ink. The reply card's top edge is a 2px dashed perforation with a scissors mark. Pills (999px) appear only on the 좋아요 control.

## Components

### Buttons
- **Shape:** square print corners (2px), 40px tall (32px small).
- **Primary:** solid ink with paper text, 600 weight — 새 호 쓰기, 지금 발행, 올리기.
- **Secondary:** paper with a 1px ink border; hover presses to Press Grey.
- **Quiet:** text-only with a grey wash on hover, for row actions.
- **Danger:** correction-red outline; the confirm inside a dialog is solid red.
- **On a cover:** the colours invert to the cover's own pair (`--on-cover` fill, cover-ink text).

### Tags
- **Style:** 12px 600 label in a 1px current-colour outline; 공지 and 발행 are solid ink; 초안 and 협의 중 are dashed.

### Inputs / Fields
- **Style:** paper field, 1px hairline-strong stroke, 2px corners; labels above in 600.
- **Focus:** the stroke turns ink with a 1px ink inner ring.
- **Error:** correction-red stroke plus a message wired by aria-describedby. The manuscript's title, lede and body are borderless writing lines; the reply card's name and email are underlined blanks like a paper form.

### Navigation
- **Studio:** the reversed "펴냄" wordmark, publication name and dateline, then a strip of section names (편집실 · 발행 · 구독자 명부 · 독자 마당 · 수입 장부 · 설정) with a 3px ink underline on the current one, all under a double ink rule.
- **Letter:** an ink utility strip (reader state, back to the office), then the nameplate and 지난 호 · 구독 안내 · 독자 마당.

### Issue Cover (signature)
A solid field in the issue's ink with the 호수 numeral, the title in 명조, the standfirst and a ruled meta line; appears as the desk's next issue, the reading page's band and the letter's latest issue.

### 원고 | 교정쇄 (signature interaction)
The editor's view switch. 원고 is plain writing paper with a sticky formatting bar and a 원고지 매수 count; 교정쇄 lays the typeset proof — cover band, body, and a dashed "여기까지 무료로 보여요" line where a paid issue's preview ends — over the manuscript with a 360ms left-to-right clip-path wipe (instant under reduced motion).

### 정기구독 신청서 (signature)
The bound-in reply card on card stock: perforated top edge, 받는 곳 box, square tick boxes for plans, underlined blanks for name and email, a solid "신청서 보내기".

### Contents Row
Cover swatch, 명조 호수, title, a dotted leader and right-aligned meta (date · simulated open rate) — the 목차 on the desk and the 지난 호 list on the letter.

## Do's and Don'ts

### Do:
- **Do** open every block with the heavy-over-light ink rule (3px + 1px).
- **Do** give each new issue its ink by number, `(n − 1) mod 8`, and use it only on that issue's cover and swatch.
- **Do** set figures in tables with tabular numerals and money through the KRW formatter.
- **Do** mark simulated or sample figures with the highlighter "샘플" note.
- **Do** keep charts to the three validated series colours, with a legend and a table view.

### Don't:
- **Don't** tint controls, links or states with cover inks.
- **Don't** replace the colophon or statement with KPI tiles of big numbers.
- **Don't** add eyebrows or kickers above headings; the rule and the title carry the section.
- **Don't** warm the paper toward cream; the stock is cool coated white.
- **Don't** use emoji or glyphs as icons; icons are lucide at 14–16px, one stroke weight.
