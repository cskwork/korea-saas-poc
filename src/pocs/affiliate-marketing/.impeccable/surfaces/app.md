---
version: 1
slug: "app"
primary_target: "app"
related_targets: []
---

# Surface: 링크잇 workspace (all module routes)

Scope: every route under `/affiliate-marketing` (dashboard, links, link detail, conversions, analytics, content, social, programs) plus the public ended-link page served by `/go/<code>`. Visitor mode: **Operate**. Build path: code-led (no image generation in this run).

Audience/job: a Korean solo affiliate marketer, evening at a desk or on a phone in transit, registers links, copies short links into posts, logs orders from settlement reports, reads what earned, drafts the next post. Proof/content: sample workspace data (labelled 샘플), measured clicks from the real redirect. Constraints: Korean copy, won integers, Asia/Seoul, WCAG AA, 360px phones.

Run notes (unattended): no question tool or user was reachable, so the interview and decision page were skipped. The roll ran degraded (no network to the roll service): no challengers, no quality-bar boards, so no donor raises exist. Grounded list, ordered by resonance: 1 택배 운송장·배송조회 (waybill + tracking scans), 2 증권 MTS 시세판 (red up / blue down), 3 핫딜 게시판 rows, 4 마트 전단지·매대 가격표 (supermarket flyer + shelf-edge price label), 5 홈쇼핑 방송 자막, 6 정산 영수증 (thermal receipt), 7 스마트에디터 글쓰기 화면. Rut kept out: the four-KPI-card SaaS dashboard (the legacy POC) and its opposite, the dark neon growth terminal; literal chain-link imagery for "링크잇". Assigned index 4 was built. Unpresented pick (my #1): the waybill world; its risk was familiarity with logistics-tracking UIs. Light theme from the scene: a normally lit room or a daytime commute, copy drafted for white blog pages.

## Direction contract

THESIS: Every affiliate link is a product on a supermarket shelf, and its shelf-edge price label shows what the link *earned*, not what the product costs. Refuses the category default: four KPI cards, a line chart and a donut on a gray SaaS canvas.

OWN-WORLD: Korean 마트 전단지 and 매대 가격표. Glossy flyer-white ground; 행사 yellow bands that own whole regions; 특가 red for money and the primary action; ink-black text; shelf-rail gray for the strip labels clip onto. Heavy Korean signboard display (Black Han Sans) for headings, condensed heavy numerals (Archivo, narrowed) for prices, Pretendard for UI. Components: shelf labels with a 단위가격 box that reads 클릭당 수익 (EPC), a barcode drawn from the short code, round price-gun stickers for small tags, flyer category bands as page headers, red-up / blue-down deltas (Korean market convention). Square-ish corners (2–4px), no shadows on labels.

STORY: The marketer opens the store and sees this month's flyer headline with the month's earnings set as a price inside a sentence, the daily sales bars, and the shelf of best-earning links. They learn which link and channel moved orders, scan a barcode to copy a short link, log an order, then write the next flyer (review, ranking, SNS post) from the same links.

FIRST VIEWPORT: Red store band (56px) with the 링크잇 wordmark, plain-language aisle nav and the 샘플 sticker. Under it a full-bleed yellow flyer band: left, headline sentence in Black Han Sans with the month's earnings as a ~96px red condensed price, confirmed/pending split and goal meter; right, 30 daily sales bars in red on yellow with today marked; primary actions 링크 등록 (red) and 판매 기록 in the band. Below the fold line: the shelf rail carrying the top links' price labels, and the live scan tape of recent clicks.

FORM: 마트 전단지·매대 가격표 — position 4 of my ordered list of 7; seed key fd488480 (degraded roll). Signature interaction: 스캔 복사 — pressing a label's barcode sweeps a red scanner line across it and copies the tracked short link, confirmed by a stamped sticker. Motion grammar: labels clip onto the rail on insert (160ms), scanner sweep (280ms), sticker stamp (180ms); state only, all removed under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Program terms in the comparison table are POC reference notes, not verified against current program policies.
