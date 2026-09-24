# Product

<!-- impeccable:product-schema 1 -->

> Written 2026-09-25 during an unattended redesign. No one was available to interview, so every fact
> below is inferred from the existing site, its README, and its demo data. Items marked
> **(inferred)** are assumptions; items marked **(open)** are undecided and must not be invented.

## Platform

web

## Users

- **Primary (inferred):** owners and one-person marketing staff at Korean small and medium businesses
  (쇼핑몰, 뷰티, F&B, 교육, 제조 등) who need a steady stream of blog posts, product descriptions and ad
  copy but have no writer or agency budget. They visit from a laptop at work or a phone between tasks.
- **Secondary (inferred):** portfolio reviewers looking at this POC as a demonstration of the service
  idea.

## Product Purpose

An AI-assisted content agency ("AI 콘텐츠 대행"): the customer orders a piece of content (블로그 포스트,
상품 설명, 광고 카피), AI drafts it, and the agency delivers it on a monthly plan. The site explains the
offer, lets a visitor try a draft generator on their own topic, shows sample work, lists plans, and
shows a demo order dashboard. Success for the page: a visitor tries the generator and understands what
they would receive each month.

## Positioning

Three content types that Korean SMB marketing actually runs on (네이버 블로그 style posts, 상세페이지 style
product copy, Kakao/Instagram and Naver/Google search ad copy), delivered as an agency order with a
tracked status instead of a blank AI chat box. **(inferred)**

## Operating Context

- Order flow shown by the demo dashboard: 대기중 → 진행중 → 완료, with order number, content type,
  topic, order date and completion date.
- Generator: pick a content type, type a topic (max 200 characters), receive a templated draft, copy it.
- The POC is fully client-side. There is no real AI call, account, payment, or order backend.

## Capabilities and Constraints

- Static HTML/CSS/vanilla JS, no build step. Deployed as its own Vercel project
  (`01-ai-content-agency`) from `pocs/01-ai-content-agency`; a copy is served by the monorepo hub under
  `public/pocs/01-ai-content-agency`.
- Generated text is template-based demo content and must be labeled as such.
- Plans: 스타터 29만원/월 (월 10건), 프로 79만원/월 (월 30건, 추천), 엔터프라이즈 맞춤 견적. Keep these facts.
- **(open)** Real customer names, testimonials, logos: none exist. Do not fabricate them.

## Evidence on Hand

- Stats on the current page (누적 고객사 1,200+, 생성된 콘텐츠 35,000+, 고객 만족도 98%, 평균 납품 24시간)
  are demo figures from the POC, not verified business data. Present them as demo figures.
- Portfolio: nine sample cases with industry and outcome lines (e.g. 구매 전환율 42% 향상). These are
  sample cases authored for the POC.
- Demo orders ORD-2026-001 to ORD-2026-007 in `app.js`.
- No photography, logos, or brand assets beyond the name.

## Product Principles

1. Show the draft, not the promise: the generator is the proof.
2. Speak the SMB owner's language: 블로그, 상세페이지, 검색광고, not AI jargon.
3. Be honest about the demo: synthetic numbers and templated text are labeled.
4. An order is a tracked piece of work with a status and a date.

## Accessibility & Inclusion

Korean-language UI. WCAG 2.1 AA contrast and full keyboard operation of the generator, filters and
navigation. **(inferred)**
