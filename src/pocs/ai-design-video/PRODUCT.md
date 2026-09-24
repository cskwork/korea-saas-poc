# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The run was unattended (no question tool, no decision page answered), so every fact below is inferred from the legacy POC in `pocs/08-ai-design-video/` (README, index.html, app.js, style.css) and the platform brief. Lines marked **(assumption)** are inferences the owner has not confirmed.

## Platform

web

## Users

- **Primary: the studio operator.** One person (a freelance designer / video editor) who runs "크리에이트잇" as a one-person production studio, doing the work with AI tools (Canva, Midjourney, CapCut, ChatGPT, Leonardo AI…). Their job in this app: take in orders, move each one through drafts and revisions to delivery without blowing the revision allowance or the deadline, prepare the creative brief quickly, and see whether the month is on track against the revenue goal.
- **Secondary: prospective clients** — Korean small-business owners (smart-store sellers, cafés, startups) and creators (YouTubers, reels/shorts makers) who look at the portfolio and price list and place an order. **(assumption)** In this build they reach the order form through the operator's pages; there is no separate client login.

## Product Purpose

A back-office for a one-person AI-assisted design & short-video studio: order intake → 의뢰접수 → 시안작업 → 수정요청 → 납품완료, revision rounds counted against each package's allowance, an AI brief assistant that turns a client's brief into concept directions, copy lines and (for video) a shot list, a portfolio by category, a comparison of the AI tools the studio works with, revenue analytics computed from real orders, and a price sheet whose packages prefill the order form. Success: every open order's next step, deadline and remaining revisions are visible at a glance, and the monthly goal (₩15,000,000 in the legacy README) is tracked from delivered work, not from constants.

## Positioning

The studio sells finished creative assets (thumbnails, banners, detail pages, shorts/reels, logos) produced by one person with AI tools at freelancer prices, as single orders or monthly subscriptions. What a neighbouring product (a generic CRM, a marketplace gig page) cannot copy: the workflow is shaped around the production ritual itself — 시안 (draft proposal) rounds, 수정 N차 with a hard allowance per package, and a brief that is turned into concepts/copy/storyboard before work starts.

## Operating Context

- Work happens at a desk between editing sessions in Canva / CapCut / Premiere-class tools; the operator checks orders, deadlines and briefs in between. **(assumption)**
- Korean production vocabulary is the working language: 의뢰, 시안, 수정 1차·2차, 납품, 원본 파일, 콘티, 레퍼런스, 긴급 작업.
- Money is in KRW; dates in Asia/Seoul.
- Order ids in the legacy POC follow `ORD-YYYYMMDD-NNN`.

## Capabilities and Constraints

- Order types (legacy): SNS 썸네일, 유튜브 영상 편집, 쇼핑몰 상세페이지, 로고 & 브랜딩, 종합 패키지. This build adds 배너 and 숏폼/릴스 as order types because the platform brief names them. **(assumption)**
- Legacy price sheet (the POC's own list, kept as the sample price sheet, not a market claim): 썸네일 ₩50,000/장, 영상 편집 ₩300,000/편, 상세페이지 ₩200,000/페이지, 로고 & 브랜딩 ₩500,000/건, 종합 패키지 ₩800,000/세트; subscriptions 스타터 ₩290,000/월, 프로 ₩590,000/월, 엔터프라이즈 ₩1,200,000/월. Prices for any added type are sample values. **(assumption)**
- Revision allowance per package (legacy: 2–5 rounds); exceeding it costs extra; 24-hour rush adds 50%; subscriptions renew monthly without carry-over; source files on request (legacy 주문 안내사항).
- AI generation runs through the platform's Claude helper with a deterministic Korean template fallback; the app must be fully usable without an API key, and the UI states which source produced a result.
- Multi-tenant: each visitor gets their own workspace of sample data; "데모 데이터 초기화" restores it.

## Brand Commitments

- Name: 크리에이트잇. Voice: plain, friendly-professional Korean from a working creator (해요체), no hype.
- No visual commitments survive from the legacy build; its dark blue/magenta look is treated as evidence, not authority.

## Evidence on Hand

- No real customers, testimonials, portfolio files, usage numbers or reviews exist. All orders, clients and portfolio entries are sample data and must be labelled as such where a visitor could mistake them for real.
- No real portfolio imagery exists; portfolio pieces must be authored illustrative compositions, labelled as samples.
- The AI tools comparison (Canva, Midjourney, CapCut, ChatGPT, Leonardo AI, Runway, Figma, Remove.bg, Suno) reflects the legacy POC's notes; pricing lines on third-party tools are indicative and can go stale.

## Product Principles

1. The order is the unit of work: every screen answers "what is the next step for which order, by when".
2. Revisions are a budget, not a surprise: the allowance and the rounds used are always visible, and going over is an explicit decision.
3. AI drafts, the operator decides: AI output is a starting brief attached to an order, clearly labelled with its source, never auto-sent to a client.
4. Numbers come from rows: every total, chart and goal figure is computed from stored orders.
5. Honest samples: demo content is useful and realistic but never passed off as real clients or results.

## Accessibility & Inclusion

No product-specific requirement was established. Baseline: WCAG 2.2 AA contrast, full keyboard operation, visible focus, reduced-motion support, Korean screen-reader labels.
