# Modern Web Guidance pass over the site (between U-08 and U-09)

- **Date:** 2026-11-25 · **Requested by:** owner ("do the mwg pass now then U-09") · **Scope:** the public site, `src/app/(site)` and `src/components`. The terminal is out of scope (owner: "ignore terminal").
- **Method:**
  1. `legacy-scan` over both folders. This checks 38 guides with 52 deterministic rules, about 20 % of the corpus.
  2. A manual audit of `globals.css` and the 18 component files against the guides `css`, `color`, `performance`, `responsive-design`, `html`, `css-layout` and `motion`. `accessibility`, `typography` and `visually-stable-font-fallbacks` were applied in U-06 to U-08.

## legacy-scan
- `src/app/(site)`: 0 findings.
- `src/components`: 1 finding, `js/copying-array-methods` (`ExperienceTimeline.tsx:57`, `[...entries].sort()` → `toSorted()`). **Dropped** under the guide's own rubric: `tsconfig` targets ES5, which is older than ES2023.

## Findings and outcome
| # | Guide | Finding | Outcome |
|---|---|---|---|
| 1 | css §5 (design tokens) | Literal colours in rules: badge colours, the timeline line, the gap-tile border, the translucent How-I-work card | **Fixed.** Now `:root` tokens: `--badge-*`, `--line-strong`, `--timeline`, `--on-ink-line`, `--on-ink-surface` |
| 2 | css §1, css-layout §1.2 | Physical properties for flow spacing: `padding-bottom`, `margin-top`, `padding-top`, `border-top`, `width`/`height` | **Fixed.** Logical properties (`padding-block-end`, `margin-block-start`, `border-block-start`, `inline-size`/`block-size`). `inset-inline-start` was already in use |
| 3 | responsive-design, css-layout §7 | `scroll-margin-top: 100vh` | **Fixed.** `scroll-margin-block-start: 100dvh` |
| 4 | color (light/dark) | No `color-scheme` declared, so browser UI (scrollbars) could render dark against a light-only design | **Fixed.** `color-scheme: light` on `:root` |
| 5 | color (forced colours) | Badges, monograms, step numbers, highlight tiles and the metric box exist only as backgrounds, which High Contrast mode removes | **Fixed.** `@media (forced-colors: active)` gives them a `CanvasText` border. The buttons already had a transparent border, which shows in forced colours |
| 6 | css-layout §2 (flexbox) | At 360 px the nav wraps and leaves "Contact" alone on the second row | **Fixed.** `flex-wrap: balance` after `wrap`. This is progressive: Chrome and Edge 150 support it, and other browsers fall back to `wrap` |
| 7 | motion | The reduced-motion rule was a global `* { animation: none; transition: none }`, which the guide calls out ("DO NOT globally apply …") | **Fixed.** Case-by-case rules for the four motion sources (car, card border, building lift, label fill). Conflict noted: the guide prefers keeping colour transitions under reduced motion, but HOME-AC-21 requires every transition ≤ 0.01 s, so the label fill change stays instant. The spec wins |
| 8 | motion (WCAG 2.2.2 Pause, Stop, Hide) | The car moves on its own for **12 s** with no pause control. Motion that starts automatically, lasts more than 5 s and is shown alongside other content needs a visible pause, stop or hide control | **Owner decision D1** |
| 9 | color (dark mode) | The guide recommends honouring `prefers-color-scheme: dark` | **Owner decision D2.** The mockup is light only |
| 10 | css §2 | The class names use a BEM-like `--modifier` (`badge--live`); the guide prefers cascade layers and `:where()` | **Kept.** The site CSS is small (about 13 KB minified) and its specificity is flat. A layers refactor is over-engineering at this size (guide: "Do not overengineer") |
| 11 | performance | Critical path, fonts, LCP and containment | **Compliant.** Static HTML. `next/font` is self-hosted and preloaded, with size-adjusted fallbacks. No images. No `@import`. Analytics is deferred. `content-visibility` is skipped because the page is small (guide: "DON'T … on smaller, simpler pages"). Lighthouse performance 99, CLS 0 |
| 12 | html | Doctype, `lang`, viewport (zoom allowed), one `h1`, ordered headings, landmarks (one banner, main and contentinfo; two named navs), lists, link and button roles | **Compliant** |
| 13 | css-layout | Flexbox for rows, `gap` rather than margins, the `flex` shorthand, `aspect-ratio` for the svg, `display: block` on the svg, no `overflow: hidden` to mask layout | **Compliant** |

## Owner decisions
- **D1: car animation (WCAG 2.2.2).**
  - (a) **Recommended:** shorten the drive to 5 s or less, which needs no control. This amends HOME-AC-20 (12000 ms → ≤ 5000 ms).
  - (b) Keep 12 s and add a visible pause control. It needs a button, so client JS or a CSS-only checkbox control.
  - (c) Keep 12 s with no control, and accept the WCAG 2.2.2 gap (Level A).
- **D2: dark mode.**
  - (a) **Recommended:** none for now (the mockup is light only), declared with `color-scheme: light`.
  - (b) Add a dark theme as a later unit.
