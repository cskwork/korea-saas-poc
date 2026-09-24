# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. Inferred from the legacy POC
> (`pocs/02-smart-store/`: README, index.html copy, app.js data and logic) and the
> platform brief for the single-app rebuild. Items marked **(assumption)** are
> inferences nobody confirmed; everything else is stated by the legacy material.

## Platform

web

## Users

Solo operators running a Naver SmartStore (네이버 스마트스토어) on consignment/dropshipping
(위탁판매): they hold no inventory, pick goods from Korean wholesale platforms (도매매, 도매꾹),
list them on SmartStore with a markup, and forward each order to the wholesaler, who ships
directly to the buyer.

**(assumption)** They are side-hustlers or one-person shops who work in short sessions on
a laptop at a desk (evenings, lunch breaks) and check orders on a phone during the day.
Their daily job is a loop: find a product worth selling, list it fast with a search-friendly
title, confirm new orders with the wholesaler (발주), enter tracking, and watch whether the
margin actually survives Naver's fees.

## Product Purpose

스마트셀러 puts the whole consignment loop on one console: sourcing → listing → orders →
margin → keywords → sales analytics. It exists because a consignment seller's profit lives
in thin, easily-miscounted margins (wholesale cost, Naver category fee 3.5–7.0%, shipping),
and because listing volume depends on writing Naver-SEO titles quickly.

Success: a seller can tell at a glance which wholesale item is worth listing, list it in
one action with a usable SEO title and description, move every order through
신규주문 → 발주확인 → 배송중 → 배송완료 without missing one, and trust the margin numbers.

## Positioning

The margin is computed the way the seller is actually paid: the Naver category fee table
(전자기기 3.5%, 뷰티 4.0%, 기타 5.0%, 패션의류/잡화 5.5%, 생활/주방 6.0%, 식품 7.0%) is applied
to every sourcing candidate, listing, order and calculation, so "profit" everywhere in the
tool means the same thing. Listing copy is written for Naver Shopping search (title
prefixes/suffixes such as 무료배송·당일출고, keyword and hashtag sets), not generic ad copy.

## Operating Context

- Wholesale platforms: 도매매, 도매꾹 (supplier of each catalogue item).
- Naver SmartStore order lifecycle vocabulary: 신규주문, 발주확인 (legacy POC said 처리중),
  배송중 (tracking number issued), 배송완료, 취소.
- Categories used by the legacy tool: 패션, 뷰티, 생활/주방, 전자기기, 식품 (+ 기타 for fees).
- Naver search keyword metrics: monthly search volume, competition (낮음/중간/높음),
  trend (상승/유지/하락/계절성).
- Amounts are Korean won, integers; dates in Asia/Seoul.
- **(assumption)** No live integration with Naver Commerce API or wholesaler APIs exists;
  catalogue, keyword metrics and demo orders are sample data.

## Capabilities and Constraints

- Sourcing catalogue with supplier / category / minimum-margin filters and a detail view.
- One-click AI listing: SEO title, description, keywords, hashtags (Claude when configured,
  deterministic Korean template otherwise, labelled honestly).
- Listed-product management: price edits, pause/resume (판매중/판매중지), delete.
- Orders: status workflow, cancel, test-order creation, tracking numbers.
- Margin calculator with the fee table and saved calculation history.
- Keyword research over seeded keyword data, saved keywords.
- Sales analytics computed from orders: revenue/order trend, category share, top sellers, KPIs.
- Multi-tenant: each visitor gets an isolated demo workspace; "데모 데이터 초기화" restores it.
- Undecided: real marketplace/API integration, authentication, billing.

## Brand Commitments

- Product name: 스마트셀러. Korean-first copy.
- **(assumption)** The legacy green (#03C75A) was a Naver-lookalike, not an owned asset. The
  product must not impersonate Naver's brand; Naver/도매매/도매꾹 are named only as the
  platforms the seller works with.

## Evidence on Hand

- No real customers, testimonials, revenue figures, prices of the service, or usage numbers
  exist. Nothing of that kind may be stated as fact.
- All catalogue items, orders, customers, keyword volumes and sales figures are sample data
  and must be labelled as such wherever a visitor could mistake them for real.
- The fee table above is the legacy POC's table; **(assumption)** it approximates Naver's
  real fees and should be presented as the tool's table, not as an official rate card.

## Product Principles

1. Margin is the truth: every price shown sits next to what the seller actually keeps.
2. One loop, no dead ends: every item can move to the next step (source → list → sell) in place.
3. Nothing slips: new orders and unconfirmed 발주 are the loudest things on screen.
4. Honest automation: say when copy came from Claude and when from the template.
5. Sample data is labelled, never passed off as real performance.

## Accessibility & Inclusion

**(assumption)** WCAG 2.2 AA as the working standard: keyboard-operable workflows, visible
focus, readable Korean at small sizes (Pretendard), numbers in tabular figures,
reduced-motion respected.
