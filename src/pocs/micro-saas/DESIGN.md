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
  on-seal: "#ffffff"
  confirm-green: "#276a51"
  pending-amber: "#b0700d"
  pending-amber-ink: "#85530a"
  sunday-red: "#b93a2e"
  saturday-blue: "#2d5a9b"
  dialog-scrim: "#10151e8c"
  night-paper: "#161b24"
  night-paper-deep: "#10141b"
  night-field: "#1e2530"
  night-rule: "#33403f"
  night-ink: "#e4ece7"
  night-seal: "#ec6a57"
  night-confirm: "#6fc49d"
  night-pending: "#e2a847"
  kakao-chat-ground: "#b2c7d9"
  kakao-text: "#1b1b1b"
  kakao-sub: "#3f4a55"
  kakao-muted: "#5b6570"
  kakao-bubble: "#ffffff"
  kakao-box: "#f4f5f7"
  kakao-void: "#fdeceb"
  kakao-line: "#dfe3e8"
  kakao-button-text: "#525c66"
  kakao-yellow: "#fee500"
  kakao-yellow-ink: "#3c1e1e"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, Apple SD Gothic Neo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  price:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    letterSpacing: "-0.035em"
    fontFeature: "'tnum' 1"
  count:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
  count-sm:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    letterSpacing: "-0.03em"
  plan:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  time:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  input:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
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
  caption:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
  micro:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
  kakao-body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  seal:
    fontFamily: "Black Han Sans, Pretendard Variable, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  none: "0px"
  hairline: "2px"
  seal: "50%"
  kakao-button: "6px"
  kakao-box: "8px"
  kakao-avatar-sm: "12px"
  kakao-avatar: "14px"
  kakao-bubble: "4px 14px 14px 14px"
  kakao-screen: "18px"
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
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.cinnabar-seal}"
    rounded: "{rounded.hairline}"
    height: "44px"
  field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.none}"
    height: "46px"
  field-label:
    backgroundColor: "{colors.form-paper}"
    textColor: "{colors.form-ink-2}"
    typography: "{typography.label}"
    width: "88px"
  nav-item-active:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
  segment-selected:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
    height: "44px"
  time-slot:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.none}"
    height: "44px"
  date-chip:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.form-ink}"
    rounded: "{rounded.none}"
    width: "64px"
  date-chip-selected:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
  approval-box:
    backgroundColor: "{colors.field-white}"
    rounded: "{rounded.none}"
    height: "88px"
  toast:
    backgroundColor: "{colors.form-ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
  toast-error:
    backgroundColor: "{colors.cinnabar-seal}"
    textColor: "{colors.on-seal}"
---

# Design System: 예약잇다

## Overview

**Creative North Star: "The Signed Ledger"**

예약잇다 is drawn as a printed official form: pale celadon-grey paper, fine form-green rules, blue-black ink, and stamp inks. Every booking is a row in a ruled day-book with a 결재란 (approval box) at its right edge, and the owner's decision is a stamp pressed into that box. Sections are ruled regions of one sheet, not floating cards. Colour lives only in marks: seals, status boxes, the pending segment of the week's bars, and the calendar's Sunday and Saturday numerals. The text field stays ink-only.

The system is dense but calm, built to be read at arm's length on a phone at a salon counter. Time reads down the page, names read across, and empty time is drawn (dashed ghost lines, collapsed runs of free slots) instead of left blank; on the owner's side a free line is also where a new booking starts. The one authored motion is the stamp press.

The KakaoTalk 알림톡 preview is the single deliberate exception: it keeps Kakao's own chat ground, bubble, radii and yellow button, scoped to that preview, because it previews a real third-party surface.

**Key Characteristics:**
- Square corners, 1.5px ink frames for primary regions, 1px form-green rules inside them.
- State shown by stamp shape first and colour second: round seal (확정), dashed box (대기), rectangular void stamp (취소).
- Tabular numerals everywhere; times, counts, prices line up. Prices are written with thousands separators, also inside inputs.
- Light "form paper" by day, "ink pad at night" dark scheme via `prefers-color-scheme`.

