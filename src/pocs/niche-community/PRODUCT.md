# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The run was unattended (no question tool, no user to answer), so every fact below is inferred from the legacy POC in `pocs/10-niche-community/` (README, index.html, app.js) and from the platform brief. Inferences are marked **(assumption)**. Nothing here is a confirmed customer, testimonial, usage number, or commercial result.

## Platform

web

## Users

- **The operator** — one person (often a founder themselves) who runs a paid community for early-stage Korean founders: opens channels, pins notices, hosts meetups, watches paid conversion and retention. In the legacy POC this was "김관리", auto-logged-in as admin.
- **Members** — early-stage founders, makers and the people around them (developers, marketers, designers, angel investors) who read and write practical posts, ask each other for help, and meet in person. Free members read the open channels; premium members pay monthly for the closed channels and member-only meetups. **(assumption: members read mostly on a phone between meetings, the operator works at a laptop.)**

## Product Purpose

스타트업 빌더스 is a paid niche community for Korean early-stage founders, run by a single operator. Members share real operating experience (fundraising, product, marketing, hiring) in a channel feed, earn badges from activity, and gather at meetups; the operator turns the community into recurring revenue with a free/premium membership and runs it from an admin dashboard. Success for the operator is steady premium conversion and retention; success for a member is getting a useful answer or connection from peers who are one step ahead.

## Positioning

A small, closed room of founders, not a mass forum: the free tier lets anyone see the open floors, while the rooms where numbers, investor contacts and mentoring happen are behind the premium membership. The operator runs everything (channels, meetups, pricing, dashboard) alone, in one tool.

## Operating Context

- Legacy channels: 자유게시판, 창업 이야기, 기술 토론, 마케팅 전략 (open); 투자/펀딩, 멘토링 (premium only).
- Legacy flows: write post (channel, title, body), like, comment, share link, channel filter, latest/popular sort, profile with badges and nickname change, pricing page with upgrade/downgrade confirmation, admin dashboard (members, DAU/MAU, posts, monthly revenue, daily activity, premium ratio, recent activity), full data reset.
- Meetups (모임) with RSVP were not in the legacy POC; they are added because in-person meetups are how founder communities in Korea actually retain members **(assumption)**.
- Demo mode: there is no login. The visitor switches explicitly between the operator and a sample member to see both sides; this switch must always be visible and honest.

## Capabilities and Constraints

- Feed with posts (create, edit, delete), comments, likes, channel filter, search, latest/popular sort, pinned notices, premium-only posts gated by membership.
- Channels CRUD for the operator; premium-only channels.
- Member profiles with badges computed from activity by pure rules (legacy badge set: 관리자, 프리미엄, 파운더, 작가, 인기인, 첫 발자국, 소통왕).
- Membership tiers free/premium; every upgrade and downgrade is recorded, and each premium charge is a payment row.
- Free members may publish up to 3 posts per day (legacy pricing rule); premium is unlimited.
- Admin dashboard computed from rows: members, active members, MRR, retention, activity, recent activity.
- Data is per visitor workspace (tenant) in Postgres; demo data can be restored with "데모 데이터 초기화".
- No real payment processing: upgrades are simulated and must say so.

## Brand Commitments

- Community name from the legacy POC: **스타트업 빌더스** ("창업가를 위한 프리미엄 커뮤니티"). The platform label "커뮤니티허브" is retired as the product name **(assumption)**.
- Premium price from the legacy POC: **월 9,900원**. It is the POC's own pricing, not a market claim.
- Korean copy throughout, plain and peer-to-peer (members call each other "님").

## Evidence on Hand

- Legacy POC source only. No real members, posts, revenue, testimonials, logos or press exist.
- All demo members, posts, meetups and payments are sample data and must be labelled as such wherever a visitor could mistake them for real.
- The legacy dashboard's hard-coded figures (1,247 members, ₩1,980만 monthly revenue, growth percentages) are fabrications and must not be reused; every figure is computed from rows.

## Product Principles

1. The paid wall is legible: anyone can see what exists behind it and exactly what unlocks it.
2. Everything the operator sees is computed from real rows, never a pasted number.
3. Peers first: the feed privileges practical, specific experience over announcements.
4. One operator, zero busywork: every admin task is one screen, one action, with confirmation only where it destroys data.

## Accessibility & Inclusion

- WCAG 2.1 AA contrast and full keyboard operation (no product-specific requirement confirmed; platform default).
- Works from 360px phones to wide desktops; `prefers-reduced-motion` respected.
