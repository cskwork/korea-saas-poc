# Asset register

Raster assets shipped with the AI 콘텐츠 대행 POC. All were generated on 2026-09-25 with GPT Image 2
(ChatGPT Images 2.0) through the local Codex CLI (`gpt-image-2` skill), then resized and compressed with
ImageMagick. They show generic print proofs, a loupe and a cutting mat; no real person, place, brand or
customer work appears. The generation prompt is also embedded in each file (`og.jpg` as a JPEG comment,
the WebP files as `<file>.webp.json` sidecars that are not deployed).

| File | Size | Used in | Alt text | Source image |
| --- | --- | --- | --- | --- |
| `assets/hero-800.webp`, `assets/hero-1400.webp` | 800x533, 1400x933 | Hero key art | 녹색 커팅 매트 위에 재단 표시와 색 막대가 인쇄된 교정지 세 장이 겹쳐 있고, 자홍색 교정 부호와 확대경, 펜이 놓여 있다 | 1536x1024 PNG |
| `assets/empty-proof-480.webp` | 480x480 | Generator empty state | Decorative (`alt=""`); the empty-state sentence carries the meaning | 1254x1254 PNG |
| `assets/og.jpg` | 1200x630 | Open Graph / social preview | `og:image:alt`: 녹색 커팅 매트 위 교정지에 'AI 콘텐츠 대행' 제목이 인쇄되어 있다 | 1730x909 PNG (second attempt; the first had a stray dash after the title) |
| `assets/favicon.svg` | vector | Browser tab icon | n/a | Hand-authored SVG (registration mark) |

## Prompts

**hero**: Wide 3:2 overhead photograph of a designer's desk surface: a dark green self-healing cutting mat with a pale printed grid and ruler tick marks along the edges fills the whole frame. On it lie three trimmed white print proof sheets, slightly overlapping and slightly rotated, each with thin black crop marks at the corners, a small CMYK colour-bar strip along one edge, and a registration target mark. The sheets show abstract blocks of grey body text lines and one bold headline bar (no readable letters). One sheet has hand-drawn magenta proofreading marks: a circled word, a caret, a looping delete mark. A round glass printer's loupe rests on the top sheet, and a magenta fine-liner pen lies beside it. Soft even daylight from the upper left, gentle realistic shadows, crisp focus, calm and orderly, generous empty green mat in the right third. No readable text, no logos, no hands, no people.

**empty-proof**: Square overhead photograph: a single blank white print proof sheet with thin black crop marks at its four corners and a small CMYK colour-bar strip along the bottom edge, lying on a dark green self-healing cutting mat with a pale printed grid. A round glass printer's loupe rests on the empty sheet, magnifying nothing but paper grain. Soft even daylight, gentle shadow, lots of empty space. No text, no logos, no hands.

**og**: Landscape 1200x630 social preview image, overhead photograph. Dark green self-healing cutting mat with a pale printed grid fills the frame. Centered-left, a trimmed white print proof sheet with thin black crop marks at its corners and a CMYK colour-bar strip along the top edge. On the sheet, large bold black Korean headline text reading exactly "AI 콘텐츠 대행" (nothing after it). Below it a smaller line reading exactly "블로그 · 상품 설명 · 광고 카피". A magenta proofreading circle loops around the word AI. A round glass loupe sits on the mat to the right of the sheet. Soft daylight, crisp, orderly. No other text, no logos, no people.
