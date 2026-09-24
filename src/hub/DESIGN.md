---
name: 한국형 1인 SaaS 10선 (Hub)
description: A market arcade's guide map; ten products are shops with painted signs facing one aisle.
colors:
  enamel: "#0d5a44"
  enamel-ink: "#ffffff"
  ink: "#16202b"
  ink-2: "#34404c"
  ink-3: "#4f5a66"
  safety: "#e3a400"
  you-are-here: "#a8261f"
  concrete: "#dde2de"
  concrete-deep: "#cbd2cd"
  plaster: "#f2f4f1"
  window: "#ffffff"
  shutter-steel: "#aeb6b1"
  shutter-seam: "#8f9994"
typography:
  display:
    fontFamily: "Do Hyeon, Pretendard Variable, sans-serif"
    fontSize: "clamp(2.25rem, 1.1rem + 3.4vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  sign:
    fontFamily: "Do Hyeon, Pretendard Variable, sans-serif"
    fontSize: "clamp(1.4rem, 1.05rem + 0.7vw, 1.8rem)"
    fontWeight: 400
    lineHeight: 1.05
  lead:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.3vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    fontFeature: "'tnum' 1"
  caption:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
  plate:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.04em"
    fontFeature: "'tnum' 1"
rounded:
  none: "0px"
  dot: "50%"
spacing:
  s6: "6px"
  s8: "8px"
  s10: "10px"
  s12: "12px"
  s16: "16px"
  s20: "20px"
  s24: "24px"
  s40: "40px"
  gutter: "clamp(16px, 4vw, 48px)"
  housing: "12px"
  aisle: "52px"
components:
  entrance-board:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.none}"
    padding: "clamp(24px, 3.4vw, 32px) clamp(22px, 3.4vw, 40px)"
  entrance-title:
    textColor: "{colors.enamel-ink}"
    typography: "{typography.display}"
  directory-link:
    textColor: "{colors.enamel-ink}"
    typography: "{typography.label}"
  stall-sign:
    typography: "{typography.sign}"
    rounded: "{rounded.none}"
    padding: "14px 16px 12px"
  stall-front:
    backgroundColor: "{colors.plaster}"
    textColor: "{colors.ink}"
    padding: "10px 12px 12px"
  shop-window:
    backgroundColor: "{colors.window}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    padding: "22px 10px 10px"
  roll-shutter:
    backgroundColor: "{colors.shutter-steel}"
  unit-plate:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.plaster}"
    typography: "{typography.plate}"
    padding: "1px 6px"
  vacant-unit:
    backgroundColor: "{colors.concrete}"
    textColor: "{colors.ink-3}"
  vacant-plate:
    backgroundColor: "{colors.ink-3}"
    textColor: "{colors.plaster}"
    typography: "{typography.plate}"
    padding: "1px 6px"
  aisle:
    backgroundColor: "{colors.concrete-deep}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    height: "52px"
  notice-plaque:
    backgroundColor: "{colors.plaster}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "4px 20px"
  notice-title:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.plaster}"
    typography: "{typography.title}"
    padding: "10px 20px"
  button-enamel:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
---

# Design System: 한국형 1인 SaaS 10선 (Hub)

## Overview

**Creative North Star: "The Arcade Guide Map"**

The hub is drawn as the printed guide map (시장 안내도) posted at the entrance of a covered Korean market arcade: cool concrete ground, blue-black plan ink for walls, an enamel-green entrance board with a white keyline, and shops whose sign boards are painted in each product's own colour. Every unit carries a small number plate (가-01, 나-06), and a surveyor's title block sits under the plan. The hub owns the building; each product owns only its sign.

It is a plan, not a card grid. On wide screens two rows of shops face each other across a central aisle with their signs against it, and a vacant end-cap unit closes the aisle; below 1100px the aisle turns and runs down the left edge. Leftover cells are drawn as vacant units (빈 점포 · 입점 준비 중), so the plan is always whole and the next product has somewhere to move in. Density is moderate: each stall shows name, trade, tagline, and a short description behind its window.

The one authored moment is the opening: on load each window's roll shutter rolls up into its housing, staggered down the arcade, so the page opens for business. After that the only motion is a hovered storefront lifting and its arrow stepping forward. Reduced motion starts with every shop already open. The hub is light only.

**Key Characteristics:**

- Square corners; ink wall lines at fixed weights (1px shared walls, 2px sign edge, 1.5px window frame).
- Colour on the plan belongs to the shops: sign boards painted in each module's accent, lettered White or Ink by contrast.
- Do Hyeon on signs only; Pretendard Variable for everything read.
- Dashed ink marks a vacancy; the dashed amber line is the aisle.
- Flat at rest; one lift on hover; one staggered shutter opening on load.

