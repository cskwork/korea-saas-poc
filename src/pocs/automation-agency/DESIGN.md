---
name: AutoMate Pro
description: 업무 자동화 대행사의 운영 도구, 지하철 노선도와 역명판의 문법으로 그린 세계
colors:
  map-white: "#ffffff"
  platform-grey: "#f3f4f6"
  platform-grey-deep: "#e9ebee"
  ink: "#1c1f24"
  ink-secondary: "#474c55"
  ink-tertiary: "#666c76"
  rule: "#dcdfe4"
  rule-strong: "#aeb4bd"
  sign-charcoal: "#25282d"
  sign-charcoal-raised: "#34383f"
  sign-rail: "#545a63"
  sign-text-secondary: "#c3c8d0"
  exit-yellow: "#ffcd00"
  build-line-navy: "#0052a4"
  build-line-tint: "#e5eef8"
  loop-line-green: "#00a84d"
  loop-ink-green: "#00753a"
  loop-tint: "#e4f5ea"
  line-make: "#8e5fb5"
  line-zapier: "#d9660f"
  line-n8n: "#e0156a"
  line-apps-script: "#0090c4"
  danger: "#c0182f"
  danger-tint: "#fdebed"
  warn: "#8a5300"
  warn-tint: "#fff3d1"
typography:
  headline:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.35
  body:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum in tables and figures columns"
  label:
    fontFamily: "Pretendard Variable, Pretendard, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
  station-code:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  plate: "6px"
  panel: "12px"
  loop: "72px"
  pill: "999px"
spacing:
  gutter: "32px"
  gutter-mobile: "16px"
  section: "48px"
  field-gap: "18px"
  line-weight: "8px"
components:
  button-primary:
    backgroundColor: "{colors.sign-charcoal}"
    textColor: "{colors.map-white}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.build-line-navy}"
    textColor: "{colors.map-white}"
  button-secondary:
    backgroundColor: "{colors.map-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.map-white}"
    textColor: "{colors.danger}"
    rounded: "{rounded.plate}"
    height: "40px"
  input:
    backgroundColor: "{colors.map-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "8px 12px"
    height: "42px"
  chip-filter:
    backgroundColor: "{colors.map-white}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    height: "34px"
  chip-filter-current:
    backgroundColor: "{colors.sign-charcoal}"
    textColor: "{colors.map-white}"
    rounded: "{rounded.pill}"
  station-plate-current:
    backgroundColor: "{colors.map-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "4px 12px 5px"
  line-badge:
    textColor: "{colors.map-white}"
    rounded: "{rounded.pill}"
    size: "22px"
---

# Design System: AutoMate Pro

## Overview

**Creative North Star: "The Network Map"**

AutoMate Pro draws a one-person automation agency as a Seoul-style metro network. Client work travels a navy delivery line station by station (대기 → 분석 → 개발 → 테스트 → 배포) and interchanges onto a green circle line, the maintenance subscriptions that keep running every month; the monthly recurring revenue sits inside that loop. The same grammar runs everywhere: navigation is a line of stations with the current page as a white station-name plate on a charcoal sign band, workflows are drawn as lines whose colour is the automation platform, a project's detail page is its route with a "현재" marker, the ROI chart is a journey to the break-even interchange, and plans are lines with as many stations as they include automations.

It is an Operate tool first: white map ground, dense ruled timetables instead of cards, one workhorse Korean sans, colour only where it encodes something (a line, a state, the one "you are here" yellow). Expression lives in exact details: uniform line weight, octilinear bends, discs and capsules, condensed signage numerals. The printable quote (견적서) deliberately steps out of the map into plain black-and-white Korean business paperwork.

The legacy look (blue-violet gradients, glass cards, stat-card rows) is the rejected reference.

**Key Characteristics:**
- White map ground; charcoal sign band with white Hangul and one yellow marker for "here".
- Line colours are data: navy = delivery, green = maintenance loop, one colour per platform.
- Stations are white discs with a line-coloured ring; conditions/interchanges are white capsules with a charcoal ring; triggers are filled termini.
- Ruled timetables (2px charcoal head rule, 1px row rules, tabular numerals) instead of card grids.
- Pretendard for everything readable; Barlow Semi Condensed only for station codes, D-day tags and English sub-labels.

