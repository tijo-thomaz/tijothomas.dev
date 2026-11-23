# U-07 Home lists: Work cards, Experience, How I work, Writing
Stories: US-07, US-08, US-09, US-10, US-11 (primary); US-20 (part)     Depends on: U-06
Flags: hot-path: no · critical: no · ai: no
Estimate: M

## Goal
Add the four content-heavy sections with the honesty rules (metric null, `SHOW_PLANNED`), so every section of the page exists and all its text is in the server HTML.

## ACs covered
HOME-AC-02, HOME-AC-06, HOME-AC-09, HOME-AC-13, HOME-AC-14, HOME-AC-15, HOME-AC-16, CONT-AC-01, CONT-AC-02, CONT-AC-03, CONT-AC-04, CONT-AC-06, SEO-AC-09

## Scope
1. Server components: `WorkCard`/`WorkSection` (h3, subtitle, status badge with optional "· target", description, stack, metric row with "Not yet measured" when `value === null`, case-study link only with `caseStudyUrl`, empty-state line), `ExperienceTimeline` (sorted by start desc, "present" + "Now" only on `end: null`, dashed gap tile, no empty `<ul>`, monogram `aria-hidden`), `HowIWork` (`ol` of 5), `Writing` (rows link only with `url`, "Coming soon" badge, empty-state line).
2. `src/lib/visible.ts` (paths follow the `src/` layout, amended 2026-11-24): filters `planned` items through `isShowPlanned`.
3. Switch the view-source gate (`scripts/view-source.mjs`) to **enforce** (SEO-AC-09).

Out of scope: CityMap (U-08), `/work/[slug]`, `/writing/[slug]` pages (U-09).

## Files touched
`src/components/{WorkSection,WorkCard,MetricRow,StatusBadge,ExperienceTimeline,HowIWork,Writing}.tsx` + tests, `src/lib/visible.ts` + test, `src/app/(site)/page.tsx`, `src/components/page.test.tsx` (heading order, all anchors), `e2e/home-nojs.spec.ts`, `scripts/view-source.mjs`, `gates.yml`, `CHANGELOG.md`.

## Interfaces
- `visible<T extends { status: string }>(items: T[], showPlanned: boolean): T[]`.

## Definition of Done
- ACs pass, including the spec tests "no work card shows a number when metric is null" and "planned items hidden when flag is false"; `npm run gates` green with view-source enforced.
- Review clean; CHANGELOG.

## Patterns used
- Empty-state rendering (sections keep their ids so nav and building links never dangle).
- Feature flag at build time (planned items absent from the DOM, not hidden with CSS).
- Pure filter/sort helpers in `src/lib/`, tested without React.