## Colors

A concrete-and-ink building with one enamel fill and two signal colours; all other colour arrives on the shops' own sign boards.

### Primary

- **Enamel Green** (#0d5a44): the entrance board, the 404 return button, and text selection. The hub's only brand fill.
- **Plan Ink** (#16202b): wall lines, unit plates, the notice plaque's heading bar, primary text, and the dark option for sign lettering.

### Secondary

- **Safety Amber** (#e3a400): the path. The dashed aisle centre line, the lit lamp in the directory, and the halo around the focus ring. Line and lamp only, never a fill or text.
- **You-Are-Here Red** (#a8261f): the visitor's position marker at the aisle entrance, and nothing else.

### Neutral

- **Concrete** (#dde2de): the page ground and the floor of vacant units; also set on `html` while the hub is mounted.
- **Deep Concrete** (#cbd2cd): the aisle floor on desktop.
- **Plaster** (#f2f4f1): stall fronts, the notice plaque, the 404 panel, and lettering on ink plates.
- **Window White** (#ffffff): the shop window behind each tagline.
- **Enamel Lettering** (#ffffff): text on the enamel board, used at 92% for the promise line, 75% for directory plate numbers, 70% for the directory frame, and 45% for its inner rule.
- **Ink 2** (#34404c): descriptions, notice body text, the aisle label, footer text, the shutter housing and bottom rail.
- **Ink 3** (#4f5a66): tertiary text (title block), vacant-unit lettering and plates, section dividers.
- **Shutter Steel** (#aeb6b1) and **Slat Seam** (#8f9994): the roll shutter's slats only.

### Shop Paint (not hub tokens)

Each sign board is painted in its module's `accent` from `src/pocs/<slug>/meta.ts`, passed in as `--paint`. `signPaint()` in `contrast.ts` letters it in whichever of White (#ffffff) or Plan Ink (#16202b) has the higher WCAG contrast, then deepens (white lettering) or lightens (ink lettering) the accent in 4% steps only until the pair reaches 4.5:1, so the 13px trade line always reads while the sign stays recognisably the shop's colour.

### Named Rules

**The Paint Belongs To The Shop Rule.** Module accents appear only on their own sign board. Walls, aisle, text, plates, and buttons stay in the hub palette, and the hub never repaints a sign in a hub colour.

**The Lettering By Contrast Rule.** Sign lettering is White or Plan Ink, picked by `signPaint()`, never hand-chosen per shop, and the paint is nudged until the pair clears 4.5:1 for the 13px trade line.

**The Signals Stay Small Rule.** Safety Amber and You-Are-Here Red mark the path and the visitor. They never fill a surface.

## Typography

**Display Font:** Do Hyeon (via `next/font`, exposed as `--font-sign`; falls back to Pretendard Variable)
**Body Font:** Pretendard Variable (loaded globally; Apple SD Gothic Neo, Malgun Gothic, system-ui fallback)

**Character:** A sign-painter's face for the words painted on boards, and a clean Korean workhorse sans for everything read up close. Numerals are tabular throughout.

### Hierarchy

- **Display** (Do Hyeon 400, clamp(2.25rem, 1.1rem + 3.4vw, 4.25rem), 1.02, -0.01em): the entrance board title only, balanced wrap.
- **Sign** (Do Hyeon 400, clamp(1.4rem, 1.05rem + 0.7vw, 1.8rem), 1.05): shop names on sign boards and on vacant units. The 404 page's vacant-unit sign runs larger (clamp(2rem, 1.4rem + 2.4vw, 3rem), 1.1).
- **Lead** (400, clamp(1rem, 0.95rem + 0.3vw, 1.125rem), 1.6, max 44ch): the one promise line on the entrance board.
- **Title** (800, 1rem): the notice plaque's heading bar and its item heads. Stall taglines sit just below this in rank (700, 0.9375rem, 1.45).
- **Body** (400, 0.9375rem, 1.65, max 62ch): notice plaque text in Ink 2.
- **Caption** (400, 0.8125rem, 1.6; 0.875rem below 1100px): the description behind each shop window, in Ink 2.
- **Label** (600 to 800, 0.75rem to 0.875rem): the sign's trade line (0.8125rem 700), aisle label, you-are-here marker, directory entries (0.8125rem 600), title block (0.75rem 600), vacant note (0.875rem 800).
- **Plate** (700, 0.6875rem, 0.04em): unit plates (가-01).

### Named Rules

**The Sign Face Stays On Signs Rule.** Do Hyeon sets only painted signs: the entrance board title, stall and vacant-unit names, and the 404 sign. Promise, taglines, descriptions, notices, labels, and plates are Pretendard.

**The Weight Not Size Rule.** Reading text stays between 0.6875rem and 1.125rem and ranks by weight (700 to 800 for heads, taglines, and labels). Only signs go large.

## Layout

- **Frame:** page gutter clamp(16px, 4vw, 48px). The entrance board, plan, and footer share a 1320px maximum; the notice plaque is narrower (760px). The notice plaque and footer sit clamp(40px, 6vw, 72px) and clamp(40px, 6vw, 64px) below what precedes them.
- **Desktop arcade (1100px and wider):** a grid of N unit columns (N = half the modules, rounded up, passed as `--units`) plus an end-cap column (minmax(128px, 0.5fr)). Rows are upper stalls, a 52px aisle, and lower stalls. Upper stalls reverse their stacking so both rows' signs border the aisle. The vacant end cap spans all three rows and closes the aisle. The entrance board splits 1.3fr / 1fr, with the directory in two columns.
- **Tablet (720px to 1099px):** the entrance board is one column and the directory collapses to its lamp and shop count. The aisle becomes a 40px rail down the left edge with a vertical label (`writing-mode: vertical-rl`) and the you-are-here marker at its top. Stalls sit in two columns; the end cap spans the full width.
- **Phone (below 720px):** one column of stalls along the rail; the title block aligns left.
- **Numbering:** the upper row is 가, the lower row 나, two-digit unit numbers continuing through vacancies.
- **Rhythm:** tight 2px steps inside a stall (6, 8, 10, 12, 14, 16px), 20 to 24px in plaques and board gaps, 40px for the board's column gap and the aisle rail.

### Named Rules

**The Plan Never Has A Hole Rule.** Every grid cell is a unit. Leftover lower-row cells and the aisle's end are drawn as vacant units, so a new module fills a vacancy instead of breaking the plan.

**The Signs Face The Aisle Rule.** Wherever two rows of shops exist, both rows' sign boards border the aisle.

## Elevation & Depth

Flat. Depth is carried by ink line weight, not cast shadows. `box-shadow` is used mainly to draw lines: the enamel board's inset white keyline, the shared walls between units, and the ring around the you-are-here dot. The only cast shadow is a hovered storefront's lift, applied only when the device has a fine hovering pointer.

### Shadow Vocabulary

- **Enamel keyline** (`box-shadow: inset 0 0 0 6px #0d5a44, inset 0 0 0 8px rgb(255 255 255 / 0.85)`): the white line inset from the entrance board's edge.
- **Party wall** (`box-shadow: 0 0 0 1px #16202b`): each stall draws 1px, so neighbours share a 2px wall.
- **Marker ring** (`box-shadow: 0 0 0 3px #cbd2cd, 0 0 0 5px #a8261f`): the you-are-here dot's outer ring (the gap colour follows the ground it sits on).
- **Storefront lift** (`box-shadow: 0 14px 24px -14px rgb(22 32 43 / 0.55)` with `translateY(-3px)`): hover on a stall, fine pointers only.

### Named Rules

**The Printed Plan Rule.** Nothing at rest lifts off the plan. Shadows draw walls, keylines, and rings; the one cast shadow belongs to a hovered storefront.

## Shapes

Square corners everywhere (0px): board, stalls, windows, plates, plaques, buttons. Circles appear only as lights and markers: the 9px directory lamp and the 14px you-are-here dot. Lines carry the structure at fixed weights: 1px arcade frame and shared walls, 2px sign edge and plaque frame, 1.5px window frame and directory frame, 1px dividers in Ink 3. Dashes carry two meanings: dashed ink marks a vacancy (a vacant unit's sign edge, the 404 frame), and the 3px dashed Safety Amber line is the aisle. Each shop window has a 12px Ink 2 housing bar across its top edge; the shutter is drawn as 9px steel slats with 2px seams over a 7px Ink 2 bottom rail.

## Components

### Entrance Board

- **Character:** an enamel shop-arcade sign.
- **Style:** Enamel Green fill, square, with the inset white keyline; Display title and Lead promise in Enamel Lettering.
- **Directory:** a 1.5px white frame (70%) holding a lamp, "점포 안내 · N개 가게 영업 중", and a two-column list of plate number plus shop name. Below 1100px only the lamp and count remain.

### Navigation (Directory Links)

- **Style:** Label type in Enamel Lettering with the plate number at 75%; 2px vertical padding.
- **Hover:** underline, 3px offset.

### Stall (signature)

- **Sign board:** painted in the module accent with contrast-picked lettering; Sign-type name, a trade line (Label) with a 16px arrow, and the unit plate pinned 10px from the top-right corner. A 2px ink edge separates it from the front.
- **Front:** Plaster, holding the tagline (700, 0.9375rem) and the shop window.
- **Window:** Window White, 1.5px ink frame, 12px housing bar, Caption description in Ink 2.
- **Whole stall is one link.** Hover (fine pointer only): lifts 3px with the storefront lift shadow, and the arrow steps 4px forward, both 320ms on the expo ease-out (cubic-bezier(0.16, 1, 0.3, 1)).
- **Desktop upper row:** sign at the bottom, facing the aisle.

### Roll Shutter and the Opening (signature)

- **Style:** steel slats (Shutter Steel with Slat Seam) and an Ink 2 bottom rail, covering the window only; it sits under the housing bar.
- **Motion:** on load each shutter rolls up into its housing (760ms, expo ease-out), staggered by stall index: 160ms + 55ms per stall, upper row first.
- **Reduced motion:** no animation; the shutter's resting state is already rolled up, so every shop starts open.

### Vacant Unit

- **Style:** Concrete floor, transparent sign with Ink 3 lettering and a dashed bottom edge, Ink 3 plate; "빈 점포 · 입점 준비 중", tagline "새 가게가 들어올 자리", and an underlined "입점 안내" note with a 16px plus icon. Links to the architecture document.
- **End cap:** the plate moves into the flow above the name, because the unit is narrow.

### Aisle and You-Are-Here Marker

- **Aisle:** Deep Concrete floor (desktop) with a 3px dashed Safety Amber centre line and a "중앙 통로" label knocked out of the line.
- **Marker:** a 14px You-Are-Here Red dot with a ring, and "현재 위치 · 입구" in Label type in the same red. Decorative (`aria-hidden`).

### Unit Plate

- **Style:** Plan Ink block, Plaster lettering in Plate type, 1px by 6px padding, square. Vacant units use Ink 3.

### Title Block

- **Style:** a row of Ink 3 bordered cells in Label type (0.75rem 600) under the plan, right-aligned (left-aligned on phones): floor name, shop and vacancy counts, and the sample-data notice.

### Notice Plaque

- **Style:** Plaster panel with a 2px ink frame; a Plan Ink heading bar in Title type; a definition list with Title heads, Body text in Ink 2, and 1px Ink 3 dividers.

### Buttons

- **Enamel Button:** the only button-like control (404 page): Enamel Green, Enamel Lettering, 800 weight, 12px by 18px padding, square.

### Links and Focus

- **Inline links:** footer links are 700 weight in Plan Ink, underlined at a 4px offset.
- **Focus:** a 3px Plan Ink outline at a 3px offset (high contrast on concrete, plaster and window white) with a 6px Safety Amber halo behind it that carries the ring on the enamel board.

### 404 (Vacant Unit Page)

A single square Plaster panel with a 2px dashed ink frame, a Plan Ink "404" plate, a Sign-face title, a 40ch body in Ink 2, and the Enamel Button back to the map.

## Do's and Don'ts

### Do:

- **Do** paint each sign board in its module's `accent` and letter it through `signPaint()`, White (#ffffff) or Plan Ink (#16202b).
- **Do** confirm the picked lettering reaches 4.5:1 on the accent for the 13px trade line.
- **Do** draw walls in Plan Ink at the fixed weights: 1px shared walls and frame, 2px sign edge, 1.5px window frame.
- **Do** give every unit a plate (가/나 plus two digits), numbering on through vacancies.
- **Do** fill leftover cells and the aisle's end with vacant units.
- **Do** keep the shutter on the window only, staggered 55ms per stall, resting in the open position so reduced motion starts open.
- **Do** use tabular numerals, and draw icons as inline Lucide SVG at 16px with a 2.25 to 2.5 stroke.

### Don't:

- **Don't** round corners; circles are only the directory lamp and the you-are-here dot.
- **Don't** cast shadows at rest; the only cast shadow is the hovered storefront's lift.
- **Don't** use gradient fills on surfaces; gradients only draw the shutter's slats and rail.
- **Don't** use a module accent anywhere but its own sign board, or a hub colour on a sign board.
- **Don't** set Do Hyeon outside sign boards.
- **Don't** set text in Safety Amber or use it as a fill; it measures 1.4 to 1.7:1 on concrete.
- **Don't** leave an empty grid cell or an empty-state block where a vacant unit belongs.
