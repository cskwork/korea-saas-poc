---
version: 1
slug: "hubpage-tsx"
primary_target: "HubPage.tsx"
related_targets: []
---

# Surface brief: hub (catalogue of the ten products)

Scope: `src/hub/HubPage.tsx`, rendered at `/` by `src/app/page.tsx`.
Mode: Persuade. Audience/job: a visitor from a shared link (often on a phone) deciding which of ten one-person Korean SaaS businesses to open.
Proof/content: the ten live products and their registry metadata (name, category, tagline, description, audience, accent). No traction numbers exist; none are shown.
Constraints: render whatever `MODULES` holds, in order; an eleventh module must fit without layout surgery; Korean copy; links into modules are full page loads.
Decision note: unattended run; the owner was not interviewed. Direction taken from the concept-seed assignment without a decision page (no user present). Build path: code-led (no image generation).

## Direction contract

THESIS: The hub is a market arcade's guide map (시장 안내도): ten shops under one roof, each with its own painted sign; you walk the aisle and step inside a working shop. Refuses the category default: gradient hero over ten identical icon cards.

OWN-WORLD: A printed arcade plan on cool concrete grey, drawn in blue-black ink with 2px wall lines and a dashed aisle centre line; an enamel-green entrance board with white sign lettering; each stall's sign board painted in that product's own accent colour, lettered in Do Hyeon (sign-painter face) and nothing else in Do Hyeon; small enamel number plates (가-01…); Pretendard for all reading text; square corners; no shadows except the lit sign's glow-free offset on hover.

STORY: The visitor sees the whole arcade at once, understands "ten real businesses in one building", reads each sign's one-liner, and taps a sign to walk into a product that already has its own demo data. An empty stall marked 입점 준비 중 says the building has room for more.

FIRST VIEWPORT: Full-width enamel entrance board: name large in sign lettering, one promise line, a small plate "모든 가게 영업 중 · 방문자별 데모 데이터". Directly below, the plan: on desktop a horizontal aisle with five stalls above and five below (sign fronts facing the aisle); on mobile the aisle runs down the page with stalls stacked. Every stall front is the primary action.

FORM: Traditional-market arcade guide map (전통시장 안내도), candidate 7 of 7, seed key e1b45b6e.
Signature interaction: the opening. On load the arcade opens: each shop's roll shutter rolls up into its box in turn (staggered, exponential ease-out), so the page literally opens for business; content is fully visible once open and reduced motion starts open. Hover lifts a storefront and nudges its 들어가기 arrow.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
