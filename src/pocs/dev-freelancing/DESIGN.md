---
name: DevFlow
description: 견적부터 시간·청구·입금까지, 1인 개발 외주의 장부 — a ledger of cells for a Korean freelance developer.
colors:
  night-ground: "oklch(0.175 0.012 255)"
  night-panel: "oklch(0.205 0.013 255)"
  night-raise: "oklch(0.24 0.014 255)"
  night-well: "oklch(0.155 0.011 255)"
  night-line: "oklch(0.3 0.014 255)"
  night-line-strong: "oklch(0.4 0.016 255)"
  night-ink: "oklch(0.94 0.008 255)"
  night-ink-muted: "oklch(0.78 0.012 255)"
  night-ink-quiet: "oklch(0.66 0.014 255)"
  cell-empty: "oklch(0.26 0.012 255)"
  cell-copper: "oklch(0.38 0.055 60)"
  cell-amber-dim: "oklch(0.53 0.1 64)"
  cell-amber: "oklch(0.74 0.15 74)"
  cell-sodium: "oklch(0.89 0.15 95)"
  amber-ink: "oklch(0.2 0.03 70)"
  amber-hover: "oklch(0.8 0.15 80)"
  overdue-rose: "oklch(0.72 0.15 18)"
  overdue-rose-deep: "oklch(0.32 0.08 18)"
  paper-ground: "oklch(0.955 0.005 255)"
  paper-sheet: "oklch(1 0 0)"
  paper-ink: "oklch(0.22 0.014 255)"
  paper-ink-muted: "oklch(0.4 0.014 255)"
  paper-line: "oklch(0.88 0.007 255)"
  paper-copper: "oklch(0.47 0.12 48)"
  paper-rose: "oklch(0.52 0.17 22)"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1.4375rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  measure:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  cell: "2px"
  control: "3px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s8: "32px"
  s10: "40px"
  s12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.cell-amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "{colors.amber-hover}"
    textColor: "{colors.amber-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "34px"
  button-secondary-hover:
    backgroundColor: "{colors.night-raise}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.overdue-rose}"
    rounded: "{rounded.control}"
    height: "34px"
  input:
    backgroundColor: "{colors.night-well}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  state-cell:
    backgroundColor: "{colors.cell-amber}"
    rounded: "{rounded.cell}"
    size: "12px"
  rail-link-current:
    backgroundColor: "{colors.night-raise}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.control}"
    height: "34px"
  paper-sheet:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.cell}"
    padding: "44px 48px 36px"
---

# Design System: DevFlow

## Overview

**Creative North Star: "The Ledger of Cells"**

DevFlow is the business side of a Korean solo developer, drawn in the grammar of the contribution calendar the developer already reads every day. Every unit of work or money is a square that fills: a day of hours in the work calendar, an hour of an estimate in a project's hour run, a milestone, an invoice, a tenth of this month's goal. Hollow means opened, half-filled means in motion, solid means done or paid; a rose outline means late. The square is the only ornament the system allows, and it always carries data.

The workspace is a graphite night desk, used after a coding block beside a dark editor: two cool neutral layers, hairline rules, dense ruled lists and tables with tabular numerals, square-cornered controls. One heat ramp, dim copper → amber → sodium yellow, is spent only on data and on the single primary action. What the client sees — 견적서, 청구서 and the public profile — flips to the paper register: a white sheet, graphite ink, the same ramp read from pale to deep copper, the amount spelled out in Korean words and a square 도장 stamped when the money arrives.

**Key Characteristics:**
- The contribution calendar is the first viewport: 26 or 52 weeks of Monday-first day cells, sized from the container, capped at 30px.
- State is a fill level (hollow / partial / solid / rose outline), always paired with a text label.
- Dark desk for the developer, white paper for the client; the two never mix on one surface except as a sheet on the desk.
- Money and hours are exact: tabular numerals, JetBrains Mono for measured values only.
- Regions are separated by hairlines and whitespace, not boxed cards; panels appear only for a form or a single summary.

## Colors

A cool graphite night with one heat ramp; the ramp is data, never decoration.

