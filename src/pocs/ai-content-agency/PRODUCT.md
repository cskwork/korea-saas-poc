# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. The run was unattended (no question tool or decision
> page could be answered), so every fact below is inferred from the legacy POC
> (`pocs/01-ai-content-agency/`: README, index.html, app.js) and the rebuild brief. Items marked
> **[assumption]** are inferences to confirm with the owner; nothing here is a customer claim.

## Platform

web

## Users

- **The agency operator** (primary, daily): a one- or two-person content agency that sells writing to
  small Korean businesses. At a desk during working hours, they take requests, generate first drafts
  with AI, edit and proofread them, and deliver on a promised date. Their job is to keep every order
  moving from 접수 to 납품완료 without missing a due date. **[assumption: the operator is the
  logged-in workspace; clients are records, not accounts]**
- **The SMB client** (secondary, occasional): an owner of a café, online shop, clinic, academy or
  small manufacturer with no marketing staff. They fill in a request (what, for whom, which keywords,
  by when), then receive finished copy they can paste into a Naver blog, a SmartStore detail page or
  an ad console. Often on a phone. **[assumption]**

## Product Purpose

글품 turns a short request into publish-ready Korean marketing copy: AI writes the first draft in
seconds, a human editor checks and edits it, and the agency delivers it on the due date. Three
content kinds are in scope: 블로그 포스트, 상품 설명, 광고 카피. Success for the operator is on-time
delivery with little rewriting; success for the client is copy they can publish without touching.

## Positioning

AI speed with a human sign-off. The draft is never the deliverable: every piece passes an editor's
검수 before 납품, and the version history shows what the editor changed. Length is measured the way
Korean writing work is measured, in characters (자, 공백 포함/제외) and 200자 원고지 매수.
**[assumption: the owner positions on "AI draft + human review", which the legacy copy implies
with "AI가 초안을 쓰고 에이전시가 편집·납품"]**

## Operating Context

- Channels the copy lands in: Naver blog posts, SmartStore / 쇼핑몰 상세페이지, 카카오·인스타그램
  and 네이버·구글 검색 광고 문구, 배너 문구.
- Pipeline statuses, in order: 접수 → 작성중 → 검수 → 납품완료. Each order has a due date (마감일).
- Requests carry: client (상호), industry (업종), content kind, topic, tone, length, keywords, notes.
- Monthly plans cap the number of orders: 스타터 월 10건, 프로 월 30건, 엔터프라이즈 무제한 (from the
  legacy pricing section).
- Portfolio is organised by industry (IT/테크, 헬스케어, 뷰티, 가전, F&B, 제조, 펫, 교육 in the legacy data).

## Capabilities and Constraints

- AI generation goes through the platform helper (`@/core/ai`); with no API key, over quota, or on
  failure, a deterministic Korean template writes the draft. The UI must say which one produced it.
- Drafts keep every version (AI generation, regeneration, manual edit) and can be restored.
- Plan selection is recorded per workspace; prices come from the legacy POC: 스타터 29만원/월,
  프로 79만원/월, 엔터프라이즈 맞춤 견적. No payment is processed. **[assumption: 스타터 excludes
  광고 카피, as the legacy table marks it ✕]**
- Workspaces are anonymous demo tenants; all seeded orders, clients and portfolio entries are sample
  data and must be labelled as such.

## Brand Commitments

- Korean-first copy, polite 해요체 in UI, 합니다체 is acceptable in delivered drafts.
- Name: 글품 (chosen for this rebuild; the legacy name was "AI 콘텐츠 대행"). **[assumption]**

## Evidence on Hand

- No real customers, testimonials, case results, usage numbers or satisfaction rates exist. The
  legacy counters (1,200+ 고객사, 35,000+ 콘텐츠, 98% 만족도, 24시간 납품) and portfolio outcomes
  (전환율 42% 향상 등) were placeholders and must not be shown as facts.
- Legacy portfolio titles and orders may be reused as clearly labelled sample data.

## Product Principles

1. The draft is a starting point; the editor's sign-off is the product.
2. Dates are promises: due dates and lateness are always visible, never buried.
3. Measure writing the way Korean writing work is sold: characters and 원고지 매수.
4. Say where words came from: Claude, template, or a person's edit.
5. Nothing fake presented as real: sample data is labelled, claims are not invented.

## Accessibility & Inclusion

- WCAG 2.2 AA contrast; full keyboard operation of the pipeline (no drag-only moves).
- Works one-handed on a 360–390px phone for the client request and delivery views.
