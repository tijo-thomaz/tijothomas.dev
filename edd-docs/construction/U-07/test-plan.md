# U-07 Home lists: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `8705b16` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-07-home-lists.md`
- **ACs (13):** HOME-AC-02, 06, 09, 13, 14, 15, 16 · CONT-AC-01, 02, 03, 04, 06 · SEO-AC-09. All are removed from `specs/pending.txt` (41 → 28).
- **Written by:** the orchestrator in the main session. edd-reviewer runs in the background before PG5.

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| HOME-AC-02 | `page.test.tsx` | One `h1`, which comes first. The section `h2`s are in page order. The work card names are `h3`. No heading level is skipped. | unit |
| HOME-AC-06 | `e2e/home-nojs.spec.ts` (2) | With JS disabled, every section is visible, there is no "Loading" text, and each nav anchor scrolls its target into view. | e2e |
| HOME-AC-09 | `page.test.tsx`, e2e | Every `a[href^="#"]` targets an existing id (at least 8 links). | unit, e2e |
| HOME-AC-13 | `WorkSection.test.tsx`, `format.test.ts` | Article plus `h3` per item. Subtitle, summary and stack ("·"-joined). The badge shows the live label (PromptShield "Proof of concept"), or "In progress"/"Planned" plus "· Mon YYYY". The case-study link appears only when `caseStudyUrl` is set. | unit |
| HOME-AC-14 | `ExperienceTimeline.test.tsx` (7), `format.test.ts` | Sorted by start descending whatever the input order. "present" and "Now" appear only on `end: null`. The gap entry has a dashed tile ("Move") and no card. A job shows an `h3` company, title, dates, location · work mode and bullets. The monogram is `aria-hidden`. No `<ul>` when there are 0 bullets. | unit |
| HOME-AC-15 | `HowIWork.test.tsx` | The region is named by its `h2` and holds an `ol` of 5 items, each with an `h3` title and text. | unit |
| HOME-AC-16 | `Writing.test.tsx` (4) | One row per post with an `h3` title, subtitle and "Coming soon" badge. There are no links without a URL. A published post with a URL is a link and has no badge. With 0 posts, the `h2` and the empty line remain. | unit |
| CONT-AC-01 | `WorkSection.test.tsx` | A null value reads exactly "Not yet measured" and contains no digit; the label keeps its "30%". | unit |
| CONT-AC-02 | `WorkSection.test.tsx` | A set value appears verbatim next to its label. | unit |
| CONT-AC-03 | `visible.test.ts`, `page.test.tsx` | `visible(items, false)` drops planned items. With the flag unset, `"TRUE"` or `"1"`, neither fde title is in the page HTML. | unit |
| CONT-AC-04 | `visible.test.ts`, `page.test.tsx` | With `SHOW_PLANNED="true"`, planned items render with "Planned · Dec 2026". | unit |
| CONT-AC-06 | `WorkSection.test.tsx`, `visible.test.ts` | With 0 items, `section#work` keeps its `h2` and shows the empty-state line. | unit |
| SEO-AC-09 | `scripts/content-strings.test.mjs` (4) | Expected strings are built from `src/content`, cover every section, include planned items only when the flag is set, and contain no null or empty strings. The view-source gate is enforced. | gate |

## Carried DoD items
- `scripts/site-tailwind.test.mjs`: the `(site)` CSS uses `@config` with a site-only config (U-06 review #7).
- The keep-list entries are removed. The U-05 staleness check fails on them once U-07 imports the modules, so this enforces itself.

## Note
CONT-AC-03 needs "one planned post". Content has no planned post (all three are `coming-soon`, RQ-01 a), so post filtering is covered by `visible.test.ts`, which tests the same function the page uses for posts.

## Red run
- vitest: 6 files fail because their modules are missing.
- `page.test.tsx`: 3 tests fail, because the sections are absent. CONT-AC-03 passes trivially until the work section exists.
- node: `content-strings` and `site-tailwind` fail.
