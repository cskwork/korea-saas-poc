# Product

<!-- impeccable:product-schema 1 -->

> Source note: written without a live interview. This run was unattended (no question tool, no decision page answer), so every fact below is inferred from the legacy POC (`pocs/07-newsletter-community/`: README, index.html, app.js), the platform brief, and the repository conventions. Inferred facts are marked **(assumption)**. Nothing here is a customer, testimonial, usage number or price stated as real-world fact.

## Platform

web

## Users

- **Primary: the solo Korean editor (1인 에디터)** who writes and sells a weekly newsletter on their own — the Korean counterpart of a Substack writer, working in the space 스티비, 메일리 and 네이버 프리미엄 콘텐츠 occupy. They draft issues, decide who receives them (everyone or paying readers), keep the reader list clean, run a small members' board, and check whether the publication pays the rent. They are the only operator; there is no team. **(assumption: evening/early-morning writing sessions before a morning send, laptop at a desk.)**
- **Secondary: readers.** Free subscribers who read the public archive and paid members (베이직·프로) who unlock paid issues and join the members' board. They mostly read on phones. **(assumption)**

## Product Purpose

One place for a one-person publication: write an issue, send it to the tier it is meant for, gate paid issues behind a paywall, grow and clean the reader list, host member conversation, and see revenue (paid subscriptions, sponsorships, community memberships) computed from the actual rows. Success: the editor can go from draft to sent issue, from visitor to subscriber, and from subscriber count to monthly revenue without leaving the product or keeping a spreadsheet on the side.

## Positioning

Most tools split the job: an email sender, a payments page, a separate community (카카오 오픈채팅, 네이버 카페) and a spreadsheet for money. This product keeps the issue, its recipients, the members who talk about it and the won it earns in one ledger, so an issue's send list, a member's tier and the month's revenue are the same data seen from different sides.

## Operating Context

- Weekly (or more frequent) issue rhythm: draft → scheduled → published. Scheduled issues are published when their time arrives. **(assumption: typical Korean morning send, e.g. 07:00 KST.)**
- Tiers from the legacy POC: 무료, 베이직, 프로. Issue audiences: everyone (free), paid members (베이직+프로), 프로 only.
- No real email is sent in this product demo: publishing records one send row per matching active subscriber; opens and clicks are simulated sample figures and must always be labelled as such.
- No real payment: choosing a paid plan on the public page creates a paid subscriber row in the demo and is labelled as a demo.
- Reader list maintenance by hand and in bulk (CSV import/export) is part of the job.
- Everything is per workspace (anonymous visitor tenant); every visitor gets their own sample publication.

## Capabilities and Constraints

- Issue editor with simple formatting, category, audience, preview, schedule, publish, send report.
- Subscribers: CRUD, tier and status, search/filter, CSV import/export.
- Public archive and reading page with a paywall and a working subscribe form.
- Members' board: categories (공지, 토론, 질문), posts, comments, likes.
- Revenue: MRR from active paid subscribers × plan price, sponsorship deals, membership sales, monthly trend and goals, all computed from rows.
- Plans page generated from the publication's own plan rows.
- Constraints: Next.js 16 module inside a shared app; CSS Modules only; Korean copy; formatting in Asia/Seoul; no chart libraries.
- Name: **펴냄** (from 펴내다, "to publish"; the word Korean colophons use for the publisher). Chosen in this run to replace the integrator's placeholder "레터하우스" **(assumption: not confirmed by a person)**. The sample publication inside the demo is "작은 회사 통신" by the fictional editor 윤서하.

## Brand Commitments

None confirmed. The legacy POC's violet-on-dark look, Vollkorn serif and emoji icons are evidence of the subject, not commitments.

## Evidence on Hand

- Legacy demo content: sample issues on AI, startups, SEO, SaaS, design; 15 sample subscribers; 4 board posts; 6 months of revenue; plan prices 베이직 ₩9,900 / 프로 ₩29,900 and a FAQ. These are demo values of a sample publication, not market facts.
- Legacy README revenue targets (월 500만원 → 1,000만원 → 2,000만원) are the POC author's goals, usable only as editable default goals in the demo.
- No real customers, testimonials, open-rate benchmarks, press or logos exist. Do not fabricate them. Sponsor names in demo data must be fictional (the legacy used real Korean companies; that is not carried over).

## Product Principles

1. **One ledger, many views.** An issue's recipients, a reader's tier and the month's revenue come from the same rows; nothing on screen is a constant.
2. **Honest numbers.** Simulated stats and demo payments are always labelled; real counts are never padded.
3. **Writing first.** The editor's page is where the most time is spent; it should feel like writing, not form-filling.
4. **Readers are people, not rows.** Names, tiers and conversations stay visible; bulk tools never hide who is affected by a destructive action.

## Accessibility & Inclusion

Korean-first copy with `word-break: keep-all`. WCAG 2.2 AA contrast, keyboard access to every action, visible focus, reduced-motion respected. Reading pages must be comfortable on a 360px phone.