## Colors

Restrained ground and ink with a fixed set of line colours that always mean something.

### Primary
- **Build Line Navy** (build-line-navy): the delivery line on the network map, the project route fill, ROI journey line, slider "built" track, focus rings, text links. Its tint (build-line-tint) marks info notices and the recommended column in comparisons.
- **Sign Charcoal** (sign-charcoal): the station-sign band, primary buttons, selected chips, table head rules, the interchange ring, the recommended plan panel.

### Secondary
- **Loop Line Green** (loop-line-green): the maintenance circle line, MRR chart line, running-subscription discs. Never used as text; its text companion is **Loop Ink Green** (loop-ink-green) for success notices and "운행 중" tags.

### Tertiary
- **Exit Yellow** (exit-yellow): "you are here" only: the current station dot in the nav, the selected station halo in the builder, focus rings on dark surfaces, text selection, the recommended plan badge/CTA on charcoal.
- **Platform lines**: Make purple (line-make), Zapier orange (line-zapier), n8n pink (line-n8n), Apps Script sky (line-apps-script). Each always travels with its letter disc (M/Z/N/G) and name, never colour alone.

### Neutral
- **Map White** (map-white): page and map ground, input fields, the quote sheet.
- **Platform Grey** (platform-grey): second neutral for toolbars, side panels, the ROI results panel, table heads; platform-grey-deep for skeletons.
- **Ink / Ink Secondary / Ink Tertiary** (ink, ink-secondary, ink-tertiary): body text, labels and meta, hints and placeholders (all ≥4.5:1 on white).
- **Rule / Rule Strong** (rule, rule-strong): row rules and input borders; rule-strong is also the "unbuilt" track.
- **States**: danger/danger-tint (overdue, destructive, errors), warn/warn-tint (D-3 and paused), always paired with an icon or word.

### Named Rules
**The Line Means Something Rule.** A line colour appears only where it encodes a line: delivery, maintenance or a platform. No decorative colour fields.

**The One Yellow Rule.** Exit yellow marks the single current/selected thing in view (plus focus on dark and text selection). Two yellow markers on one screen is a bug.

## Typography

**Body Font:** Pretendard Variable (global), system Korean sans fallback
**Label Font:** Barlow Semi Condensed (next/font, `--aa-font-sign`) for station codes only

**Character:** One workhorse Korean gothic carries headings, data and controls, the way station signs use one bold gothic; a condensed signage Latin face sets the numbers painted on the map (B3, M02, D-3, NETWORK).

### Hierarchy
- **Headline** (800, 1.75rem, 1.25): page titles, balanced.
- **Figure** (800, 2.5rem, 1.15): the MRR inside the loop and plan prices only; proportional figures.
- **Title** (800, 1.125rem): section heads above a 2px charcoal rule, station names on the map (1.0625rem).
- **Body** (400, 0.9375rem, 1.55): text and table cells; prose capped around 62–68ch; tabular numerals in tables, totals and inputs.
- **Label** (700, 0.8125rem): form labels, buttons, chips, meta.
- **Station code** (Barlow Semi Condensed 600–700, 0.6875–0.875rem, 0.04–0.06em tracking): station codes, D-day tags, line-badge letters, English sub-labels.

### Named Rules
**The Signage Numerals Rule.** The condensed face is for codes painted on the map, never for body copy, amounts or headings.

## Layout

Fixed rem scale, content max width 1240px with a 32px gutter (16px under 720px). Sections are separated by 48px and open with a title over a 2px charcoal rule. Structure is responsive, not fluid type: the network map runs horizontally with five equal station columns plus a 120px bend column above a full-width loop; under 900px the delivery line turns vertical down the left and the loop becomes a rounded panel with riders listed inside. Two-column pairings (timetable + pipeline, chart + ranking, canvas + inspector, form + sticky summary) collapse to one column between 960–1060px. Tables become labelled stacked rows under 760px. The sign band is sticky on desktop only; under 1080px it becomes a platform sign (previous · current · next) plus a "전체 노선" disclosure.

## Elevation & Depth

