# Asset register

Raster assets shipped with the 예약잇다 POC. All three were generated on 2026-09-24 with GPT Image 2
(ChatGPT Images 2.0) through the local Codex CLI (`gpt-image-2` skill), then resized and compressed with
ImageMagick. They are illustrations of a fictional sample shop; no real place, person, or brand is shown.

| File | Size | Used in | Alt text | Source image |
| --- | --- | --- | --- | --- |
| `assets/salon-800.webp`, `assets/salon-1400.webp` | 800x533, 1400x933 | Public booking page shop header | 작은 동네 미용실 내부 일러스트: 거울 앞 의자 하나, 제품 선반, 화분, 카운터 위에 펼친 예약장과 도장, 붉은 인주 | 1536x1024 PNG |
| `assets/empty-book-480.webp` | 480x480 | Empty states (no bookings today, no customers) | Decorative (`alt=""`); the empty-state text carries the meaning | 1254x1254 PNG |
| `assets/og.jpg` | 1200x630 | Open Graph / social preview | n/a (meta image) | 1731x909 PNG |
| `assets/favicon.svg` | vector | Browser tab icon | n/a | Hand-authored SVG |

## Prompts

**salon**: Wide 3:2 landscape illustration of a small Korean neighborhood hair salon interior seen from the entrance: one styling chair facing a round mirror, a shelf of hair products, a potted plant, a counter with an open paper appointment book and a small round red ink pad beside a wooden seal stamp. Style: fine printed-ink line drawing with flat colour fills, like an illustration printed on an official Korean form or a 1980s textbook plate. Palette strictly limited: pale celadon grey-green paper ground (#E9EFEA), deep blue-black ink lines (#1F2A3C), muted form green (#2F6B55), and one small cinnabar red accent (#C8372D) only on the ink pad. No text, no letters, no numbers, no people. Calm, orderly, generous empty ground in the upper third.

**empty-book**: Square illustration, top-down view: an open ruled appointment ledger with empty ruled lines and an empty approval box grid, a wooden Korean seal stamp (dojang) lying beside a round red cinnabar ink pad tin. Style: fine printed-ink line drawing with flat colour fills, like a plate printed on an official form. Palette strictly limited: pale celadon grey-green paper ground (#E9EFEA) filling the whole background, deep blue-black ink lines (#1F2A3C), muted form green (#2F6B55), one cinnabar red accent (#C8372D) on the ink pad only. No text, no letters, no numbers, no hands. Plenty of empty ground around the objects.

**og**: Landscape 1200x630 social preview image. Left half: a large square Korean seal stamp impression in cinnabar red (#C8372D) with slightly uneven ink texture, reading the Hangul text 예약잇다 in bold carved seal lettering arranged 2x2 (예약 on top row, 잇다 on bottom row), clearly legible. Right half: a slice of a ruled appointment ledger on pale celadon grey-green paper (#E9EFEA) with deep blue-black ink rule lines (#1F2A3C), rows of times 10:00 10:30 11:00, and two small round green (#2F6B55) confirmation seal marks in the right-hand approval column. Flat, precise, printed-form aesthetic, no people, no other text.