## Colors

Restrained form palette: one paper, one ink, one rule family, and three stamp inks that carry all meaning.

### Primary
- **Form Ink** (#1d2738): body text, 1.5px frames, primary buttons (`새 예약`, `예약하기`, `예약 저장`), active nav tab, selected calendar day, date chip and segment, and today's bar in the week chart.
- **Cinnabar Seal** (#c23a2c): the brand seal logo, the 취소 stamp and cancel buttons, the 접수 receipt seal, the 인기 plan seal, today's ring in the calendar, destructive actions (삭제, 초기화), field errors, text selection. Text on a cinnabar fill (selection, error toast) is **On Seal** white.

### Secondary
- **Confirm Green** (#276a51): 확정 seals, confirm buttons, plan check icons, completed booking steps, saved-form confirmations.
- **Pending Amber** (#b0700d) with **Pending Amber Ink** (#85530a) for text: the dashed 대기 box, pending dots in the calendar, the dashed pending segment on the week's bars, overlap and conflict warnings.

### Neutral
- **Form Paper** (#e5ede8): the page ground, also painted on `html` so overscroll matches. Sampled to match the ground of the illustrations.
- **Deep Form Paper** (#d8e3dc): the navigation spine, closed days in the calendar, the booking page's demo strip, skeleton plates.
- **Field White** (#f3f7f4): writable fields, hover rows, the featured plan column, the 결재 box.
- **Form Rule** (#b7cabe), **Strong Rule** (#6f8f7e), **Faint Rule** (#cfdcd4): row rules, cell dividers, chart bars, skeleton bars.
- **Ink 2** (#3b4658) and **Ink 3** (#566170): secondary and tertiary text (Ink 3 keeps 4.5:1 on paper).
- **Sunday Red** (#b93a2e) and **Saturday Blue** (#2d5a9b): weekday numerals and labels only (calendar, date strip, closed-weekday picker).
- **Dialog Scrim** (#10151e8c): the backdrop behind the slip dialog.

### Night (ink pad)
Under `prefers-color-scheme: dark` the same roles swap to **Night Paper** (#161b24), **Night Paper Deep** (#10141b), **Night Field** (#1e2530), **Night Rule** (#33403f), **Night Ink** (#e4ece7), and brighter stamp inks: **Night Seal** (#ec6a57), **Night Confirm** (#6fc49d), **Night Pending** (#e2a847). Primary buttons invert to a light ink block with dark text.

### KakaoTalk exception
Scoped custom properties on the preview only: chat ground (#b2c7d9), text (#1b1b1b), sub text (#3f4a55), muted (#5b6570), bubble (#ffffff), detail box (#f4f5f7), voided box (#fdeceb), button line (#dfe3e8), button text (#525c66), Kakao yellow (#fee500) with its ink (#3c1e1e). These never leave the preview.

### Named Rules
**The Marks Carry Colour Rule.** Colour appears only in stamps, status boxes, and weekday numerals. Text, panels, and backgrounds stay paper and ink.

**The Shape Before Hue Rule.** Every status has its own mark shape plus its text label; never distinguish 확정/대기/취소 by colour alone.

## Typography

**Body Font:** Pretendard Variable (Apple SD Gothic Neo, Malgun Gothic, system-ui fallback), loaded globally.
**Seal Font:** Black Han Sans via `next/font` (not preloaded), used only inside stamps and the brand seal.

**Character:** A Korean workhorse sans for everything readable, and one carved, heavy face that appears only where ink is pressed.

### Hierarchy
- **Display** (800, clamp 1.75rem to 2.5rem, 1.1, -0.035em): the ledger date on the dashboard and the pricing headline. The year sits on its own small line above the date in Ink 3.
- **Price** (800, 2rem) and **Count** (800, 1.75rem; 1.5rem on narrow tallies and the shop name): plan prices and tally numbers, tabular.
- **Plan** (800, 1.25rem): plan names.
- **Headline** (800, 1.125rem): page title in the top bar, dialog titles, booking step titles, month title, date numbers in the date strip.
- **Time** (800, 1.0625rem): the start time of a day-book row; its end time (`~11:00`) sits under it in Caption, Ink 3.
- **Title** (800, 0.9375rem): ruled section heads (오늘의 예약, 결재 대기, 이번 주 예약).
- **Body** (400 to 700, 0.9375rem, 1.55): names, services, list rows. Inputs are set at 1rem so phones do not zoom. `word-break: keep-all` keeps Korean words whole.
- **Label** (600 to 700, 0.8125rem): field labels, meta lines, hints, sheet notes.
- **Caption** (600 to 700, 0.75rem) and **Micro** (600, 0.6875rem): tally labels, legends, date-strip counts, tab-bar labels, tags.

### Named Rules
**The Weight Not Size Rule.** Rank comes from weight and rules, not from size inflation. Only the ledger date, the pricing headline, prices and tally counts go large.

**The Seal Face Stays In The Seal Rule.** Black Han Sans never sets headings or UI text.

## Layout

- Desktop (1024px and wider): fixed 236px navigation spine on the left with a 1.5px ink edge; sticky top bar with the page title and the `새 예약` button; content padded 32px, max 1180px.
- Mobile and tablet (below 1024px): the spine becomes a six-cell bottom tab bar (64px plus safe area) with short labels; 요금제 is reached from 매장 설정. The top bar shows a small seal and the page title.
- Dashboard: ledger head (date left, four-cell tally right from 720px), then the day-book and a 320px column (결재 대기 list, then the week's bars) from 1100px.
- Calendar, customers and settings split into two columns from 1100px; the customer record is sticky on desktop and replaces the list on phones.
- Booking slip page (`/micro-saas/book`): outside the owner shell, a single 640px column framed in ink: the shop plate with its illustration, then the slip. A slim Deep Paper strip at the top says it is the demo's customer view.
- Rhythm: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48). Rows are 44px to 64px tall for counter use.

## Elevation & Depth

Flat. Depth comes from ruled frames and ink weight, not shadows. Only two floating layers carry shadow: the slip dialog (`0 24px 60px -12px` plus `0 4px 12px`, blue-black at low alpha) and the toast. Nothing at rest casts a shadow.

### Named Rules
**The Printed Sheet Rule.** If it is part of the page, it is printed on the page: rules and frames, never a card lifted off it.

## Shapes

Square corners throughout (0px for fields, slots, date chips, dialog; 2px on buttons to soften the edge at tap size). Circles appear only as seals (확정 stamp, today ring, completed step numbers). Stamps sit at a small deterministic tilt derived from the booking id (about ±9 degrees). The only rounded shapes on screen belong to the KakaoTalk preview.

## Components

### Buttons
- **Shape:** near-square (2px), 44px tall (36px small, 52px large).
- **Ink (primary):** Form Ink fill, On-Ink text, 700 weight. Hover shifts to Ink 2.
- **Line (secondary):** transparent with a 1.5px ink border; hover fills Field White.
- **Confirm / Cancel:** outlined in Confirm Green or Cinnabar; hover fills with the ink colour and paper text.
- **Danger:** outlined Cinnabar for 초기화 and destructive confirmations; always behind a confirmation slip.
- **Text:** underlined Ink 3 link-button for low-emphasis actions (cancelling a confirmed row, deleting a record).
- **Pending:** disabled at 55% with a present-tense label (`적는 중…`, `저장하는 중…`).

### Inputs / Fields
- **Style:** a printed 신청서 box: 1.5px ink frame, a paper-coloured label cell (88px) on the left separated by a strong rule, and a Field White entry cell. Stacked variant puts the label cell on top (date and time pairs).
- **Focus:** 2px ink outline offset 2px on the whole field.
- **Error:** frame turns Cinnabar; a Cinnabar message sits directly below and is linked with `aria-describedby`. Typed values stay after an error.
- **Overlap warning:** a dashed amber box explains the conflict, with a `겹쳐도 저장` checkbox the owner must tick to book over a full slot.

### Segmented choice
One ink frame split by strong rules; the selected cell is solid ink. Used for notice types, 확정/대기 when writing a booking, and closed weekdays.

### Navigation
- Desktop spine: ruled list, icon plus label; active item is a solid ink tab with paper text. The owner block (initial in an ink square, name, shop, 샘플 tag, reset) closes the spine.
- Mobile: bottom tab bar, same active treatment.

### Day-book Row (signature)
Grid of time (Time weight, end time beneath), name and service, optional actions, and a 76px 결재 cell with a left rule. Online bookings carry a small `온라인` tag. Cancelled rows stay in the book, struck through in Cinnabar. Past rows dim their time and text. Free slots are dashed ghost lines; runs of three or more collapse into one line reading "~ HH:MM · 빈 시간 N칸". Upcoming free lines are buttons that open the slip at that time (`+ 예약` appears on hover).

### Stamps (signature)
- **확정:** double-ring round seal in Confirm Green with the seal face.
- **대기:** dashed amber box with a light amber wash.
- **취소:** double-frame rectangle in Cinnabar.
- **접수 / 인기:** large round cinnabar seals on the receipt and the featured plan.
- A shared SVG ink-grain filter gives every seal a slightly uneven impression.
- **Stamp press:** when the owner presses a stamp, the new seal lands from 1.9x scale with a short blur to a slight overshoot and settles (about 0.5s, expo ease-out); the receipt's 접수 seal lands the same way. Reduced motion shows it instantly.

### 결재란 (booking slip)
On a booking's own page the record is a ruled dt/dd sheet with the approval column at its right edge: a boxed Field White cell holding the current seal at 1.4x, its label, and the stamps that can still be pressed (확정 도장, 취소 도장, 대기로 되돌리기).

### Tally
Four ruled cells in one 1.5px frame: 오늘 전체 예약, 확정, 대기, 취소, each with its mark shape and a large tabular count in the matching ink.

### Week bars
Seven columns Monday to Sunday on an ink baseline: confirmed as Faint Rule fill with a Strong Rule edge (today in solid ink), pending stacked on top as a dashed amber box. A ruled note under the bars gives the week's count and confirmed revenue.

### Date strip and slots (booking slip)
Fourteen 64px date chips in one ruled strip (scrolls sideways on phones): weekday, date, and remaining slots (`N칸`, `마감`, `휴무`); closed or full days are struck. Slots are 44px ink-framed cells; taken or past slots are dashed and struck.

### Toast
Ink bar at the bottom (above the tab bar on mobile) with an outlined 되돌리기 action for undoable changes; errors use a Cinnabar bar.

### Loading
Skeletons are the empty form: the same frames and rules with Faint Rule bars that fade slowly ("ink drying"), no spinner.

## Do's and Don'ts

### Do:
- **Do** frame primary regions with a 1.5px Form Ink rule and divide inside with 1px Form Rule lines.
- **Do** show every status as mark shape plus text label.
- **Do** keep cancelled bookings visible and struck through rather than removing them.
- **Do** use tabular numerals for all times, counts, and prices, and write prices with thousands separators.
- **Do** draw icons as 1.6px-stroke SVG from the ledger's own icon set.
- **Do** place illustrations on Form Paper so their ground matches the page.
- **Do** put destructive actions behind a confirmation slip and offer 되돌리기 for stamps and new bookings.

### Don't:
- **Don't** use rounded cards, drop shadows at rest, or gradient fills on the console.
- **Don't** use colour on text or panels outside stamps, status marks, and weekday numerals.
- **Don't** use emoji or Unicode glyphs as UI icons.
- **Don't** set headings in Black Han Sans.
- **Don't** restyle the KakaoTalk preview into the ledger palette, or let Kakao's radii and colours leave it.