Flat. Depth comes from tonal layering (map white on platform grey panels) and rules, not shadows. The only shadow is the printable quote sheet's lift on screen (`0 1px 2px rgb(28 31 36 / 0.06), 0 8px 24px -8px rgb(28 31 36 / 0.16)`), removed in print.

### Named Rules
**The Flat Map Rule.** Nothing on the map floats. Selection is shown with a yellow-and-charcoal halo ring or by turning a label into a charcoal plate, never with elevation.

## Shapes

Line geometry is the form language: 8px uniform line weight (6px on phones), round caps, horizontal/vertical/45° segments with rounded corners (18px radius in the builder, 28px at the dashboard bend). Stations are 26px discs with a 6px ring; interchanges are capsules; the maintenance loop is a 72px-radius rounded rectangle (36px on phones). UI plates and inputs use 6px corners, panels 12px, chips and badges are pills. No side stripes, no card borders on data.

## Components

### Buttons
- **Shape:** plate corners (6px), 40px tall (32px small), 700 weight label, icon + verb.
- **Primary:** sign charcoal with white text; hover turns build-line navy.
- **Secondary:** white with a 1.5px rule-strong border; hover border ink.
- **Danger:** white with danger border and text; destructive actions always confirm inline ("정말 …? [삭제] [취소]"), never in a modal.
- **Ghost:** transparent, ink-secondary; hover platform grey.
- **Pending:** spinner icon + "…중" label, disabled.

### Chips
- **Style:** pill, 1.5px rule border, white; with a stage dot or count when filtering stations/statuses.
- **State:** current filter becomes a charcoal pill with white text (`aria-current`).

### Tables (timetables)
- Platform-grey head with a 2px charcoal bottom rule, 1px rule rows, right-aligned tabular amounts, row hover #fafbfc; stacked with per-cell labels on phones.

### Inputs / Fields
- **Style:** white, 1.5px rule-strong border, 6px corners, 42px tall.
- **Focus:** navy border plus a 3px navy-tinted outline.
- **Error:** danger border, message below with an alert icon, wired with `aria-describedby`/`aria-invalid`.

### Navigation
- Desktop: charcoal band; stations as 12px ringed dots on a 3px rail; the current page is a white plate (Hangul 800 + condensed English sub-label) with a yellow-ringed dot.
- Phone: brand + "전체 노선" button, then the platform sign (‹ previous · current plate · next ›), and a vertical station list as the disclosure.

### Network Map (signature)
Delivery line with station columns (name, code, count, client names with progress and 지연 flags), SVG bend into the loop, interchange capsule "유지보수 합류", maintenance riders as discs on the loop's top and bottom edges, MRR figure and month-over-month delta inside.

### Workflow Line Builder (signature)
Grid canvas: HTML station buttons over SVG octilinear segments in the platform colour; "노선 잇기" draws a new segment on (stroke-dashoffset, 280ms expo-out). Selected station: yellow/charcoal halo and a charcoal label plate. Arrow keys move between stations, Shift+arrows move a station, C connects, Delete removes, drag to re-place; the inspector mirrors every action with standard controls.

### Route Marker
Project stage line: six stations on an 8px track, the built stretch in navy (scaleX transition), a charcoal "현재" plate that slides 260ms to the next station on "다음 역으로".

## Do's and Don'ts

### Do:
- **Do** encode meaning with line colour and keep every colour paired with a letter, word or icon.
- **Do** draw connectors octilinear (horizontal, vertical, 45°) at one line weight with rounded bends.
- **Do** use ruled timetables with tabular numerals for lists of records.
- **Do** keep motion to state changes: 160–280ms, `cubic-bezier(0.16, 1, 0.3, 1)`, instant under reduced motion.
- **Do** label demo content as 샘플 데이터 wherever it could read as real.

### Don't:
- **Don't** bring back the legacy gradient/glass/stat-card look.
- **Don't** use exit yellow for anything but the single current/selected marker, focus on dark and selection.
- **Don't** set amounts, body or headings in the condensed signage face.
- **Don't** build card grids of icon + heading + text; lists of records are timetables.
- **Don't** open modals for confirmations; confirm inline next to the action.
