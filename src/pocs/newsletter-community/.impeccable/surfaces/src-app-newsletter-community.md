---
version: 1
slug: "src-app-newsletter-community"
primary_target: "src/app/newsletter-community"
related_targets: ["src/pocs/newsletter-community"]
---

# Surface brief: 펴냄 — editor studio + public letter (newsletter-community)

Scope: the whole module. Studio (편집실: desk, issues, editor, subscribers, board, revenue, settings) is **Operate**; the public letter (archive, reading page, plans, members' board) is **Read** with a **Persuade** moment (subscribe card, plans).
Audience/job: one Korean solo editor drafting, sending by tier, keeping the reader list, hosting members, checking revenue. Readers read on phones.
Constraints: demo data is sample and labelled; opens/clicks simulated and labelled; no real payment; Korean copy; CSS Modules.

Run notes (unattended): no question tool or decision page answer existed; the brief states the run is unattended. Roll ran degraded (no network to impeccable.style): no challengers, no QUALITY BAR boards, no pick card presented. Build path: code-led (no image generation).
Assumptions: light theme from the use scene; product renamed from placeholder "레터하우스" to "펴냄"; sample publication "작은 회사 통신" by fictional editor 윤서하.

Grounded list (ordered by resonance, written before the roll):
1. 우체국 등기/우편 ephemera (envelope 우편번호 boxes, 소인, 등기 receipt) — literal reading of "letter", the one rut candidate.
2. PC통신 동호회 BBS (하이텔/천리안 blue screen, numbered boards, 연재).
3. 원고지 manuscript grid (200자 cells, 매수 counting).
4. 70–80s Korean monthly magazine system (뿌리깊은나무-era 한글 전용 가로짜기, 호수, 목차, 꼭지, 판권, bound-in 정기구독 엽서, 독자 마당, 광고 지면). **ASSIGNED.**
5. 통장 passbook ledger (dot-matrix rows, 적요/잔액).
6. 교정지 with red 교정부호.
7. 라디오 사연 엽서 / 대자보 wall posters.

## Direction contract

THESIS: A newsletter is a periodical. The studio is a monthly magazine's editorial office — 호수, 목차, 꼭지, 판권, 정기구독 엽서, 독자 마당, 광고 지면 — not a SaaS dashboard of KPI cards and a sidebar; and the public letter is that magazine's reading pages, not a blog feed.

OWN-WORLD: Two-colour print on bright white coated stock: 먹 ink (cool near-black) and paper, heavy ink rules (3px over 1px) opening every block, leader-dotted contents rows, tabular figures. Colour arrives only as issue covers: each numbered issue owns one printing ink from a fixed set of eight (쪽, 주홍, 쑥, 황, 자주, 청록, 먹회, 분홍) and shows it as a solid cover field. Hahmlet 명조 for 제호, titles and issue numerals; Pretendard for every control, label and table. Buttons are solid ink blocks with square 2px corners; tags are small ink-outlined labels; selection is a yellow 형광펜 highlight.

STORY: The editor sees the next issue as a cover, its lineup as a contents page and the publication's vital record as a colophon; writes in 원고, checks the 교정쇄, sends to a tier and watches (simulated) opens arrive. Readers see a magazine page, hit a perforated line on paid issues and tear off the bound-in 정기구독 엽서 to subscribe.

FIRST VIEWPORT: Desk at 1440: masthead band (제호 "펴냄" wordmark left, publication name + 편집실, dated line right, section strip below, double ink rule). Left 7/12: the next issue as a full cover field in its ink — "제44호" numeral at ~120px Hahmlet 800, title at 34px, one status line (예약/초안 · 발송 시각 · 수신 예정 N명), primary "이어 쓰기" ink button inside the cover. Right 5/12: 목차 — upcoming then recent issues as leader-dotted rows (swatch, number, title, 꼭지, date, sample 오픈율). Below: 판권 colophon block and the circulation chart.

FORM: 70–80s Korean monthly magazine editorial system; candidate 4 of 7 on the ordered list; seed key 598a08e4. Signature interaction: **교정쇄 넘김** — the editor's 원고 ↔ 교정쇄 switch lays the typeset proof over the manuscript with a 360ms left-to-right clip-path wipe (exponential ease-out; instant under reduced motion), and the manuscript footer counts length in 원고지 매수. Motion grammar: state changes 160–220ms ease-out; no page-load choreography.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- None blocking. Real email delivery and payment are out of scope (labelled demo).

## Finish review (in-thread; this harness had no agent tool to spawn the shipped reviewer)
Round 1 disposition: fix. Material fixes: (1) plans rate table showed paid tiers without the free tiers' perks — tiers made cumulative; (2) issue list number cell used flex on a table cell, splitting rows — wrapped; unpublished rows show their expected 호수 in grey; (3) settings fields misaligned when one had a hint — fields align to start; (4) revenue ledgers crushed columns on phones — tables keep min width and scroll inside their frame; (5) letter latest-issue cover overran the page gutter — aligned; (6) invalid <p> nesting in comments (hydration error) — fixed; (7) proof repeated the divider under the preview marker — marker replaces it; (8) lede opacity lowered contrast on light covers — removed.
Round 2 (verdict): all eight resolved in recaptures; two regressions-level nits fixed after (table-cell grid on titles, section-head wrap on phones). Disposition after round 2: ship (covers the scored fixes).
Detector: impeccable@4.1.0 — 3 mechanical findings fixed; remaining advisories are off-ramp literal sizes (17px reading, 26–72px display clamps) recorded in DESIGN.md.
