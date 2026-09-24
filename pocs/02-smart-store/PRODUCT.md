# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The owner approved the revamp "as recommended"
> (2026-09-24), so every fact below is inferred from the existing site, README, and app code.
> Items marked (assumption) were not confirmed by the owner.

## Platform

web

## Users

- **Primary: a one-person Naver Smart Store seller running 위탁판매 (dropshipping).** They source
  products from Korean wholesale platforms (도매매, 도매꾹), list them on their store with a margin,
  and forward each order to the wholesaler for direct delivery. They work alone, usually at a desk
  on a laptop after a day job or between other work, and check new orders on a phone during the
  day (assumption, based on the product's "1인 SaaS" framing and the mobile-responsive README).
- **Secondary: a portfolio visitor** evaluating the POC as one of ten Korean solo-business tools
  in the korea-saas-poc catalogue.

## Product Purpose

One place for the whole 위탁판매 loop: find a product worth selling, write a search-friendly
listing, process orders through to delivery, check that the numbers leave a profit, research Naver
search keywords, and see sales trends. Success is the seller knowing, before listing anything,
what they will actually keep per sale after Naver's category fee and shipping.

## Positioning

A seller's desk built around Naver Smart Store's own economics: category-specific Naver fees
(3.5% to 7.0%) are applied everywhere a margin appears, and the sourcing, listing, and order steps
are connected so a product found in 소싱 can be listed in one click and appears in test orders.

## Operating Context

- The loop: 소싱 (browse wholesale catalogue, filter by supplier, category, minimum margin) →
  AI 등록 (generate an SEO title, description, keywords, hashtags; save the listing) → 주문 관리
  (신규주문 → 처리중 → 배송중 → 배송완료, or 취소) → 수익 계산 → 키워드 → 매출 분석.
- Terminology the seller uses: 매입가 (wholesale cost), 판매가 (retail price), 네이버 수수료,
  마진율, 순수익, 도매처, 송장번호, 발주.

## Capabilities and Constraints

- Static POC: plain HTML/CSS/JS, no build step, deployed as static files. All state lives in the
  browser's localStorage (key `smartseller_state`); nothing is sent to a server.
- Product catalogue, keyword volumes, sales analytics, and "AI" copy are mock data generated in
  the browser. No real Naver, 도매매, or 도매꾹 API and no real AI model is connected.
- Naver category fee table used by the app: 전자기기 3.5%, 뷰티 4.0%, 기타 5.0%, 패션 5.5%,
  생활/주방 6.0%, 식품 7.0%.
- The Next.js platform in the same repository plans to rebuild this module at `/smart-store`;
  until then this static demo is the live product.

## Brand Commitments

- Product name: 스마트셀러. Korean copy throughout.
- Not affiliated with NAVER; the app may reference Naver Smart Store as the sales channel but must
  not imitate NAVER's logo or brand identity (assumption: prudent default for a third-party tool).

## Evidence on Hand

- Demo catalogue of 18 wholesale products, 7 keyword datasets, mock customer names and regions,
  all in `app.js`. All numbers are synthetic and must stay labeled as demo data.
- No testimonials, customers, revenue figures, or pricing exist. Do not invent them.

## Product Principles

1. The seller's real take-home number (after Naver fee and shipping) is the headline, not revenue.
2. Every step hands off to the next: a sourced product flows into a listing, a listing into orders.
3. Demo data is honest about being demo data.
4. Fast to operate on a phone for order checks; comfortable on a laptop for sourcing and listing.

## Accessibility & Inclusion

- Korean-language UI; body text at least 16px on mobile inputs to avoid iOS zoom (assumption).
- Status must not be conveyed by colour alone (order states, competition levels, margin grades).
