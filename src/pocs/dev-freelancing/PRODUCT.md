# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview (unattended rebuild, 2026-09-24). Every fact below is
> inferred from the legacy POC in `pocs/09-dev-freelancing/` (README, `index.html`, `app.js`) and from the
> rebuild brief. Items marked (assumption) were not confirmed by the owner. No customer, testimonial,
> usage number or live price may be presented as fact; demo rows stay labelled as sample.

## Platform

web

## Users

- **Primary: a Korean solo web/app developer doing 외주 (contract) work** — one person who is at once the
  engineer, the salesperson and the bookkeeper. They take inquiries from referrals and freelance
  marketplaces (assumption: 크몽·위시켓·지인 소개), quote in 견적서, build, deliver, and chase payment.
  They use DevFlow at their desk between coding sessions, next to the editor and terminal they work in
  all day (assumption), and occasionally on a phone to check a deposit or log hours.
- **Secondary: a prospective client** who opens the developer's public portfolio and price list before
  asking for a quote.

## Product Purpose

DevFlow is the business side of freelancing in one place: portfolio, clients, projects, estimates,
invoices, hours and revenue. It exists because the legacy workflow is spreadsheets, a notes app and a
bank app that never agree. Success: the developer can answer "what am I owed, by whom, since when, and
what does this job really pay per hour" without opening another tool.

## Positioning

One chain from inquiry to deposit: an estimate's line items (feature × hours × rate) become the
project's milestones, the timer's hours are measured against those estimates, and the invoice is
issued with the Korean freelancer's real tax choice — 3.3% 원천징수 (사업소득) or 10% 부가세 (세금계산서) —
so the net amount that lands in the account is known before the work starts.

## Operating Context

- Pipeline: 문의 → 진행 중 → 검수 중 → 완료 (legacy kanban columns); milestones inside a project.
- Documents: 견적서 (작성 중 → 발송됨 → 수락됨) converts to an 인보이스; invoice statuses
  발행 → 입금대기 → 입금완료. Korean documents carry 발행일, 유효기간 (legacy: 30일), 공급가액/세액/합계.
- Tax: individual freelancers without a business registration are paid net of 3.3% withholding
  (3% 소득세 + 0.3% 지방소득세); registered 일반과세자 add 10% VAT on the supply amount. (Domain fact.)
- Time: hours logged per project per day; a running timer the developer starts and stops while coding.
- Service catalogue: 웹사이트 / 앱 / 노코드·로코드, three tiers each (legacy demo copy).
- Clients have a grade (신규 / 일반 / VIP), contact info, notes and a history of projects and documents.

## Capabilities and Constraints

- Module of a single Next.js 16 app; data in Postgres schema `dev_freelancing`, scoped per visitor
  workspace (anonymous cookie tenant). Demo data seeds per workspace and can be reset.
- No accounts, no real sending of documents, no bank or 홈택스 integration: "발송" and "입금 확인" are
  status changes the developer records. (Constraint of the POC.)
- Money is integer won. Dates render in Asia/Seoul.
- Legacy features to keep: dashboard (revenue by month, monthly goal, recent projects), portfolio
  (title, description, stack, URL, duration), kanban with move/delete, estimates with line items and
  10% VAT preview/print, CRM with grade and notes, time log with per-project revenue, public price list.
- Undecided (assumption): the developer's real name, business registration number and prices. The
  legacy "사업자등록번호: 123-45-67890" is a placeholder and must stay visibly sample.

## Brand Commitments

- Name: DevFlow. Korean UI copy throughout.
- No binding visual commitments were given; the legacy indigo SaaS look is evidence, not authority.

## Evidence on Hand

- Demo clients, projects, estimates, time entries and service plans in `pocs/09-dev-freelancing/app.js`
  are synthetic. There are no real clients, testimonials, reviews, case studies or usage numbers.
- Service plan prices (e.g. 베이직 웹사이트 1,500,000원~) are the POC's illustrative price ideas, not a
  published rate card; show them as the sample developer's list, not as market fact.

## Product Principles

1. Money truth first: what is owed, what is net after tax, and what arrived outrank every vanity stat.
2. One chain, no re-typing: an estimate flows into a project, milestones, hours and an invoice.
3. Built for someone who lives in developer tools: keyboard-first, dense, exact numbers, no fluff.
4. Documents a Korean client accepts: 견적서 and 인보이스 read like the forms they already sign.
5. Honest demo: sample data and sample prices are labelled as such.

## Accessibility & Inclusion

- WCAG AA contrast; status never by colour alone (text label always present).
- Every board action (kanban move, timer start/stop) works from the keyboard. (assumption: standard AA)
- Respects `prefers-reduced-motion`.
