# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. This run was unattended (no question tool or decision page reached a person), so every fact below is inferred from the build brief and the legacy POC (`pocs/04-online-education/`: README, copy, code). Inferences that go beyond those sources are marked **(assumption)**.

## Platform

web

## Users

- **Primary: a solo Korean creator-instructor (1인 크리에이터).** A working developer, designer or analyst who teaches on the side: records lessons with a smartphone and CapCut, writes Notion templates and PDF cheat sheets, and wants to sell them from a storefront they own instead of only through 인프런 or 클래스101. Their job in the product: structure a course (sections and lessons), publish it, sell it and the digital products next to it, and see who is learning and what money came in. **(assumption: they work at a desk, usually evenings after a day job, alone.)**
- **Secondary: a prospective student** who lands on one course page, reads what they will learn and the curriculum, checks the price, and enrolls (수강 신청).
- **Tertiary: the creator evaluating 에듀마켓 itself**, reading the plans page (무료 / 베이직 / 프로).

## Product Purpose

에듀마켓 lets one person run an online school end to end: a curriculum builder for courses (sections, lessons of type 영상/텍스트/퀴즈, free-preview lessons, publish/unpublish), a public landing page per course with a working enrollment flow, digital products (노션 템플릿, PDF, 스프레드시트) with their sales, a student roster with progress, and revenue analytics computed from real payments. Success: the creator can go from an empty course to a sellable page and read their monthly revenue without leaving the tool.

## Positioning

A creator-owned school, not a marketplace listing: the course, its landing page, its buyers and its money all live in one place the creator controls, and courses and small digital products are sold side by side and reported together (course vs product revenue split). The legacy README frames the model as "초기 투자 0원, 스마트폰 + 캡컷으로 촬영, 노션 템플릿·PDF로 추가 수익".

## Operating Context

- Korean-language product; money in integer won; dates in Asia/Seoul.
- Course vocabulary: 강의, 섹션, 레슨, 커리큘럼, 무료 공개(미리보기), 게시/비공개(초안), 수강생, 수강 신청, 진도율, 수료.
- Product vocabulary: 디지털 상품, 노션 템플릿, PDF, 스프레드시트, 판매량, 판매 링크.
- Categories from the legacy POC: 프로그래밍, 디자인, 데이터, 마케팅.
- One workspace per visitor today (anonymous demo tenant); real auth and real payment processing are out of scope for this build.

## Capabilities and Constraints

- Payments are recorded, not processed: 수강 신청 creates a student, an enrollment and a payment row; no PG (card/transfer) integration exists. The UI must say so on the public page.
- Plans page prices (무료 ₩0, 베이직 ₩29,000/월, 프로 ₩79,000/월), fee (결제 수수료 3.5%), refund (7일 이내) and annual discount (20%) come from the legacy POC copy; they are the POC's stated plan terms, not verified commercial facts, and plan selection is not billed.
- Discount display: the legacy page showed a fabricated "정가 ×1.5, 33% 할인". This build stores a real list price and sale price per course instead.
- Undecided: certificate issuance (수료증), wishlist/cart, coupons, video hosting. Not built as working features in this scope.

## Brand Commitments

- Product name 에듀마켓. Korean copy throughout. No other binding brand assets exist (the legacy "E" square logo and amber/coral Tailwind palette are evidence, not commitments).

## Evidence on Hand

- None real. All courses, students, products and payments are generated demo data and must be labelled 샘플/데모 wherever a visitor could mistake them for real activity.
- The README's "인프런 김영한 (누적 수십억 매출)" is a third-party anecdote, not this product's evidence; do not present it as a customer or testimonial.
- No testimonials, customer logos, usage numbers or ratings exist. Do not fabricate them.

## Product Principles

1. The curriculum is the product: structure (sections, lesson order, lesson type, preview flag) is edited directly and always reflected on the public page.
2. Every number is computed from rows: revenue, growth, progress and sales come from payments and enrollments, never constants.
3. One person, one screen at a time: frequent tasks (add a lesson, publish, check this month) are one or two actions away.
4. Honest storefront: prices and discounts shown to students are the ones the creator set; demo activity is labelled.

## Accessibility & Inclusion

- WCAG 2.2 AA target **(assumption)**: keyboard access for the curriculum builder (reorder without drag), visible focus, reduced-motion support, form errors tied to fields.
