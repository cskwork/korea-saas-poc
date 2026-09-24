---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: 예약잇다 owner console + public booking page

Scope: `pocs/03-micro-saas/index.html` (single-page app: 대시보드, 예약 관리, 고객 관리, 알림톡 미리보기, 고객 예약 페이지, 요금제).
Mode: Operate (owner console, booking flow). The 요금제 view is a Persuade sub-view inside the same world.
Audience/job: shop owner at the counter checking who comes next and stamping pending bookings; customer booking one slot on a phone.
Constraints: static HTML/CSS/JS, localStorage only, Korean copy preserved, Kakao preview keeps Kakao's own look.
Decision note: owner approved "as recommended" (2026-09-24); no interactive round was held. Build path: code-led (not stored in config).

## Direction contract

THESIS: The shop's book is a signed ledger. Every booking is a row in a ruled day-book with a 결재란 (approval box), and the owner's decision is a stamp pressed into it. Refuses the category default: indigo SaaS cards, KPI tiles, gradient hero.

OWN-WORLD: Official-form paper: pale celadon-grey ground printed with fine form-green rules, deep blue-black form ink for text, 인주 cinnabar for the brand seal and 취소 stamps, form-green ink for 확정 seals, amber dashed box for 대기. Hairline ruled tables, boxed field labels like a printed 신청서, square corners, no drop-shadow cards. Pretendard for all text with tabular numerals; Black Han Sans only inside seals. Colour lives in stamps and states; the text field stays ink-only.

STORY: The owner sees today's book first: the next customer, the rows still waiting for a stamp, and free cells drawn as ghost rows. One tap stamps 확정 or 취소. The customer fills a three-part booking slip and gets a stamped receipt.

FIRST VIEWPORT: Left spine (desktop) with the cinnabar square seal logo and ruled index tabs; top ledger header: date large (tabular), counts as a ruled tally strip (전체/확정/대기/취소), primary "새 예약" in ink-blue at top right. Below: today's day-book, hour column left, names across, 결재란 at the right edge of each row. On mobile the spine becomes a bottom tab bar; the day-book fills the screen.

FORM: Seal and approval-stamp world (도장/결재란), position 7 of 7 on the ordered list; seed key 119edaa6.
- Raise (seven-segment display): absence is drawn; free slots render as faint ghost rows, not blank space.
- Raise (normalled jackfield): state reads by stamp shape (round seal, dashed empty box, rectangular void) not hue alone.
- Raise (timetable slide rack): three-step type scale; rank by weight and case, not size inflation.
- Raise (ticket wallet, competitive): nothing disappears, it cancels; cancelled rows stay in the book, struck and stamped.
- Raise (cloud quarry / cloud edge): all times, counts, prices in tabular figures; colour confined to marks.

Signature interaction: stamping. Pressing 확정 thumps a round seal into the 결재 box with a slight random tilt and ink-spread settle (reduced motion: appears instantly).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
