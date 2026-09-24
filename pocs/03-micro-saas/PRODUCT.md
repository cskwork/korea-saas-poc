# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The owner approved the revamp "as recommended"
> (2026-09-24), so every fact below is inferred from the existing site, README, and app code.
> Items marked (assumption) were not confirmed by the owner.

## Platform

web

## Users

- **Primary: the shop owner (사장님)** of a reservation-based Korean small business: hair salon,
  nail shop, clinic, or café. The demo shop is a hair salon ("뷰티헤어살롱"). They check and change
  today's bookings between customers, mostly on a phone at the counter, sometimes on a tablet or
  desktop at reception (assumption, based on the mobile-first README and the counter workflow).
- **Secondary: the shop's customer**, who books through the shop's public booking page on a phone.
- **Tertiary: a prospective buyer** comparing plans on the pricing page.

## Product Purpose

예약잇다 moves a shop from a handwritten 예약장 (paper appointment book) to a digital one, so the owner
spends less time on the phone, sees no-shows coming, and keeps a customer record without extra work.
Success for the owner: in one glance they know who comes next today and what still needs a decision.

## Positioning

One small tool that joins the owner's book, the customer's booking page, and KakaoTalk 알림톡
notices, sized and priced for a one-chair or few-chair Korean shop rather than for chains.

## Operating Context

- Owner flow: dashboard (today's counts, the week's volume, today's timeline) → confirm or cancel
  pending bookings → calendar by month → add a booking by hand → look up a customer and their history.
- Customer flow: pick a service → pick a date and a free 30-minute slot → leave name and phone → done;
  the booking lands as 대기 (pending) for the owner.
- Notices go out as KakaoTalk 알림톡 (confirm, reminder, cancel); the app shows previews only.
- Business hours in the demo: 10:00 to 20:00, 30-minute slots.

## Capabilities and Constraints

- Static POC: HTML, CSS, vanilla JavaScript, no build step, deployed as static files on Vercel.
- All data lives in the browser's localStorage (`yeyakitda_data`); sample data is generated on first run.
- No backend, no real 알림톡 sending, no payments, no accounts.
- Statuses: 확정 (confirmed), 대기 (pending), 취소 (cancelled).
- Services in the demo: 커트 ₩15,000/30분, 펌 ₩50,000/120분, 염색 ₩40,000/90분, 클리닉 ₩30,000/60분,
  드라이 ₩10,000/20분.
- Plans shown: Free ₩0, Pro ₩30,000/월, Business ₩80,000/월, with the feature table as written.
  These are POC plan ideas, not live prices.

## Brand Commitments

- Name: 예약잇다 (YeyakItda). Korean UI throughout.
- KakaoTalk 알림톡 preview keeps Kakao's own chat look (yellow bubble buttons, blue-grey chat ground),
  because it previews a real third-party surface.
- Status colours carry meaning: 확정 = green, 대기 = amber/yellow, 취소 = red (from the README).

## Evidence on Hand

- Demo shop, address, phone, customers, and bookings are synthetic sample data in `app.js`.
- There are no real customers, testimonials, usage numbers, or reviews. Do not invent any.

## Product Principles

1. Today first: the next customer and the open decisions outrank every chart.
2. One tap at the counter: common actions (confirm, cancel, add) take one tap and work one-handed.
3. The paper book's clarity, not its limits: time reads down the page, names read across.
4. Honest demo: synthetic data stays labelled as sample; prices stay labelled as plans.

## Accessibility & Inclusion

- Readable at arm's length at the counter: large time labels, strong contrast (WCAG AA minimum).
- Status must never rely on colour alone (label text always present).
- Keyboard and screen-reader use for the owner console and the booking flow (assumption: standard AA).
