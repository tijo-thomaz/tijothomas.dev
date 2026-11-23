# U-08 CityMap, CSS micro-interactions, accessibility and responsive checks
Stories: US-05, US-15, US-21 (primary); US-04 (part)     Depends on: U-07
Flags: hot-path: no (but the SVG is the main LCP/CLS risk, R4) · critical: no · ai: no
Estimate: M

## Goal
Add the isometric city as working navigation with CSS-only motion that respects reduced motion, and prove the whole page works at 360 px and by keyboard.

## ACs covered
HOME-AC-07, HOME-AC-08, HOME-AC-10, HOME-AC-19, HOME-AC-20, HOME-AC-21, HOME-AC-22, HOME-AC-23, HOME-AC-24, HOME-AC-25

## Scope
1. `components/CityMap.tsx`: inline SVG ported from `Main.dc.html:L49`, `viewBox="-418 -303 837 794"`, `width: 100%; height: auto`, 4 building `<a>` with `aria-label` Experience/Work/Writing/Contact; accents via `var(--accent)`; labels from `content/profile.ts`.
2. CSS: building lift `translateY(-4px)` + label highlight on hover/`:focus-visible`, `150ms ease-out`; car keyframes 12 s × 1; card hover border-colour only; `@media (prefers-reduced-motion: reduce)` turns all of it off but keeps the focus colour.
3. Playwright + `@axe-core/playwright` checks at 360×740 and 1440×900 (first viewport, overflow, Tab walk, axe, target size).
4. Fix any contrast/target-size/focus issue the checks find (site code only).

Out of scope: SEO metadata (U-09), headers (U-11).

## Files touched
`components/CityMap.tsx` + test, `components/Hero.tsx` (mount CityMap), `app/(site)/globals.css` (or `components/city.css`), `e2e/home-motion.spec.ts`, `e2e/home-a11y.spec.ts`, `e2e/home-viewport.spec.ts`, `package.json` (`@axe-core/playwright` dev dep, exact pin), `CHANGELOG.md`.

## Interfaces
- `CityMap({ labels }: { labels: Profile['city'] })` (server component, no props from the request).

## Definition of Done
- ACs pass; `npm run gates` green.
- Lighthouse report-only numbers recorded: Performance, CLS, LCP (early R4 read before U-09 enforces).
- Manual 200% zoom at 1280 px and 320 CSS px checks (NFR-018) with screenshots.
- Review clean; CHANGELOG.

## Patterns used
- Inline SVG with a fixed aspect ratio (space reserved before paint, CLS-safe).
- CSS-only interaction (no JS), `prefers-reduced-motion` as a hard switch.
- Accessible links inside SVG (`<a>` + `aria-label`, visible focus).
