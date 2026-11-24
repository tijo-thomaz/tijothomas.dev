# U-08 CityMap, motion, accessibility and responsive checks: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `ccfa635` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-08-citymap-motion-a11y.md`
- **ACs (10):** HOME-AC-07, 08, 10, 19, 20, 21, 22, 23, 24, 25. All are removed from `specs/pending.txt` (28 → 18).
- **New dev dependency:** `@axe-core/playwright` pinned to exactly `4.14.0`. The wrapper's 4.14.1 was published on the day of this unit, so the older release was chosen. Its dependency `axe-core` resolves to 4.14.1, released 2026-11-16 (8 days earlier). That version was kept and is not overridden. `npm audit` high count unchanged at 0. (Corrected after the U-08 review.)

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| HOME-AC-07 | `e2e/home-viewport.spec.ts` | At 360×740 and 1440×900, the location line, `h1`, intro and "View work" each have `top < viewport height`. | e2e |
| HOME-AC-08 | `CityMap.test.tsx` | Exactly 4 links in the svg (Experience, Work, Writing, Contact) to `#experience`, `#work`, `#writing` and `#contact`. Their names come from the nav content. No other link is in the map. The ids exist on the page (HOME-AC-09 page test). | unit |
| HOME-AC-10 | `CityMap.test.tsx`, `home-viewport.spec.ts` | The viewBox is `-418 -303 837 794`. The svg sits in a `<nav>` named by `profile.city.label`. It has no `img` role, which would hide its links. A `role="group"` on the svg was rejected by lint (prefer-tag-over-role). 9 accent fills use `class="accent"` and `var(--accent)`, with no `{{accent}}` and no literal `#ff7a33`. The signposts show `profile.city.signposts` in order. The rendered aspect ratio is 794/837, so space is reserved before paint (CLS). | unit, e2e |
| HOME-AC-19 | `e2e/home-motion.spec.ts` | On hover, and on keyboard focus, the building's transform is `translateY(-4px)` and its label fill changes. The transition is `0.15s ease-out`. | e2e |
| HOME-AC-20 | `home-motion.spec.ts`, `CityMap.test.tsx` | Exactly one car animation: 12000 ms, 1 iteration. The car is its own `g.city-car` (6 polygons, 2 wheels). Hovering a work card changes only `border-color`. | e2e, unit |
| HOME-AC-21 | `home-motion.spec.ts` | With reduced motion: `document.getAnimations().length === 0`, every transition ≤ 0.01 s, and the focus still changes the label fill. | e2e |
| HOME-AC-22 | `home-viewport.spec.ts` | At 360 px, scrolled to the end, `scrollWidth ≤ 360`. | e2e |
| HOME-AC-23 | `e2e/home-a11y.spec.ts` | Tab reaches each interactive element exactly once, then wraps (no trap). Each shows an outline ≥ 2 px, or lifts if it is a building. | e2e |
| HOME-AC-24 | `home-a11y.spec.ts` | axe (WCAG 2.0/2.1/2.2 A and AA tags) reports 0 violations at 360 px and at 1440 px. | e2e |
| HOME-AC-25 | `home-a11y.spec.ts` | At 360 px, every link and button is at least 24×24, or meets the 2.5.8 spacing exception (a 24 px circle on its centre touches no other target). | e2e |

## Also covered by this unit's gate run
`e2e/cursor.spec.ts` (owner request at U-07 PG5: arrow cursor, no text selection on `/`). It needs a production build, so it runs with these specs.

## Red run
- `CityMap.test.tsx` fails because `./CityMap` does not exist.
- The e2e specs fail until the map and the CSS exist. They run in the gate worktree.
