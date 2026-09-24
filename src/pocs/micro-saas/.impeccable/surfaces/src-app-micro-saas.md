---
version: 1
slug: "src-app-micro-saas"
primary_target: "src/app/micro-saas"
related_targets: ["src/pocs/micro-saas/components"]
---

# Surface brief: 예약잇다 owner console + public booking page (Next.js module)

Scope: the `/micro-saas` route tree (`src/app/micro-saas/**`, components in `src/pocs/micro-saas/components/**`):
대시보드 `/micro-saas`, 예약 관리 `/micro-saas/calendar`, 예약 상세 `/micro-saas/bookings/[id]`, 고객 관리 `/micro-saas/customers[/id]`,
알림톡 미리보기 `/micro-saas/notifications`, 요금제 `/micro-saas/pricing`, 매장 설정 `/micro-saas/settings`, and the customer-facing
고객 예약 페이지 `/micro-saas/book` (outside the owner shell). Legacy hash links (`#/calendar`, `#/booking`, ...) forward to these routes.
Mode: Operate (owner console, booking flow). 요금제 is a Persuade sub-view inside the same world.
Audience/job: shop owner at the counter checking who comes next and stamping pending bookings; customer booking one slot on a phone.
Constraints: Postgres per workspace (no localStorage), server-side slot conflict check, Korean copy preserved, Kakao preview keeps Kakao's own look.
Decision note: established, owner-approved world ("The Signed Ledger", 2026-09-24). Ported and extended, not re-rolled: per new-work
"Established world: inherit it", no new direction roll ran; the contract and seed key below are the original round's. This port ran
unattended (no question tool, no user present). Build path: code-led (no image generation available).

Extensions this port adds inside the world (no new identity): stamp actions on a "결재 대기" list of upcoming pending bookings,
ghost free slots that open the new-booking slip at that time, booking time spans (start and end), a per-booking slip page,
a settings sheet (shop, hours, seats, closed weekdays, services), usage-against-plan lines on 요금제, and a date strip on the booking slip.

Finish status (2026-09-24): detector run once (design-system findings only: off-ramp type sizes and the Kakao palette, both tokenized and recorded in DESIGN.md); finish review ran in-thread (no subagent tool in this harness), disposition fix with three material fixes (empty-time error copy, unformatted prices in the service editor, pricing table clipped at 390px), recaptured, all three resolved; DESIGN.md and .impeccable/design.json updated from the build; raster provenance kept in docs/asset-register.md + docs/asset-sidecars/.

## Direction contract

THESIS: The shop's book is a signed ledger. Every booking is a row in a ruled day-book with a 결재란 (approval box), and the owner's decision is a stamp pressed into it. Refuses the category default: indigo SaaS cards, KPI tiles, gradient hero.

OWN-WORLD: Official-form paper: pale celadon-grey ground printed with fine form-green rules, deep blue-black form ink for text, 인주 cinnabar for the brand seal and 취소 stamps, form-green ink for 확정 seals, amber dashed box for 대기. Hairline ruled tables, boxed field labels like a printed 신청서, square corners, no drop-shadow cards. Pretendard for all text with tabular numerals; Black Han Sans only inside seals. Colour lives in stamps and states; the text field stays ink-only.

STORY: The owner sees today's book first: the next customer, the rows still waiting for a stamp, and free cells drawn as ghost rows. One tap stamps 확정 or 취소, and one tap takes it back. The customer fills a three-part booking slip and gets a stamped receipt; the slip only offers slots the shop's real hours and seats allow.

FIRST VIEWPORT: Left spine (desktop) with the cinnabar square seal logo and ruled index tabs; top ledger header: date large (tabular), counts as a ruled tally strip (전체/확정/대기/취소), primary "새 예약" in ink-blue at top right. Below: today's day-book, hour column left, names across, 결재란 at the right edge of each row; a narrow right column holds the 결재 대기 list and the week's bars. On mobile the spine becomes a bottom tab bar; the day-book fills the screen.

FORM: Seal and approval-stamp world (도장/결재란), position 7 of 7 on the ordered list; seed key 119edaa6.
- Raise (seven-segment display): absence is drawn; free slots render as faint ghost rows, not blank space.
- Raise (normalled jackfield): state reads by stamp shape (round seal, dashed empty box, rectangular void) not hue alone.
- Raise (timetable slide rack): three-step type scale; rank by weight and case, not size inflation.
- Raise (ticket wallet, competitive): nothing disappears, it cancels; cancelled rows stay in the book, struck and stamped.
- Raise (cloud quarry / cloud edge): all times, counts, prices in tabular figures; colour confined to marks.
Signature interaction: stamping. Pressing 확정 thumps a round seal into the 결재 box with a slight deterministic tilt and ink-spread settle (reduced motion: appears instantly); the receipt's 접수 seal lands the same way.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
