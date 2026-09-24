# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. Every fact below is inferred from the legacy POC
> (`pocs/06-automation-agency/`: README, index.html, app.js copy and data) and from the platform brief
> for this rebuild. Lines marked **(assumption)** are inferences nobody has confirmed yet. All names,
> companies, amounts and dates in the app are sample data and must stay labelled as such.

## Platform

web

## Users

- **Primary: the operator of a one-person business-automation agency** in Korea (assumption: a solo
  consultant or a two-person team — the legacy data names two assignees, 김자동 and 박자동). They sell
  automation packages built on no-code tools to small and mid-sized companies, deliver the build, then
  keep the automations running for a monthly maintenance fee. Their job in this product: find the
  repetitive work, prove what automating it saves, design the workflow, quote it, deliver it, and keep
  the maintenance subscriptions (the agency's recurring revenue) healthy.
- **Secondary: the client's decision-maker** (사장님, 팀장님 at a 제조/유통/서비스/IT company) who sees
  the ROI result and the printed quote across the table. They do not log in (assumption); they read what
  the operator shows or hands them.

## Product Purpose

AutoMate Pro is the agency's operating system: a catalogue of productised automation packages, an ROI
calculator that turns "hours of repetitive work" into won saved and a payback period, a workflow
builder to sketch the automation with the client, client projects tracked through delivery stages into
maintenance, and a quote generator that produces a VAT-inclusive Korean quote. Success means the
operator can go from a first diagnosis to a signed quote and a running maintenance subscription in one
place, and can see at a glance the monthly recurring revenue and the pipeline.

The legacy README states a revenue goal of up to ₩15,000,000 per month from maintenance subscriptions;
that is the business model's target, not an achieved number.

## Positioning

The claim is measured savings, not "AI magic": every package carries a setup fee, a monthly fee and the
monthly hours it saves, so the ROI (hours saved × hourly labour cost versus fees) is arithmetic the
client can check. The business model is build-once, maintain-monthly: revenue that recurs because the
automations keep running.

## Operating Context

- Tools the agency builds with (real product names used in copy and workflow nodes): Make, Zapier, n8n,
  Google Apps Script, Google Sheets, Gmail, Slack, Notion, 카카오 알림톡, 네이버 스마트스토어, 쿠팡,
  택배사 배송조회 API, 홈택스 전자세금계산서.
- Client industries from the legacy data: 제조, 유통, 서비스, IT, 기타. Automation types: 데이터처리,
  커뮤니케이션, 리포팅, 결제정산.
- Delivery stages (legacy vocabulary, kept): 대기 → 분석 → 개발 → 테스트 → 배포 → 유지보수.
- Korean business paperwork is part of the job: the quote (견적서) states supply amount, VAT 10%
  (부가세) and total, a validity period, and is printed or sent as PDF.
- Scene (assumption): the operator works on a laptop, at a desk or on site in a client's office, and
  turns the screen toward the client for the ROI and quote.

## Capabilities and Constraints

- Solution catalogue with industry/type filters and package detail (tools, build hours, monthly hours
  saved, setup fee, monthly fee); packages can be added to a quote.
- ROI calculator: weekly repetitive hours, hourly labour cost, automatable share, one-off investment and
  monthly fee → monthly/yearly hours and won saved, ROI %, payback months, cumulative savings chart. A
  result can be saved as a diagnosis (lead) for a named client.
- Workflow builder: trigger / action / condition nodes naming real tools; add, remove, connect, reorder;
  saved per workflow; three starter templates from the legacy POC (이메일 자동응답, 주문→배송,
  엑셀→보고서).
- Projects: client, packages, stage, progress, assignee, dates, notes, maintenance status and fee.
- Quotes: package line items with complexity multiplier (단순 0.7×, 보통 1.0×, 복잡 1.5×), VAT 10%,
  totals, validity, printable view, saved to the database.
- Pricing plans from the legacy POC: 기본 ₩490,000, 프로 ₩990,000, 엔터프라이즈 ₩1,990,000 per month,
  20% off when billed yearly. These are the POC's proposed plans, not market-validated prices.
- Money is integer won; dates render in Asia/Seoul. Copy is Korean.
- Not in scope (legacy "future" list): real Make/n8n API execution, payments (토스페이먼츠), client portal,
  live monitoring of running automations.

## Brand Commitments

- Product name: **AutoMate Pro**. No logo or brand assets exist beyond the name; the legacy blue/violet
  gradient look is explicitly discarded by this rebuild.

## Evidence on Hand

- None. There are no real customers, testimonials, case studies, usage numbers or benchmarks. All client
  companies (e.g. (주)한국제조, 스마트유통) and all figures in the demo are sample data and must be
  labelled as sample wherever a visitor could mistake them for real. Package hours-saved figures are the
  legacy POC's estimates, not measured results.

## Product Principles

1. **Show the arithmetic.** Every saving, fee and total is traceable to its inputs; no unexplained
   numbers.
2. **Recurring over one-off.** Maintenance subscriptions are the business; the product keeps them
   visible at all times.
3. **Client-facing moments must be presentable.** The ROI result and the quote are shown to a client and
   must read as professional documents.
4. **Real tools, real vocabulary.** Name the actual no-code tools and Korean business terms, never
   generic "App A → App B".

## Accessibility & Inclusion

No product-specific requirement was established (assumption). Default target: WCAG 2.2 AA, full keyboard
operation including the workflow builder, reduced-motion support.
