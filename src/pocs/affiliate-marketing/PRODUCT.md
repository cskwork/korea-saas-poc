# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The run was unattended (no question tool, no reachable user), so every fact below is inferred from the legacy proof of concept in `pocs/05-affiliate-marketing/` (README, `index.html` copy, `app.js` behaviour) and from the rebuild brief for the `affiliate-marketing` module. Inferences are marked **(assumption)**. Nothing here is a customer, usage figure, testimonial or price; demo data shipped with the module is sample data and is labelled as such in the UI.

## Platform

web

## Users

- **Primary:** Korean solo affiliate marketers — bloggers (네이버 블로그, 티스토리), Instagram/Threads/X posters and small YouTube reviewers — who earn commission through 쿠팡 파트너스, 네이버 애드포스트, 텐핑 and similar programs. Often a side job run in the evening after work, checked on a phone during the day **(assumption, from the README's "제로 자본" framing and the category)**.
- **Job:** register an affiliate link once, drop its short link into posts, see which link and which channel actually produced clicks and orders, and know what the month has earned so far; then write the next post (review, comparison, ranking, SNS caption) without leaving the workspace.

## Product Purpose

링크잇 is a single workspace for the affiliate side hustle: links, tracking, commission maths and commerce copy in one place instead of four program dashboards and a notes app. Success is a marketer who can answer "which post made money this week, and what should I write next?" in under a minute.

## Positioning

The short link is the product's own: every `/go/<code>` redirect records the click (time, referrer, channel) before forwarding, so the numbers are measured by 링크잇 rather than copied from each program's dashboard. Conversions are entered by the marketer from the program's settlement report and commission is computed from the link's own rate, so revenue per link, per program and per channel comes from rows the marketer owns.

## Operating Context

- Programs named in the legacy POC: 쿠팡 파트너스 (percentage commission, monthly settlement), 네이버 애드포스트 (CPC ad revenue on 네이버 블로그), 텐핑 (CPS/CPA campaigns, SNS sharing). Program terms shown in the comparison table are reference notes carried over from the POC; they change and must be labelled as "check the program's current terms" **(assumption: figures not verified against current program policies)**.
- Channels the marketer posts to: 네이버 블로그, 티스토리, 인스타그램, 스레드, X, 유튜브 커뮤니티/설명란, 카카오톡 오픈채팅.
- Korean advertising disclosure practice (공정거래위원회 추천·보증 심사지침) expects a clear 대가성 문구 such as "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다." Generated content always carries a disclosure line.
- Money is Korean won, integers; dates are Asia/Seoul.

## Capabilities and Constraints

- Affiliate links: CRUD with program, product, category, destination URL (http/https only), commission rate and status (활성 / 일시중지 / 만료); globally unique short code.
- Tracked redirect `/affiliate-marketing/go/<code>`: records a click row and 302-redirects; works for any visitor, not only the owner.
- Conversions: manual entry (order amount, date, optional note); commission computed from the link's rate.
- Analytics computed from rows: clicks, conversions, CVR, revenue over time, by link, by program, by channel, by hour.
- Content templates (비교 리뷰 / 추천 리스트 / 상세 리뷰) and SNS post variants (인스타그램 / 블로그 / X / 스레드), generated through Claude when a key is configured and by a deterministic Korean template otherwise, saved to a library. The UI says which produced the result.
- Monthly revenue goal: the POC hard-coded ₩20,000,000; the rebuild lets the marketer set it **(assumption)**.
- Tenancy: each anonymous visitor gets their own workspace; the demo data is sample data and can be reset.
- Not in scope: real program API integration (쿠팡/네이버 settlement import), payouts, multi-user teams.

## Brand Commitments

- Product name **링크잇**. Korean copy throughout, 해요체, practical and plain.
- No other visual commitments survive from the POC: its teal/indigo SaaS dashboard look and emoji icons are discarded.

## Evidence on Hand

- Legacy POC (`pocs/05-affiliate-marketing/`): feature list, program notes, 15 sample products.
- No real customers, testimonials, revenue figures, screenshots of real accounts or program partnerships exist. None may be invented; sample data stays labelled "샘플".

## Product Principles

1. **Measured, not claimed.** Every number on screen is computed from rows the workspace owns; nothing is a constant.
2. **Link first.** The short link is the unit of work: everything (clicks, orders, content) hangs off one link.
3. **Disclose by default.** Every generated post includes the 대가성 disclosure; the marketer can edit but never has to remember it.
4. **Evening-sized tasks.** Register a link, log an order, draft a post: each finishes in one short form.
5. **Honest AI.** Generated copy says whether Claude or the template wrote it, and works without a key.

## Accessibility & Inclusion

- WCAG 2.2 AA contrast, full keyboard operation, visible focus, `prefers-reduced-motion` respected **(assumption: no product-specific requirement recorded; platform default)**.
- Must work one-handed on a 360–390px phone for checking numbers and copying links.
