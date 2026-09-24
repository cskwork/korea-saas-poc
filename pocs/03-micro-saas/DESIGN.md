---
name: 예약잇다
description: A signed ledger for small Korean shops; bookings are rows, decisions are stamps.
colors:
  form-paper: "#e5ede8"
  form-paper-deep: "#d8e3dc"
  field-white: "#f3f7f4"
  form-rule: "#b7cabe"
  form-rule-strong: "#6f8f7e"
  form-rule-faint: "#cfdcd4"
  form-ink: "#1d2738"
  form-ink-2: "#3b4658"
  form-ink-3: "#566170"
  on-ink: "#eef4f0"
  cinnabar-seal: "#c23a2c"
  confirm-green: "#276a51"
  pending-amber: "#b0700d"
  pending-amber-ink: "#85530a"
  sunday-red: "#b93a2e"
  saturday-blue: "#2d5a9b"
  kakao-chat-ground: "#b2c7d9"
  kakao-yellow: "#fee500"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
  seal:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  none: "0px"
  hairline: "2px"
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
  button-ink:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.hairline}"
    padding: "0 16px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.form-ink-2}"
    textColor: "{colors.on-ink}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.hairline}"
    padding: "0 16px"
    height: "44px"
  button-confirm:
    backgroundColor: "transparent"
    textColor: "{colors.confirm-green}"
    height: "36px"
  button-cancel:
    backgroundColor: "transparent"
    textColor: "{colors.cinnabar-seal}"
    height: "36px"
  field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.none}"
    height: "46px"
  nav-item-active:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
  time-slot:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.none}"
    height: "44px"
---

# Design System: 예약잇다

## Overview

**Creative North Star: "The Signed Ledger"**

예약잇다 is drawn as a printed official form: pale celadon-grey paper, fine form-green rules, blue-black ink, and stamp inks. Every booking is a row in a ruled day-book with a 결재란 (approval box) at its right edge, and the owner's decision is a stamp pressed into that box. Sections are ruled regions of one sheet, not floating cards. Colour lives only in marks: seals, status boxes, and the calendar's Sunday and Saturday numerals. The text field stays ink-only.

The system is dense but calm, built to be read at arm's length on a phone at a salon counter. Time reads down the page, names read across, and empty time is drawn (dashed ghost lines, collapsed runs of free slots) instead of left blank. The one authored motion is the stamp press.

The KakaoTalk 알림톡 preview is the single deliberate exception: it keeps Kakao's own chat ground, bubble, and yellow button, because it previews a real third-party surface.

**Key Characteristics:**
- Square corners, 1.5px ink frames for primary regions, 1px form-green rules inside them.
- State shown by stamp shape first and colour second: round seal (확정), dashed box (대기), rectangular void stamp (취소).
- Tabular numerals everywhere; times, counts, prices line up.
- Light "form paper" by day, "ink pad at night" dark scheme via `prefers-color-scheme`.

## Colors

Restrained form palette: one paper, one ink, one rule family, and three stamp inks that carry all meaning.

