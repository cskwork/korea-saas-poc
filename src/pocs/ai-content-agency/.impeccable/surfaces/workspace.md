---
version: 1
slug: "workspace"
primary_target: "workspace"
related_targets: ["components"]
---

# Surface: 글품 workspace (all module routes)

Scope: every route under `/ai-content-agency` — 현황 `/`, 의뢰 게시대 `/orders`, 의뢰서 `/orders/new`, 의뢰 상세 `/orders/[id]`, 납품서 `/orders/[id]/delivery` (client-facing), 시안 쓰기 `/write`, 원고함 `/drafts`, 원고 `/drafts/[id]`, 사례 `/portfolio`, 요금제 `/pricing`. Components in `src/pocs/ai-content-agency/components/**`.
Visitor mode: **Operate** (operator console, generator, library). 요금제 is a Persuade sub-view and 사례 an Experience sub-view inside the same world. Build path: code-led (no image generation in this run).

Audience/job: a one- or two-person Korean content agency at a desk in daytime office light, keeping every request moving 접수 → 작성중 → 검수 → 납품완료 before its due date; the SMB client on a phone reading plans, cases and the delivered copy. Proof/content: sample workspace data (labelled 샘플), real AI or template drafts generated in the session. Constraints: Korean copy, Asia/Seoul dates, won integers, WCAG AA, 360px phones, keyboard-operable pipeline.

Run notes (unattended): no question tool or user was reachable, so the interview and decision page were skipped and PRODUCT.md is inferred and labelled. The roll ran degraded (no network to the roll service): no challengers, no quality-bar boards, so no donor raises exist. Grounded list, ordered by resonance: 1 원고지 (200자 manuscript grid; length in 자/매), 2 교정쇄·교정부호 (proof sheet and the editor's red marks), 3 결재판·도장 (approval boxes and seals), 4 택배 운송장·배송조회 (waybill and tracking steps), 5 개조식 공문서 (□ ○ - office-report grammar), 6 거래명세표·먹지 작업지시서 (carbon order slips), 7 현수막·전단지 (street vinyl banners and flyers). Rut kept out: the legacy page (gradient AI hero, counters, icon cards, pricing trio, KPI tiles) and its opposite, the editorial cream-paper-serif-red-pen look the legacy restyle already tried. Assigned index 7 was built. Unpresented pick (my #1): 원고지; its risk was the cream-paper default. Light theme from the scene: daytime office desk and a phone in a lit shop.

Translation (named): sibling module affiliate-marketing already owns the 마트 전단지 world with Black Han Sans and yellow/red bands, and micro-saas owns 결재 seals. The ten modules must read as ten products, so the 전단지 half of #7 and Black Han Sans are dropped; the assignment binds through the 현수막 게시대's topology (tiers, posting periods), controls and the banner shop's 시안 ritual. Display face translated to Do Hyeon, the free sign-painter gothic Korean small shops print their banners in.

## Direction contract

THESIS: Every order is a banner hung on the agency's stand for a posting period that ends on its due date, and every draft is a 시안 (banner proof) before it is copy. Refuses the category default: gradient AI hero, counters, icon cards, KPI tiles and kanban columns, and the editorial opposite (cream paper, serif, red pen).

OWN-WORLD: Korean street 현수막 on a municipal 지정 게시대. Cool vinyl-white ground; cobalt banner blue owns the masthead and the stand as whole fields; galvanized-steel greys for rails and the second neutral layer; banner substrates as kind colours (블로그 green, 상품 설명 yellow, 광고 카피 red) on proofs, kind tags and charts only; yellow as the emphasised key word on blue. Do Hyeon for titles, proofs, D-day and prices; Pretendard for UI and data with tabular numerals. Components: banner panels with a stitched hem and four grommet eyelets, rectangular 게시기간 stickers for due dates, tiered steel rails for pipeline stages, square corners (0–2px), no card shadows.

STORY: The operator opens the stand and sees this fortnight's banners spanning request → due date against today's line, what is late, and what waits for 검수. They take a request (의뢰서), have AI write a 시안, edit it with every version kept, move it down the tiers to 납품완료, and publish it to the 사례 board. The client reads plans and cases and receives copy ready to paste.

FIRST VIEWPORT: Full-bleed cobalt masthead (~56px) with the 글품 wordmark (white, yellow 품), plain nav and a 샘플 tag, grommets at its corners. Under it, a headline in Do Hyeon (~40px): "오늘 마감 N건 · 검수 대기 N건" with the counts on yellow marker, date above, primary "의뢰서 쓰기" (cobalt) and "시안 쓰기" at right. Then the 게시 기간 stand: 14 day columns, today's line in red, each open order a banner bar from 접수일 to 마감일 labelled client · topic with its D-day sticker; late bars overrun in red past their due day. Below: tier flow, this month's usage against the plan, weekly throughput.

FORM: 현수막 게시대 — position 7 of 7 on my ordered list; seed key 080e7fbc (degraded roll). Signature interaction: 시안 펼치기 — when AI writes or rewrites a draft, its proof banner unrolls from the left edge like vinyl off the roll (clip-path, ~560ms expo-out) and its grommets snap in after; reduced motion shows it at rest. Motion grammar: state only; 160–240ms elsewhere; no page-load choreography.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Plan prices and quotas are the legacy POC's own; no payment is processed. 스타터 excluding 광고 카피 is inferred from the legacy table.
- Sample clients, orders and cases are fictional and labelled 샘플.
