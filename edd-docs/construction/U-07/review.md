# U-07 Home lists: review (EDD stage 2.3)

- **Date:** 2026-11-24 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `8705b16..48ac777` (37 files, +1218/-31)
- **Precondition NOT met:** `edd-docs/construction/U-07/gates.md` does not exist. The orchestrator said the gates run separately, so this is a code and security review only. Under EDD rules the unit cannot pass PG5 until a green gate record exists. That record must include CG1 build, `use_client` with the build (`/` static), CG10_pii_scan, CG5, the now-enforced `view-source` gate, and `e2e/home-nojs.spec.ts` against prod.
- **Verdict: approve-with-minors**, on condition that the gate record comes back green. There are 0 blockers and 0 majors, plus 7 minors and 7 nits.

## What I ran myself (main checkout at `48ac777`, clean tree; no `next build`, `next dev` or Playwright)
| Check | Result |
|-------|--------|
| `npx vitest run` | 32 files, 315/315 pass |
| `node --test scripts/*.test.mjs` | 224/224 pass |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0; warnings only, all in `src/terminal/**` |
| `node scripts/check-literals.mjs` | PASS (15 files) |
| `node scripts/check-use-client.mjs --no-build` | PASS (25 modules). I could not run the "`/` is static" half without a build. |
| `node scripts/check-unreachable.mjs` | PASS: 118/118 reachable. The keep list is empty, so the U-05 entries are gone. |
| `expectedStrings({showPlanned:false})` (read-only probe) | 88 strings. **9 are substrings of another expected string** (`Work`, `10 languages`, `PromptShield`, `Go`, `React`, `TypeScript`, `Lead Software Engineer`, `Software Engineer`, `Engineer`), so each of them can go missing without the gate noticing (#1). The import also prints Node `MODULE_TYPELESS_PACKAGE_JSON` warnings (#7). |
| Contrast (WCAG formula, computed) | muted `#4a5568` on surface `#f4f7fa` 7.00, on white 7.53. Badges: default 15.37, live 7.97, in-progress 8.47, "Now" (ink on accent) 6.65. On-ink text on the step tile 9.52. Focus `#93c5fd` on ink 9.58. All pass AA. |
| `Intl en-GB` probe | `formatMonth('2026-09')` returns **`Sept 2026`** (#6) |

## Checks the orchestrator asked for
1. **CONT-AC-01 passes.** `MetricRow.tsx:9` renders `metric.value ?? notMeasured`. No digit is ever synthesised: the value is either content or the label. `WorkSection.test.tsx` asserts the exact text plus `/^\D*$/`. PromptShield has `metric: null`, so no row renders (F-16 resolution).
2. **CONT-AC-03/04 pass.** `page.tsx:22` calls `isShowPlanned(process.env.SHOW_PLANNED)`, which is exact `=== 'true'`. `visible()` filters before render. Every component in the tree is a server component with no `"use client"` (gate PASS). Props are therefore never serialised into the RSC payload, which carries only the rendered tree, so planned items cannot leak through `__next_f`. The env var has no `NEXT_PUBLIC_` prefix, so it is never inlined into client JS. The page test covers unset, `"TRUE"` and `"1"`. One gap: no check runs against the real build output (#3).
3. **HOME-AC-02, 14 and 16 pass.** There is 1 `h1`, 5 `h2`s in page order, `h3` cards and steps, and no skipped level. The timeline is sorted descending. "present" and "Now" appear only on `end: null`. The gap gets a dashed tile and no card. `<ul>` renders only when there are bullets. Posts without a `url` are a `div`, not a link, so there are no `#writing` self-links.
4. **The view-source gate** cannot pass with 0 expectations (`expected.length > 0` check). However, it can miss rendered strings (#1, #2). Its SHOW_PLANNED logic matches the page today, but it duplicates the parser instead of importing it (#3). Node type stripping works on Node 24.14, but it is not robust to the declared `engines` range (#7).
5. **Accessibility.** `role="list"` is kept with a lint-disable and a reason. Monograms, the gap tile and step numbers are `aria-hidden`. Each region is named by its `h2` (`aria-labelledby`). Contrast passes (see above). How I work has no focusable elements, and the `--focus` override is in place for `band--ink`. Under `prefers-reduced-motion` the work-card transition is removed, and it is the only new transition. Two markup issues: #5 and nit #13.
6. **`format.ts`** is safe for UTC and time zones (`Date.UTC` with `timeZone: 'UTC'`), with no off-by-one (`month - 1`). The one defect is the `Sept` locale quirk (#6).
7. **Tests:** one assertion cannot fail (#4), one is partly tautological (#12), and one can leak env state between tests (#8).

## Findings
| # | Severity | File:line | Finding | Fix | Status |
|---|----------|-----------|---------|-----|--------|
| 1 | minor | `scripts/view-source.mjs:41`, `scripts/lib/content-strings.mjs:33`, `:42` | **The gate cannot detect some missing strings.** It checks `text.includes(s)` against the page's whole visible text. 9 of the 88 expected strings are substrings of other expected strings, for example `Go`/`React`/`TypeScript` (stack row vs summary and highlights), and `Engineer`/`Software Engineer` (QBurst and NetObjex titles vs `Lead Software Engineer`). The whole PromptShield stack row could be dropped except `Zustand`, and the gate would still pass. The same applies to short labels such as `Now`, `present` and `Move`, which can match unrelated text. SEO-AC-09 says the gate "names any missing string". | Match per text node: split the HTML on tags, decode, and normalise. Require each expected string to equal a node, or to appear inside one with word boundaries. As a minimum, require the multiplicity (count of occurrences ≥ count expected). Add a must-FAIL fixture: the HTML minus the stack row. | open |
| 2 | minor | `scripts/lib/content-strings.mjs:4`, `:31-38`, `:40-44` | Composite strings that are rendered from content are not expected at all. These are the formatted date ranges (`Feb 2023 – Nov 2025`, `Apr 2026 – present`), the badge target month (`Planned · Dec 2026`), and the joined stack and location lines. A broken `formatRange` or a dropped date line would pass the gate. `format.ts` has only a type import, so it loads through type stripping just like the content modules. | Import `src/lib/format.ts` and expect `formatRange(...)`, `workBadge(...)`, `stack.join(' · ')` and the `location · workMode` line. This also covers #1 for the stack tokens. | open |
| 3 | minor | `scripts/view-source.mjs:33` | (a) The gate re-implements the flag (`process.env.SHOW_PLANNED === 'true'`) instead of importing `isShowPlanned` from `src/lib/flags.ts`, so the two can drift. (b) The check is one-way. When the flag is off, nothing checks the real `next start` HTML or RSC payload for planned titles. CONT-AC-03 is therefore proven only at the unit level (`renderToStaticMarkup`), never on the shipped artefact. | Load `flags.ts` the same way as `visible.ts`. When the flag is false, also assert that every planned work and post name is absent from the **raw** HTML, including the `self.__next_f` script content, and name any leak. | open |
| 4 | minor | `src/components/Writing.test.tsx:37` | This assertion cannot fail. It checks that a published post's link text does not contain `"Coming soon"`, but a published post has no `postStatus` label to render. If the component wrongly rendered a badge for `published`, the badge would be an empty `<span class="badge">`, and the test would still pass. | Assert `link.querySelector('.badge')` is null, or `queryByText` on every `postStatus` value plus no `.badge` element in the row. | open |
| 5 | minor | `src/components/Writing.tsx:8-9` | `<h3>` sits inside `<span className="post-text">`. A `span` allows only phrasing content, so this is invalid HTML. The HTML validator and some AT tree builders flag it. | Change `post-text` to a `div`, and make the subtitle a `p` (the CSS is class-based, so the layout is unchanged). | open |
| 6 | minor | `src/lib/format.ts:3` | `Intl.DateTimeFormat('en-GB', { month: 'short' })` gives **`Sept 2026`** for September (CLDR en-GB), while every other month has three letters. No content date is in September today, so the bug is latent, and `format.test.ts` does not cover it. The output also depends on the build's ICU data. | Use a fixed `['Jan',…,'Dec']` table, or `en-US`. Add a test for `formatMonth('2026-09') === 'Sep 2026'`. | open |
| 7 | minor | `package.json:7`, `scripts/lib/content-strings.mjs:2`, `:10` | The enforced gate imports `.ts` through Node type stripping. That is on by default only from Node 22.18 / 23.6, but `engines` allows `>=22`, and the comment says "Node 24". On 22.0–22.17 the gate crashes with `ERR_UNKNOWN_FILE_EXTENSION` (it fails loudly, so this is not a vacuous pass). Each import also prints `MODULE_TYPELESS_PACKAGE_JSON` reparse warnings into gate output. The approach also breaks the first time a content module gains a value import (`@/…` alias or extensionless path). | Raise `engines.node` to `>=22.18`. Probe once and throw a clear error naming the Node version. Document in `content-strings.mjs` that `src/content` may import only types, and add a test that enforces it (scan for `import` that is not `import type`). | open |
| 8 | nit | `src/app/(site)/page.test.tsx:80-93` | `vi.unstubAllEnvs()` runs inside the test body after the assertions. If an assertion fails, `SHOW_PLANNED` stays stubbed for the following tests in the file. | Move it to `afterEach` (next to `useRealTimers`), or set `unstubEnvs: true` in the vitest config. | open |
| 9 | nit | `src/components/ExperienceTimeline.tsx:65` | The comment says "styled `<ul>`", but the element is an `<ol>`. | Fix the comment. | open |
| 10 | nit | `scripts/lib/content-strings.mjs:8`, `:10`, `scripts/view-source.mjs:14` | Content is loaded from `repoRoot` (where the script lives), while the build is served from `--root`. If someone runs the gate with `--root <other worktree>`, it compares that build against this checkout's content. | Pass `root` into `expectedStrings`. | open |
| 11 | nit | `src/components/MetricRow.tsx:9` | `??` lets `value: ''` through, which renders an empty `<span class="metric-value">`. That would break CONT-AC-08 and look like a missing value. The type allows `''`. | Add a content validation that `metric.value` is `null` or a non-empty string. Do not substitute text in the component. | open |
| 12 | nit | `src/components/ExperienceTimeline.test.tsx:25` | The expected order is computed with the same `localeCompare` comparator as the implementation, so the test checks only that a sort happened, not the right one. | Hard-code the expected ids (`['opteamix','relocation','bet365','infosys','netobjex','qburst','speridian']`). | open |
| 13 | nit | `src/app/(site)/globals.css` (`.post-row` block, about line 568) | A linked post row (`.post-row--link`) has `text-decoration: none` and no hover style. Once posts get URLs, nothing shows they are links except the focus ring. No post has a URL yet, so this is latent. | Add an underline or colour change on the title when the row is hovered or focused, for linked rows only. | open |
| 14 | nit | `edd-docs/edd-state.md` (Deployment hold), `src/content/profile.ts` (`hero.tip`) | U-07 resolves the nav-anchor hold (HOME-AC-09). But the hero tip ("the city is a map. Select a building…") describes a CityMap that does not exist until U-08. | Keep the deployment hold until U-08, or hide the tip until the map ships. This is an owner call. | open |

## AC status
| AC | Status | Evidence |
|----|--------|----------|
| HOME-AC-02 | PASS (unit) | `page.test.tsx` heading order and no-skip check; 1 `h1` |
| HOME-AC-06 | Tests present, **not run by me** | `e2e/home-nojs.spec.ts`; needs the Playwright prod run in the gate record |
| HOME-AC-09 | PASS (unit); e2e pending | `page.test.tsx`: at least 8 `#` links, all resolve; nav click e2e pending |
| HOME-AC-13 | PASS | `WorkSection.test.tsx`, `format.test.ts` |
| HOME-AC-14 | PASS | `ExperienceTimeline.test.tsx` (7). Order test is weak (#12) |
| HOME-AC-15 | PASS | `HowIWork.test.tsx` |
| HOME-AC-16 | PASS, one weak assertion (#4) | `Writing.test.tsx` |
| CONT-AC-01 | PASS | exact "Not yet measured", no digit |
| CONT-AC-02 | PASS | verbatim value |
| CONT-AC-03 | PASS (unit). Not checked on the build artefact (#3) | `visible.test.ts`, `page.test.tsx` (unset, `TRUE`, `1`). No planned post exists in content (test-plan note) |
| CONT-AC-04 | PASS | `page.test.tsx` "Planned · Dec 2026" |
| CONT-AC-06 | PASS | empty state keeps `section#work` and its `h2` |
| SEO-AC-09 | Gate enforced, **not run by me**; gate under-detects (#1, #2) | `gates.yml` `enforce: true`; `content-strings.test.mjs` |
| DoD: site Tailwind `@config` | Done | `globals.css:4`, `tailwind.site.config.js`, `site-tailwind.test.mjs`. CSS size from CHANGELOG (52,241 to 9,683 bytes); not re-measured, as that needs a build |
| DoD: keep-list entries removed | Done | `check-unreachable` PASS with an empty keep list |
| DoD: CHANGELOG | Done | |
| DoD: `npm run gates` green with view-source enforced | **Open**: no `gates.md` | |

## Hard constraints
- **Copy only from `src/content`:** met. The one new string, `labels.caseStudy` "Read the case study", is in `profile.ts` and cites HOME-AC-13. Components hold only separators (`' · '`, `' – '`, `:`). check-literals PASS.
- **No email or phone:** no new contact data. The `1,000` in a post subtitle predates this unit, and CG10_pii_scan is still to run in the gate record.
- **No `"use client"`:** met (PASS).
- **Gates not weakened:** met. `view-source` went from report-only to enforced, and `gates.test.mjs` was tightened to match. No ceilings, keep entries or allow-lists were widened.