### Primary
- **Amber** (cell-amber): the primary action (타이머 시작, 입금 확인, 견적서 만들기), the solid "done/paid" square, the current nav square, level 3 of the calendar.
- **Sodium Yellow** (cell-sodium): the top of the ramp — the busiest days, money arrived (deposit ticks under calendar weeks, this month's column in the revenue stacks), the running timer's clock and square, focus rings.

### Secondary
- **Dim Copper** (cell-copper) and **Low Amber** (cell-amber-dim): calendar levels 1 and 2, unplanned hours (tracked time with no estimate), list bullets on the price sheet.
- **Overdue Rose** (overdue-rose, overdue-rose-deep): overdue invoices, expired estimates, hours over estimate, destructive actions and field errors. Never used for anything that is merely important.

### Neutral
- **Night Ground** (night-ground): page field and the tab bar.
- **Night Panel** (night-panel): the second layer — rail, timer dock, kanban columns, summary panels.
- **Night Raise** (night-raise): hover and current states, table header fills.
- **Night Well** (night-well): input fields, sunk below the ground.
- **Lines** (night-line, night-line-strong): hairline rules between rows (1px) and control borders.
- **Ink ramp** (night-ink, night-ink-muted, night-ink-quiet): text; quiet ink stays ≥ 5:1 on the panel.
- **Paper register** (paper-ground, paper-sheet, paper-ink, paper-ink-muted, paper-line, paper-copper, paper-rose): the same roles for documents and the public profile; paper-copper is the paper's primary action, net amount and 도장.

### Named Rules
**The Data-Only Ramp Rule.** Copper, amber and sodium appear only where they encode hours, fill state, money or the one primary action on screen. No amber headings, borders or backgrounds for emphasis.

**The Label-With-Every-Square Rule.** A state square is never alone: 입금대기, 기한 4일 지남, 완료 always sit beside it in text.

## Typography

**Body Font:** Pretendard Variable (global), with Apple SD Gothic Neo / system fallbacks
**Measure Font:** JetBrains Mono (next/font, `--df-font-measure`) for the running clock, hours, document numbers and dates in dense lists — never for labels or prose.

**Character:** one workhorse Korean sans carries every role; weight and size do the hierarchy. The monospace is the developer's own editor face, admitted only where a value is measured.

### Hierarchy
- **Display** (800, clamp(2.75rem, 6vw, 4.5rem), 1): the developer's name on the public profile only.
- **Headline** (700, 1.4375rem, 1.25, −0.02em): page titles (개요, 프로젝트…); document heading on paper at 28px with 0.2em spacing (견 적 서).
- **Title** (650, 1rem): region titles (받을 돈, 마일스톤), card and plan names.
- **Body** (400, 0.875rem, 1.55): lists, forms, tables; prose capped near 70ch.
- **Label** (600, 0.75rem, 0.01em): field labels, table headers, meta lines.
- **Measure** (JetBrains Mono 500, 11–20px, tabular): 01:24:07, 37.5h, EST-20260924-001.

### Named Rules
**The Measured-Only Mono Rule.** If it is not a clock, an hour count, a date in a dense list or a document number, it is Pretendard.

## Layout

- Workspace: a 216px rail on the left (≥1024px), content padded 32–40px, max content width 1360px, and a 56px timer dock pinned to the bottom of every workspace page. Below 1024px the rail becomes a 52px top bar plus a five-item tab bar (60px + safe area) with a 전체 bottom sheet; the dock rides above the tab bar.
- Spacing on a 4px module (4, 8, 12, 16, 20, 24, 32, 40, 48). Regions are 32–40px apart; rows inside a region are 9–16px tall paddings separated by 1px rules.
- Pages are ruled lists and tables, not card grids. Two-column splits (1.6fr / 1fr) collapse to one column at 960–1080px.
- The work calendar sizes its squares from its container (`100cqi`), capped at 30px; under 560px of container width it drops to the most recent 26 weeks.
- Kanban: four columns side by side from 1180px; below that the board scrolls horizontally inside itself with snap, never the page.
- Documents: a 300px sticky action column beside a 794px sheet; below 1100px the actions stack above the sheet.

## Elevation & Depth

Flat by default: depth comes from tonal layers (ground → panel → raise, well sunk below) and hairline borders. Two shadows exist, both with offset and soft blur: the paper sheet on the desk (`0 1px 0 rgb(0 0 0 / .08), 0 24px 48px -24px rgb(0 0 0 / .7)`) and the timer toast (`0 6px 20px -8px rgb(0 0 0 / .6)`).

### Named Rules
**The Paper-Is-The-Only-Object Rule.** Only the client's document casts a shadow; everything else in the workspace is a layer, not an object.

## Shapes

Square language throughout: 2px on cells, 3px on controls and panels, nothing rounder. Pills and circles are absent; even the client initial in lists is a rounded square. Borders are 1px hairlines; 1.5px only for hollow state squares and the paper's amount box; 2px for the paper's heading rule.

## Components

### Buttons
- **Shape:** square-cornered (3px), 34px tall (28px small), 13px/600 label, optional 13–15px lucide icon.
- **Primary:** amber fill, dark amber ink; hover lightens to amber-hover; one per view.
- **Secondary:** transparent with a strong hairline; hover fills with night-raise.
- **Ghost:** no border, muted ink; used for icon tools (↑ ↓ 편집).
- **Danger:** rose text and rose-tinted hairline; hover fills rose-deep. Destructive actions confirm inline (질문 + 삭제 + 취소), never with a browser dialog.

### State squares
- **hollow** (1.5px inset line), **partial** (bottom half amber), **solid** (amber), **bright** (sodium), **warn** (rose outline), **warnSolid** (rose). Squares that change state fill from the bottom (scaleY, 220ms).

### Inputs / Fields
- **Style:** night-well fill, 1px line, 3px radius, 36px tall; label above (12px/600), hint and error below, wired with aria-describedby.
- **Focus:** amber border plus a 2px sodium outline offset 2px.
- **Error:** rose border and rose message under the field.

### Navigation
- **Rail:** each item is a 9px square + label + optional mono count; the current item's square fills amber on a night-raise row. Groups are separated by hairlines, not headings.
- **Tab bar (mobile):** four primary destinations with lucide icons plus 전체; the current icon turns amber.

### Work calendar (signature)
Monday-first weeks as columns, five levels (기록 없음, <2h, 2–4h, 4–6h, 6h+), today ringed in ink, deposit ticks in sodium under weeks with money in, a roving-tabindex keyboard grid (↑↓ day, ←→ week, Enter opens the day), and a dark tooltip clamped inside the grid. When a day's level rises, the new colour rises over the old one (480ms, off under reduced motion) — 칸 채우기.

### Timer dock (signature)
A fixed bar on every workspace page: hollow square + project picker + optional milestone and note + amber 타이머 시작; running, a sodium square, the project, the mono clock in sodium and 정지하고 기록. Timers over 12 hours ask before logging.

### Paper sheet (견적서 · 청구서)
White sheet, spaced heading (견 적 서 / 청 구 서), 수신 / 공급자 table, the amount in Korean words in a ruled box (일금 …원정), ruled item table, totals with 공급가액, 부가세 10% or 원천징수 3.3% split into 소득세 and 지방소득세, and 실입금액 in copper. A square copper 도장 (입금완료 + date) is stamped on paid invoices.

## Do's and Don'ts

### Do:
- **Do** express every status as a square plus its Korean label.
- **Do** keep amber for data and the one primary action; let everything else be graphite.
- **Do** separate regions with 1px rules and space; reach for a panel only to hold a form or a single summary.
- **Do** use tabular numerals for all money, and JetBrains Mono only for measured values.
- **Do** show the client-facing register on white paper, never dark.

### Don't:
- **Don't** add stat-card grids with big numbers and small labels; facts sit in ruled definition lists.
- **Don't** add eyebrow or kicker labels above headings, gradient text, glow halos or glass panels.
- **Don't** round anything past 3px or use pills and circles.
- **Don't** use colour alone for state, and don't use rose for anything that is not late, over, invalid or destructive.