### Primary
- **Form Ink** (#1d2738): body text, 1.5px frames, primary buttons (`새 예약`, `예약하기`), active nav tab, selected calendar day and time slot.
- **Cinnabar Seal** (#c23a2c): the brand seal logo, the 취소 stamp and cancel buttons, the 접수 receipt stamp, the 인기 plan seal, today's ring in the calendar, text selection.

### Secondary
- **Confirm Green** (#276a51): 확정 seals, confirm buttons, plan check icons, completed booking steps.
- **Pending Amber** (#b0700d) with **Pending Amber Ink** (#85530a) for text: the dashed 대기 box, pending dots in the calendar, conflict warnings.

### Neutral
- **Form Paper** (#e5ede8): the page ground. Sampled to match the ground of the generated illustrations so rasters sit on the page without a visible box.
- **Deep Form Paper** (#d8e3dc): the navigation spine.
- **Field White** (#f3f7f4): writable fields, hover rows, the featured plan column.
- **Form Rule** (#b7cabe), **Strong Rule** (#6f8f7e), **Faint Rule** (#cfdcd4): row rules, cell dividers, chart bars.
- **Ink 2** (#3b4658) and **Ink 3** (#566170): secondary and tertiary text (Ink 3 keeps 4.5:1 on paper).
- **Sunday Red** (#b93a2e) and **Saturday Blue** (#2d5a9b): calendar weekday numerals only.

### Named Rules
**The Marks Carry Colour Rule.** Colour appears only in stamps, status boxes, and weekday numerals. Text, panels, and backgrounds stay paper and ink.

**The Shape Before Hue Rule.** Every status has its own mark shape plus its text label; never distinguish 확정/대기/취소 by colour alone.

## Typography

**Body Font:** Pretendard Variable (Apple SD Gothic Neo, Malgun Gothic, system-ui fallback)
**Seal Font:** Black Han Sans, used only inside stamps and the brand seal.

**Character:** A Korean workhorse sans for everything readable, and one carved, heavy face that appears only where ink is pressed.

### Hierarchy
- **Display** (800, clamp 1.75rem to 2.5rem, 1.1, -0.035em): the ledger date on the dashboard and the pricing headline. The year sits inline at 0.45em in Ink 3.
- **Headline** (800, 1.125rem): page title in the top bar, dialog titles, booking step titles.
- **Title** (800, 0.9375rem): ruled section heads (오늘의 예약, 주간 예약 통계).
- **Body** (400 to 700, 0.9375rem, 1.55): names, services, list rows. `word-break: keep-all` keeps Korean words whole.
- **Label** (600 to 700, 0.75rem to 0.8125rem): field labels, tally labels, meta lines.

### Named Rules
**The Weight Not Size Rule.** Rank comes from weight and rules, not from size inflation. Three sizes carry the console; only the ledger date and pricing headline go large.

**The Seal Face Stays In The Seal Rule.** Black Han Sans never sets headings or UI text.

## Layout

- Desktop (1024px and wider): fixed 236px navigation spine on the left with a 1.5px ink edge; sticky top bar with the page title and the `새 예약` button; content padded 32px, max 1180px.
- Mobile and tablet (below 1024px): the spine becomes a six-cell bottom tab bar (64px plus safe area) with short labels; the top bar shows a small seal and the page title.
- Dashboard: ledger head (date left, four-cell tally right from 720px), then day-book and a 300px weekly chart column from 1100px.
- Calendar and customers split into two columns from 1100px; the detail panel is sticky on desktop.
- Public booking page: a single 640px column framed in ink: illustration plate, shop details, then the booking slip.
- Rhythm: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48). Rows are at least 44px to 64px tall for counter use.

## Elevation & Depth

Flat. Depth comes from ruled frames and ink weight, not shadows. Only two floating layers carry shadow: the dialog (`0 24px 60px -12px` plus `0 4px 12px`, blue-black at low alpha) and the toast. Nothing at rest casts a shadow.

### Named Rules
**The Printed Sheet Rule.** If it is part of the page, it is printed on the page: rules and frames, never a card lifted off it.

## Shapes

Square corners throughout (0px for fields, slots, dialog; 2px on buttons to soften the edge at tap size). Circles appear only as seals (확정 stamp, today ring, completed step numbers). Stamps sit at a small deterministic tilt derived from the booking id (about ±9 degrees).

## Components

### Buttons
- **Shape:** near-square (2px), 44px tall (36px small, 52px large).
- **Ink (primary):** Form Ink fill, On-Ink text, 700 weight. Hover shifts to Ink 2.
- **Line (secondary):** transparent with a 1.5px ink border; hover fills Field White.
- **Confirm / Cancel:** outlined in Confirm Green or Cinnabar; hover fills with the ink colour and paper text.
- **Text:** underlined Ink 3 link-button for low-emphasis actions (cancelling an already confirmed row).

### Inputs / Fields
- **Style:** a printed 신청서 box: 1.5px ink frame, a paper-coloured label cell (88px) on the left separated by a strong rule, and a Field White entry cell.
- **Focus:** 2px ink outline offset 2px on the whole field.
- **Error:** frame turns Cinnabar; a Cinnabar message sits directly below and is linked with `aria-describedby`.

### Navigation
- Desktop spine: ruled list, icon plus label; active item is a solid ink tab with paper text.
- Mobile: bottom tab bar, same active treatment.

### Day-book Row (signature)
Grid of time (800 weight), name and service, optional actions, and a 76px 결재 cell with a left rule. Cancelled rows stay in the book, struck through in Cinnabar. Past rows dim their time and text. Runs of three or more free slots collapse into one dashed line reading "~ HH:MM · 빈 시간 N칸".

### Stamps (signature)
- **확정:** double-ring round seal in Confirm Green with the seal face.
- **대기:** dashed amber box with a light amber wash.
- **취소:** double-frame rectangle in Cinnabar.
- A shared SVG ink-grain filter gives every seal a slightly uneven impression.
- **Stamp press:** when a status changes, the new seal lands from 1.9x scale with a short blur to a slight overshoot and settles (about 0.5s, expo ease-out). Reduced motion shows it instantly.

### Tally
Four ruled cells in one 1.5px frame: 오늘 전체 예약, 확정, 대기, 취소, each with its mark shape and a large tabular count in the matching ink.

### Toast
Ink bar at the bottom (above the tab bar on mobile) with an outlined 되돌리기 action for undoable changes.

## Do's and Don'ts

### Do:
- **Do** frame primary regions with a 1.5px Form Ink rule and divide inside with 1px Form Rule lines.
- **Do** show every status as mark shape plus text label.
- **Do** keep cancelled bookings visible and struck through rather than removing them.
- **Do** use tabular numerals for all times, counts, and prices.
- **Do** draw icons as 1.6px-stroke SVG from the shared sprite.
- **Do** place illustrations on Form Paper so their ground matches the page.

### Don't:
- **Don't** use rounded cards, drop shadows at rest, or gradient fills on the console.
- **Don't** use colour on text or panels outside stamps, status marks, and weekday numerals.
- **Don't** use emoji or Unicode glyphs as UI icons (emoji inside the 알림톡 message preview is message content, not UI).
- **Don't** set headings in Black Han Sans.
- **Don't** restyle the KakaoTalk preview into the ledger palette.
